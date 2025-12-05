# Sistema de Sincronización Automática de Limnígrafos

## 📋 Descripción

Este sistema mantiene sincronizados automáticamente los limnígrafos entre la base de datos de Django y el simulador en Go. Cuando se crea, actualiza o elimina un limnígrafo, el sistema actualiza el `config.yaml` del simulador y genera tokens JWT automáticamente.

## 🔄 Flujo de Sincronización

### Automático (Signals)

Cuando se crea o elimina un limnígrafo a través de:
- Django Admin
- API REST (`/limnigrafos/`)
- Shell de Django

Los **signals** se activan automáticamente y:
1. Detectan el cambio (creación/eliminación)
2. Ejecutan el comando `sincronizar_simulador` en segundo plano
3. Actualizan `config.yaml` con todos los limnígrafos activos
4. Generan tokens JWT únicos para cada limnígrafo

### Manual (Comando)

También puedes ejecutar la sincronización manualmente:

```bash
docker exec scarh_backend_dev python manage.py sincronizar_simulador
```

Este comando:
- Lee todos los limnígrafos de la BD
- Crea usuarios ficticios `limnigrafo_{id}` si no existen
- Genera tokens JWT válidos por 60 días
- Actualiza `simulator-go/config.yaml`
- Muestra resumen de cambios

## ⚠️ Reinicio del Simulador

**IMPORTANTE**: Después de sincronizar, debes reiniciar el simulador manualmente para que cargue la nueva configuración:

```bash
docker-compose restart simulator
```

El simulador no se reinicia automáticamente porque:
- Los contenedores están aislados (el backend no puede reiniciar el simulador directamente)
- Se evita interrupciones innecesarias durante desarrollo
- Permite revisar los cambios antes de aplicarlos

## 📝 Archivos Involucrados

### Backend
- `backend/api/signals.py` - Signals para detectar cambios en limnígrafos
- `backend/api/management/commands/sincronizar_simulador.py` - Comando de sincronización
- `backend/api/apps.py` - Activa los signals al iniciar Django

### Simulador
- `simulator-go/config.yaml` - Configuración leída por el simulador

## 🎯 Ejemplo de Uso

### Crear un nuevo limnígrafo

**Opción 1: API**
```bash
curl -X POST http://localhost:8000/limnigrafos/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "LM99",
    "descripcion": "Limnígrafo Test",
    "memoria": 1024,
    "bateria_min": 10.0,
    "bateria_max": 13.0,
    "tiempo_advertencia": "00:05:00",
    "tiempo_peligro": "00:20:00"
  }'
```

**Opción 2: Django Admin**
1. Acceder a http://localhost:8000/admin/
2. Ir a "Limnígrafos" → "Agregar limnígrafo"
3. Completar formulario y guardar

**Resultado:**
```
🆕 Nuevo limnígrafo creado: LM99 (ID: 7)
🔄 Iniciando sincronización de limnígrafos...
📊 Limnígrafos en BD: 7
  ✅ LM1 (ID: 1) - Batería: 10.5V-13.0V
  ✅ LM2 (ID: 2) - Batería: 10.5V-13.0V
  ...
  ✅ LM99 (ID: 7) - Batería: 10.0V-13.0V
✅ Config.yaml actualizado con 7 limnígrafos
```

**Reiniciar simulador:**
```bash
docker-compose restart simulator
```

**Verificar:**
```bash
docker logs scarh_simulator --tail 20
```

Deberías ver:
```
[INFO] Limnígrafos configurados: 7
[INFO] Limnígrafo ID=99 (token=eyJ...)
[INFO] Limnígrafo #99 iniciado (prob. falla: 10.0%, duración: 20min)
```

### Eliminar un limnígrafo

**API:**
```bash
curl -X DELETE http://localhost:8000/limnigrafos/7/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Django Admin:**
1. Ir a "Limnígrafos"
2. Seleccionar limnígrafo
3. Click en "Eliminar"

**Resultado:**
```
🗑️  Limnígrafo eliminado: LM99 (ID: 7)
🔄 Sincronización automática iniciada...
✅ Config.yaml actualizado con 6 limnígrafos
```

**Reiniciar simulador:**
```bash
docker-compose restart simulator
```

## 🔧 Configuración

### Valores por defecto del simulador

Cuando un limnígrafo se sincroniza, se usan estos valores:

```yaml
altura_min: 0.5          # metros
altura_max: 3.5          # metros
temperatura_min: -5      # °C
temperatura_max: 25      # °C
presion_min: 950         # hPa
presion_max: 1050        # hPa
bateria_min: [de la BD]  # voltios
bateria_max: [de la BD]  # voltios
probabilidad_falla: 0.10 # 10% probabilidad
duracion_falla_min: 20   # minutos
```

Para personalizar estos valores, editar el comando en:
`backend/api/management/commands/sincronizar_simulador.py` línea 64-74

### Tokens JWT

- **Duración**: 60 días (configurado en `settings.py`)
- **Usuario**: Se crea automáticamente como `limnigrafo_{id}`
- **Email**: `limnigrafo_{id}@simulator.internal`
- **Renovación**: Ejecutar `python manage.py sincronizar_simulador` genera nuevos tokens

## 🐛 Troubleshooting

### El simulador no envía datos del nuevo limnígrafo

1. Verificar que el limnígrafo existe en la BD:
   ```bash
   docker exec scarh_backend_dev python manage.py shell -c "from api.models import Limnigrafo; print(Limnigrafo.objects.values_list('id', 'codigo'))"
   ```

2. Verificar que está en config.yaml:
   ```bash
   docker exec scarh_simulator cat config.yaml | grep "id:"
   ```

3. Si no está, sincronizar manualmente:
   ```bash
   docker exec scarh_backend_dev python manage.py sincronizar_simulador
   docker-compose restart simulator
   ```

### Error "duplicate key value violates unique constraint"

El usuario `limnigrafo_{id}` ya existe. Esto es normal si ya sincronizaste antes. El comando usa `get_or_create` así que no debería fallar, pero si falla:

```bash
docker exec scarh_backend_dev python manage.py shell -c "from api.models import Usuario; Usuario.objects.filter(username__startswith='limnigrafo_').delete()"
```

Luego volver a sincronizar.

### El config.yaml no se actualiza

Verificar que PyYAML está instalado:
```bash
docker exec scarh_backend_dev pip list | grep -i yaml
```

Si no está:
```bash
docker-compose down
docker-compose up -d --build
```

## 📚 Referencias

- **Signals de Django**: https://docs.djangoproject.com/en/5.2/topics/signals/
- **JWT Tokens**: https://django-rest-framework-simplejwt.readthedocs.io/
- **YAML en Python**: https://pyyaml.org/wiki/PyYAMLDocumentation
