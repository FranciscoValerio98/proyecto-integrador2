# Usamos una imagen ligera de Node.js
FROM node:22-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el código fuente
COPY . .

# Exponemos el puerto del Front
EXPOSE 5173

# Iniciamos Vite exponiendo el host para que sea accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]