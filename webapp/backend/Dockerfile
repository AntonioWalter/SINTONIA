FROM node:20-alpine

WORKDIR /app

# Copiamo i file dei pacchetti
COPY package*.json ./

# Installiamo le dipendenze
RUN npm install

# Copiamo la cartella dist (che contiene la sottocartella src)
COPY dist ./dist

# Espone la porta
EXPOSE 3000

# IL COMANDO CORRETTO: punta alla sottocartella src
CMD ["node", "dist/src/main"]