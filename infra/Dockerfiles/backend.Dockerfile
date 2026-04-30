FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y \
    python3 python3-pip curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package.json ./
RUN npm install

COPY backend/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

COPY backend/ ./
RUN mkdir -p models logs

EXPOSE 5000
CMD ["node", "server.js"]


