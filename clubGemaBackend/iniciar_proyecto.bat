@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo Iniciando GemaAcademy API - Antigravity Launcher
echo =======================================================

cd /d "%~dp0"

:: 1. Verificar si Docker esta instalado y corriendo
echo [1/5] Verificando Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker no esta instalado o no se encuentra en el PATH.
    pause
    exit /b
)

:: 2. Levantar servicios de docker-compose (PostgreSQL)
echo [2/5] Levantando Base de Datos en Docker...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo al iniciar los contenedores de Docker.
    pause
    exit /b
)

:: 3. Esperar un par de segundos para que PostgreSQL acepte conexiones
echo Esperando a que PostgreSQL este listo...
timeout /t 3 /nobreak >nul

:: 4. Sincronizar Prisma
echo [3/5] Sincronizando Prisma con la Base de Datos...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo al generar el cliente de Prisma.
    pause
    exit /b
)

call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo al sincronizar la base de datos con Prisma db push.
    pause
    exit /b
)

:: Poblar la BD si está vacía
echo Poblando base de datos con Catálogos y Roles...
call npm run db:seed

:: 5. Iniciar DBeaver
echo [4/5] Iniciando DBeaver y conectando a Gema Academy DB...

if not exist ".env" (
    echo [ERROR] No se encontro el archivo .env en %~dp0
    echo Omitiendo inicio de DBeaver...
    goto skip_dbeaver
)

:: Leer y establecer variables de entorno desde el archivo .env
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    set "LINE=%%A"
    :: Ignorar lineas que empiezan con # y lineas vacias
    if not "!LINE!" == "" (
        if "!LINE:~0,1!" neq "#" (
            set "%%A=%%B"
        )
    )
)

:: Limpiar espacios en blanco al final o posibles retornos de carro
:: Y quitar comillas si el valor en el env las tiene
set "DB_PASSWORD=%DB_PASSWORD:"=%"
set "DB_USER=%DB_USER:"=%"
set "DB_HOST=%DB_HOST:"=%"
set "DB_PORT=%DB_PORT:"=%"
set "DB_NAME=%DB_NAME:"=%"

:: Validar si cargo las variables esenciales
if "%DB_USER%"=="" (
    echo [ERROR] No se pudo leer DB_USER de .env
    echo Omitiendo inicio de DBeaver...
    goto skip_dbeaver
)

:: Cadena de conexion para DBeaver
set CONNECTION_STRING="driver=postgresql|host=%DB_HOST%|port=%DB_PORT%|database=%DB_NAME%|user=%DB_USER%|password=%DB_PASSWORD%"

:: Buscar DBeaver en rutas comunes e iniciarlo con la conexion configurada
if exist "%ProgramFiles%\DBeaver\dbeaver.exe" (
    start "" "%ProgramFiles%\DBeaver\dbeaver.exe" -con %CONNECTION_STRING%
    goto dbeaver_started
)

if exist "%LOCALAPPDATA%\DBeaver\dbeaver.exe" (
    start "" "%LOCALAPPDATA%\DBeaver\dbeaver.exe" -con %CONNECTION_STRING%
    goto dbeaver_started
)

:: Si esta en el PATH global
where dbeaver >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" dbeaver -con %CONNECTION_STRING%
    goto dbeaver_started
)

echo [ADVERTENCIA] No se pudo encontrar DBeaver en tu sistema.
echo Por favor, asegurate de tenerlo instalado o edita este archivo
echo agregando la ruta exacta donde lo instalaste.

:dbeaver_started
:skip_dbeaver

:: 6. Iniciar Servidor Node Backend
echo [5/5] Iniciando el servidor de desarrollo...
echo =======================================================
call node --watch --env-file=.env src/index.js

pause
