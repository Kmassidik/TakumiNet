# pt-web — static Rust binary in a minimal runtime image.
#
# Packet Tracer assets are NEVER baked into the image (Cisco EULA).
# Mount them read-only at /assets at run time:
#   docker run --rm -p 3000:3000 \
#     -v "$PWD/intake/20261101-102334/appimage/opt/pt:/assets:ro" pt-web

FROM rust:1.97-slim AS build
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked && strip target/release/pt-web

FROM debian:bookworm-slim
RUN useradd --system --uid 10001 --no-create-home pt
WORKDIR /app
COPY --from=build /src/target/release/pt-web /app/pt-web
COPY web /app/web
ENV HOST=0.0.0.0 \
    PORT=3000 \
    WEB_ROOT=/app/web \
    ASSET_ROOT=/assets
USER pt
EXPOSE 3000
ENTRYPOINT ["/app/pt-web"]
