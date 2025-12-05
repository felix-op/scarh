# SCARH - Sistema de Control y Análisis de Recursos Hídricos

Sistema para monitoreo y análisis de limígrafos con simulador de datos en tiempo real.

## 🚀 Inicio Rápido (Recomendado)

### Requisitos Previos
- Docker y Docker Compose instalados
- Git

### Configuración Inicial

1. **Clonar el repositorio**
```bash
git clone https://github.com/felix-op/scarh.git
cd scarh
```

2. **Configurar variables de entorno**

**Backend:**
```bash
cp .env.sample .env
```

**Frontend:**
```bash
cd frontend
cp .env.local.sample .env.local
cd ..
```

3. **Levantar todos los servicios con Docker Compose**
```bash
docker-compose up -d
```

Esto iniciará:
- 🗄️ Base de datos PostgreSQL con PostGIS en `localhost:5433`
- 🐍 Backend Django en `http://localhost:8000`
- 📊 Simulador de datos (Go) generando mediciones automáticamente

4. **Importar datos de ejemplo**
```bash
docker exec scarh_backend_dev python manage.py loaddata datos_limnigrafos.json
```

O usando el script:
```bash
bash importar_datos.sh
```

Esto cargará:
- ✅ 7 Limígrafos (LM1-LM5, LM10, LM11)
- ✅ Miles de mediciones históricas
- ✅ Ubicaciones y sectores de río
- ✅ Rutas de acceso

5. **Iniciar el frontend (en otra terminal)**
```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### Credenciales por Defecto

**Admin Django:**
- Usuario: `admin`
- Contraseña: `super-secure-password`

Accede al panel admin en: `http://localhost:8000/admin`

---

## 📊 Verificación del Sistema

### Verificar Backend
```bash
curl http://localhost:8000/api/limnigrafos/
```

### Verificar Base de Datos
```bash
docker exec scarh_backend_dev python manage.py shell -c "from api.models import Limnigrafo; print(f'Total: {Limnigrafo.objects.count()}')"
```

### Verificar Simulador
El simulador enviará mediciones cada 10 segundos a todos los limígrafos configurados en `simulator-go/config.yaml`.

**Nota importante:** Los tokens en `config.yaml` pueden expirar. Si el simulador no envía datos:
1. Inicia sesión en el admin de Django: http://localhost:8000/admin
2. Genera nuevos tokens para los usuarios de los limígrafos
3. Actualiza `simulator-go/config.yaml` con los nuevos tokens

O desactiva temporalmente el simulador si solo quieres ver los datos importados:
```bash
docker-compose stop simulator
```

---

## 🛠️ Desarrollo Local (Sin Docker)

Si prefieres desarrollar sin Docker:

### Backend

1. **Crear entorno virtual**
```bash
cd backend
python -m venv .venv
```

2. **Activar entorno virtual**
- Windows: `.venv\Scripts\activate`
- Linux/Mac: `source .venv/bin/activate`

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar PostgreSQL local**
Asegúrate de tener PostgreSQL con PostGIS instalado y crea una base de datos:
```sql
CREATE DATABASE scarh_db;
CREATE EXTENSION postgis;
```

5. **Realizar migraciones**
```bash
python manage.py migrate
python manage.py createsuperuser_from_env
```

6. **Iniciar servidor**
```bash
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Actualizar Datos

### Exportar datos actuales
```bash
docker exec scarh_backend_dev python manage.py dumpdata api.Limnigrafo api.Medicion api.Ubicacion api.SectorRio api.RutaAcceso --indent 2 > datos_limnigrafos.json
git add datos_limnigrafos.json
git commit -m "actualizar datos de limnigrafos"
git push
```

### Importar datos actualizados
```bash
git pull
docker exec scarh_backend_dev python manage.py loaddata datos_limnigrafos.json
```

---

## 🐛 Solución de Problemas

### Los contenedores no inician
```bash
docker-compose down -v
docker-compose up -d
```

### Base de datos vacía después de levantar
```bash
docker exec scarh_backend_dev python manage.py loaddata datos_limnigrafos.json
```

### El simulador no envía datos
Verifica la configuración en `simulator-go/config.yaml` y que el backend esté accesible desde el contenedor.

### Frontend no conecta con backend
Verifica que `API_URL` en `.env.local` del frontend apunte a `http://localhost:8000/`

---

## 📦 Comandos Útiles de Docker

```bash
# Ver logs del backend
docker logs scarh_backend_dev -f

# Ver logs del simulador
docker logs scarh_simulator -f

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la BD)
docker-compose down -v

# Reconstruir imágenes
docker-compose up -d --build
```

---

## 🗂️ Estructura del Proyecto

```
scarh/
├── backend/              # Django + Django REST Framework
│   ├── api/             # API y modelos
│   ├── core/            # Configuración Django
│   └── manage.py
├── frontend/            # Next.js + React
│   ├── app/            # Rutas y páginas
│   ├── shared/         # Componentes compartidos
│   └── public/
├── simulator-go/        # Simulador de datos en Go
│   ├── config.yaml     # Configuración del simulador
│   └── main.go
├── docker-compose.yml   # Configuración de servicios
├── datos_limnigrafos.json  # Datos de ejemplo
└── README.md
```

---

## 📚 Documentación Adicional

- **API Backend:** `http://localhost:8000/api/docs/` (Swagger)
- **Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Django REST Framework:** [https://www.django-rest-framework.org/](https://www.django-rest-framework.org/)

---

## 👥 Compartir Datos con el Equipo

Ver instrucciones detalladas en [IMPORTAR_DATOS.md](./IMPORTAR_DATOS.md)

**Resumen:**
1. La BD es local por defecto (cada desarrollador tiene su propia copia)
2. Usa `datos_limnigrafos.json` para compartir datos entre el equipo
3. Para producción, considera usar una BD en la nube (Supabase, AWS RDS, etc.)

---

## 📝 Notas

- Puerto backend: `8000`
- Puerto frontend: `3000`
- Puerto PostgreSQL: `5433` (para evitar conflictos con instalaciones locales)
- El simulador genera datos automáticamente cada 10 segundos
- Los datos importados incluyen mediciones históricas realistas
