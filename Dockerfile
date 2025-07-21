# Use the official Bun image
FROM oven/bun:1 as base

# Set the working directory
WORKDIR /app

# Copy package.json and lockfile (if exists)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy Prisma schema first for client generation
COPY prisma ./prisma/

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the source code
COPY . .

# Create a non-root user for security (Ubuntu/Debian commands)
RUN groupadd -r -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs -m -s /bin/bash bun

# Change ownership of the app directory to the bun user
RUN chown -R bun:nodejs /app

# Switch to the non-root user
USER bun

# Expose the port the app runs on
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun --version > /dev/null || exit 1

# Command to run the application
CMD ["bun", "run", "index.ts"]
