#!/bin/bash

echo "🔍 Verificando estado de Docker..."
if ! docker ps | grep -q "scarh_backend_dev"; then
    echo "❌ El contenedor de backend no está corriendo"
    echo "Por favor ejecuta: docker-compose up -d"
    exit 1
fi

echo "✅ Backend está corriendo"
echo ""
echo "📊 Estado actual de la base de datos:"
docker exec scarh_backend_dev python manage.py shell -c "from api.models import Limnigrafo, Medicion; print(f'Limnígrafos: {Limnigrafo.objects.count()}'); print(f'Mediciones: {Medicion.objects.count()}')"
echo ""

read -p "¿Deseas importar los datos de limnígrafos? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "📥 Importando datos..."
    docker exec scarh_backend_dev python manage.py loaddata datos_limnigrafos.json
    echo ""
    echo "✅ Importación completada"
    echo ""
    echo "📊 Estado después de la importación:"
    docker exec scarh_backend_dev python manage.py shell -c "from api.models import Limnigrafo, Medicion; print(f'Limnígrafos: {Limnigrafo.objects.count()}'); print(f'Mediciones: {Medicion.objects.count()}')"
else
    echo "❌ Importación cancelada"
fi
