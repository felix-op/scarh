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

# Docker compose comandos
- Dev:
docker-compose -f docker compose.dev.yml up --build
- Prod:
docker-compose -f docker compose.yml up --build -d
# crear .env con datos genericos en carpeta backend
DB_NAME=scarh_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DEBUG=True
SECRET_KEY='ejemplo'
