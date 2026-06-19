# Usamos una imagen ligera de Node.js
FROM node:18-alpine

# Instalamos OpenSSL para Prisma 
RUN apk add --no-cache openssl

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del backend
COPY . .

# Generamos el cliente de Prisma
RUN npx prisma generate

# Exponemos el puerto del Back
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]