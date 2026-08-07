import json

from django.core.management.base import BaseCommand
from rest_framework_api_key.models import APIKey

from api.models import Limnigrafo


class Command(BaseCommand):
    """Genera una API Key nueva por limnígrafo y las imprime en JSON.

    Es lo que consume `cli.py` para sincronizar el `config.yaml` del simulador. El comando
    **no escribe** ningún archivo del simulador: sólo emite los datos. Quien los escribe es
    el CLI, que corre en el host y sí ve la carpeta `simulator-go/`.

    Ojo con la unidad de autenticación: el dispositivo se identifica por el **nombre** de su
    API Key (`LMG-{id}_...`), que es lo que parsea `MedicionSerializer.validate`. El campo
    `Limnigrafo.token_hash` es otro mecanismo, hoy sin uso.

    Regenerar invalida la clave anterior del mismo limnígrafo, igual que
    `POST /limnigrafos/{id}/generate_key/`.
    """

    help = "Genera una API Key nueva para cada limnígrafo y las imprime en JSON."

    def add_arguments(self, parser):
        parser.add_argument(
            "--codigo",
            action="append",
            dest="codigos",
            help="Limitar a estos códigos de limnígrafo. Se puede repetir.",
        )

    def handle(self, *args, **opciones):
        limnigrafos = Limnigrafo.objects.all().order_by("id")
        if opciones.get("codigos"):
            limnigrafos = limnigrafos.filter(codigo__in=opciones["codigos"])

        claves = []
        for limnigrafo in limnigrafos:
            # El `_` al final del prefijo importa: sin él, sincronizar el limnígrafo 1
            # borraría también las claves de los limnígrafos 10, 11, 12...
            prefijo = f"LMG-{limnigrafo.id}_"
            APIKey.objects.filter(name__startswith=prefijo).delete()

            nombre = f"{prefijo}{limnigrafo.codigo}_{limnigrafo.descripcion[:10]}"
            _, secreto = APIKey.objects.create_key(name=nombre)

            claves.append(
                {
                    "id": limnigrafo.id,
                    "codigo": limnigrafo.codigo,
                    "token": secreto,
                }
            )

        self.stdout.write(json.dumps(claves))
