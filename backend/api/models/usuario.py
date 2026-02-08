from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    email = models.EmailField(unique=True)
    legajo = models.CharField(max_length=50, blank=True, default="")

    def __str__(self):
        return self.username
