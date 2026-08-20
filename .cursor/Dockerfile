FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        python3 \
        python3-pip \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 (used by MCP servers and tooling)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Bun for the CLI installer and Tend runtime
ENV BUN_INSTALL=/home/ubuntu/.bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

RUN useradd -m -s /bin/bash ubuntu
USER ubuntu
WORKDIR /home/ubuntu
