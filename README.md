# scarh
Sistema de Control y Análisis de Recursos Hídricos.

# Inicializar base de datos local

1. Ejecutar posgresql o pgadmin.

# Inicializar backend local

1. Crear entorno virtual: python -m venv .venv
2. Activar entorno virtual:
    - Windows: ./venv/bin/activate.bat
    - Linux: source .venv/bin/activate
3. Instalar dependecias: pip install -r requirements.txt
4. Realizar migraciones: python manage.py runserver
5. Iniciar servidor: python manage.py runserver

# Inicializar frontend local

1. Instalar dependencias: npm install
2. Iniciar servidor: npm run dev
3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Documentación de Frontend

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

# Docker compose comandos
- Prod:
docker-compose -f docker compose.yml up --build -d

# Arreglos por las imágenes
docker system prune

docker compose -f compose.dev.yml down --remove-orphans
docker rm -f nombre-contendor 2>/dev/null || true

# borra overrides autogenerados de features
rm -f ~/.config/Code/User/globalStorage/ms-vscode-remote.remote-containers/data/docker-compose/docker-compose.devcontainer.*.yml

# en VS Code: “Dev Containers: Rebuild without cache”
# o desde CLI:
docker compose -f compose.dev.yml build --no-cache
docker compose -f compose.dev.yml up -d