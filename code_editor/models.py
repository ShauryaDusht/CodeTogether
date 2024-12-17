from django.db import models
from django.contrib.auth.models import User

class CodeRoom(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    language = models.CharField(max_length=20, default='python')
    
    def __str__(self):
        return self.name