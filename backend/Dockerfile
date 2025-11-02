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

# NOU: Îi spunem lui Puppeteer unde să salveze browser-ul.
    # Această cale TREBUIE să fie identică cu cea la care atașăm discul pe Render.
    ENV PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
    
    # 4. Copiem fișierele de pachete
    COPY package.json package-lock.json ./
    
    # 5. Instalăm pachetele Node.js (inclusiv puppeteer)
    RUN npm install
    
    # NOU: Instalăm browserul Chrome în locația cache
    RUN npx puppeteer browsers install chrome
    
    # 6. Copiem restul codului aplicației
    COPY . .
    
EXPOSE 3000

# 9. Comanda care pornește aplicația
CMD ["sh", "-c", "npx prisma generate && node src/app.js"]