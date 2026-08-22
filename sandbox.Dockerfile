# Secure code-execution sandbox for the agent.
#
# Base image is oven/bun. Its default user is UID 1000 / GID 1000 (named "bun"),
# which matches the non-root `user: "1000:1000"` directive in docker-compose.yaml.
# We install the executables that appear on the execute_command whitelist so that
# commands actually resolve inside the container.
FROM oven/bun:1

USER root

# Install the allowed executables: git, nodejs (npm/npx ride on it), python.
# apt lists are removed to keep the image lean.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        nodejs \
        npm \
        python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Drop back to the non-root "bun" user (UID 1000).
USER bun

# The container is kept alive only so `docker compose exec` can run commands in
# it. It exposes nothing and does nothing on its own.
CMD ["tail", "-f", "/dev/null"]