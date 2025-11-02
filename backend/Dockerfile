# 1. Pornim de la o imagine oficială Node.js 18 (slim e mai mică)
FROM node:18-slim

# 2. Setăm directorul de lucru în interiorul containerului
WORKDIR /app

# 3. Instalăm dependențele de sistem OBLIGATORII pentru ca browserul Chrome să poată rula pe Linux
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends

# 4. Copiem fișierele de pachete
COPY package.json package-lock.json ./

# 5. Instalăm pachetele Node.js (inclusiv puppeteer, care va descărca browserul)
RUN npm install

# 6. Copiem restul codului aplicației
COPY . .

# 8. Expunem portul pe care va rula aplicația
EXPOSE 3000

# 9. Comanda care pornește aplicația
CMD ["sh", "-c", "npx prisma generate && node src/app.js"]