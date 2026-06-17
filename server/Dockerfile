FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json ./
RUN pnpm install --prod=false

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json ./
RUN pnpm install --prod
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/modules/guessword/data ./dist/modules/guessword/data
EXPOSE 3000
CMD ["pnpm", "start"]
