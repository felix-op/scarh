# Importar Datos de Limnígrafos

Este archivo contiene instrucciones para importar los datos de limnígrafos en tu base de datos local.

## Problema Actual

La base de datos es **LOCAL** (cada desarrollador tiene su propia BD en Docker). Por eso no ves los limnígrafos que otros crearon.

## Solución: Importar datos compartidos

### Paso 0: Configurar variables de entorno

**Backend:**
```bash
cp .env.sample .env
```

**Frontend:**
```bash
cd frontend
cp .env.local.sample .env.local
```

### Paso 1: Asegúrate de tener el proyecto corriendo

```bash
docker-compose up -d
```

### Paso 2: Importar los datos

Desde la raíz del proyecto, ejecuta:

```bash
docker exec scarh_backend_dev python manage.py loaddata datos_limnigrafos.json
```

Este comando importará:
- 7 Limnígrafos (LM1, LM2, LM3, LM4, LM5, LM10, LM11)
- Todas sus mediciones
- Ubicaciones
- Sectores de río
- Rutas de acceso

### Paso 3: Verificar la importación

```bash
docker exec scarh_backend_dev python manage.py shell -c "from api.models import Limnigrafo; print(f'Total: {Limnigrafo.objects.count()}')"
```

Deberías ver: `Total: 7`

## Soluciones a Largo Plazo

### Opción A: Base de datos compartida (Recomendado para producción)

Usar un servicio de BD en la nube:
- **Supabase** (gratis, fácil de configurar)
- **AWS RDS** (escalable)
- **Google Cloud SQL**
- **Railway** (simple para desarrollo)

### Opción B: Servidor de desarrollo compartido

Usar el backend de un miembro del equipo como servidor central:
- Exponer con **ngrok**: `ngrok http 8000`
- O usar **Cloudflare Tunnel**
- Todos apuntan al mismo backend

### Opción C: Exportar/Importar periódicamente

Cuando alguien agregue datos:
1. Exportar: `docker exec scarh_backend_dev python manage.py dumpdata api --indent 2 > datos_nuevos.json`
2. Subir a Git o compartir el archivo
3. Los demás importan: `docker exec scarh_backend_dev python manage.py loaddata datos_nuevos.json`

## Notas

- El archivo `datos_limnigrafos.json` contiene **todos** los datos hasta la fecha de exportación
- Si ya tienes datos locales, la importación puede crear duplicados (usa `--exclude` si es necesario)
- Para empezar de cero: borra el volumen de Docker y vuelve a crear la BD

```bash
docker-compose down -v
docker-compose up -d
docker exec scarh_backend_dev python manage.py loaddata datos_limnigrafos.json
```
