# arm64 version
FROM lukechannings/deno:v1.37.2

# amd64 version
# FROM denoland/deno:1.37.2

WORKDIR /app

ADD . .
RUN deno cache src/main.ts

VOLUME ./app:/app

CMD ["run", "-A", "src/main.ts"]