FROM mcr.microsoft.com/vscode/devcontainers/base:debian

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN \
    apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ffmpeg \
        libpcap-dev \
        libudev-dev \
        libyaml-dev \
        libxml2 \
        cmake \
        autoconf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

USER vscode

RUN uv python install 3.14

WORKDIR /workspaces
