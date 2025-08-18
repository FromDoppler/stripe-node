# Usa la imagen oficial de Node.js 18
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia la aplicación al contenedor
COPY . .

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE ${PORT}

CMD ["npm", "start"]