# =========================
# Build
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY Server/server.csproj Server/

RUN dotnet restore Server/server.csproj

COPY Server/ Server/

WORKDIR /src/Server

RUN dotnet publish server.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# =========================
# Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

CMD ["sh", "-c", "dotnet server.dll --urls http://0.0.0.0:${PORT:-8080}"]
