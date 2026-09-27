# =========================================================
# 1. Build Angular frontend
# =========================================================
FROM node:22 AS frontend-build

WORKDIR /src/client

# Copy package files first for better Docker caching
COPY client/package*.json ./

# Install Angular dependencies
RUN npm ci

# Copy Angular source
COPY client/ ./

# Build Angular production application
RUN npm run build -- --configuration production

# Find Angular index.html and prepare frontend output
RUN set -eux; \
    DIST_DIR="$(find www -type f -name index.html -print -quit | xargs -r dirname)"; \
    if [ -z "$DIST_DIR" ]; then \
        echo "ERROR: Angular index.html was not found inside client/www"; \
        exit 1; \
    fi; \
    echo "Angular build directory: $DIST_DIR"; \
    mkdir -p /frontend; \
    cp -R "$DIST_DIR"/. /frontend/


# =========================================================
# 2. Build .NET 10 backend
# =========================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build

WORKDIR /src

# Copy project file first for Docker caching
COPY Server/server.csproj Server/

# Restore .NET dependencies
RUN dotnet restore Server/server.csproj

# Copy backend source
COPY Server/ Server/

WORKDIR /src/Server

# Publish .NET application
RUN dotnet publish server.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# =========================================================
# 3. Final application
# =========================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Copy .NET published application
COPY --from=backend-build /app/publish .

# Copy Angular production files into ASP.NET wwwroot
COPY --from=frontend-build /frontend ./wwwroot

# Voroa supplies PORT
EXPOSE 8080

# Start ASP.NET Core
CMD ["sh", "-c", "dotnet server.dll --urls http://0.0.0.0:${PORT:-8080}"]
