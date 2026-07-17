from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_rutas_acceso_limnigrafos'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE api_rutaacceso
                ALTER COLUMN track TYPE text
                USING NULL;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
