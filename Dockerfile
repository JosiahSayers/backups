FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json /app/

RUN npm i
COPY . /app
RUN npm run build

FROM node:18-alpine
RUN apk add --no-cache postgresql-client
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package-lock.json /app/
RUN npm ci
ENV NODE_ENV production
CMD ["npm", "start"]
