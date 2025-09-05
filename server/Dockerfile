# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /usr/src/app

# Copy package.json trước
COPY package*.json ./

# Cài dependencies (bao gồm dev để build và prisma)
RUN npm install

# Copy schema để prisma generate không bị lỗi
COPY prisma ./prisma

# Copy phần còn lại của code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


FROM node:22-alpine AS final
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy package.json
COPY package*.json ./

# Copy node_modules, dist, prisma, và .prisma từ build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma

EXPOSE 6112
CMD ["npm", "start"]
