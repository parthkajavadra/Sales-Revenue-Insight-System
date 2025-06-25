from django.db import models
from django.conf import settings

class Sale(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    date = models.DateField()
    product = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    region = models.CharField(max_length=50)
    quantity = models.IntegerField()
    unit_price = models.FloatField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255, default='')

    @property
    def revenue(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.date} - {self.product} ({self.quantity} pcs)"

    class Meta:
        unique_together = ('date', 'product', 'user')  


class UploadHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    records_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.filename} at {self.uploaded_at}"
    
