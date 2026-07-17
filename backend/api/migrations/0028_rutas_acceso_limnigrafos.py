from django.db import migrations, models
import django.db.models.deletion


def asociar_rutas_por_ubicacion(apps, schema_editor):
    RutaAcceso = apps.get_model('api', 'RutaAcceso')
    Limnigrafo = apps.get_model('api', 'Limnigrafo')

    for ruta in RutaAcceso.objects.filter(limnigrafo__isnull=True).exclude(ubicacion_id__isnull=True):
        limnigrafos = list(Limnigrafo.objects.filter(ubicacion_id=ruta.ubicacion_id)[:2])
        if len(limnigrafos) == 1:
            ruta.limnigrafo_id = limnigrafos[0].id
            ruta.save(update_fields=['limnigrafo'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_remove_limnigrafo_sector_rio_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='rutaacceso',
            old_name='tipo',
            new_name='tipo_acceso',
        ),
        migrations.AlterField(
            model_name='rutaacceso',
            name='distancia_km',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='rutaacceso',
            name='ubicacion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='rutas_acceso', to='api.ubicacion'),
        ),
        migrations.AddField(
            model_name='rutaacceso',
            name='formato_origen',
            field=models.CharField(blank=True, choices=[('gpx', 'GPX'), ('kml', 'KML')], max_length=3),
        ),
        migrations.AddField(
            model_name='rutaacceso',
            name='archivo_original',
            field=models.FileField(blank=True, null=True, upload_to='rutas_acceso/'),
        ),
        migrations.AddField(
            model_name='rutaacceso',
            name='geometria',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='rutaacceso',
            name='limnigrafo',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rutas_acceso', to='api.limnigrafo'),
        ),
        migrations.AddField(
            model_name='rutaacceso',
            name='creado_en',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='rutaacceso',
            name='actualizado_en',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.RunPython(asociar_rutas_por_ubicacion, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='rutaacceso',
            name='creado_en',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='rutaacceso',
            name='actualizado_en',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
