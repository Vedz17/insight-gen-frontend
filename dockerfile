# 1. Base Image: Next.js ke liye Node 20 ka lightweight version
FROM node:20-alpine

# 2. Container ke andar '/app' folder set karo
WORKDIR /app

# 3. Pehle sirf package.json copy karo dependencies ke liye
COPY package*.json ./

# 4. Saare npm packages install karo
RUN npm install

# 5. Ab apna saara frontend code copy karo
COPY . .

# 6. Next.js app ko production ke liye BUILD karo
RUN npm run build

# 7. Container ka port 3000 open karo
EXPOSE 3000

# 8. App ko start karne ka command
CMD ["npm", "start"]