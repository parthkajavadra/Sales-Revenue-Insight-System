from rest_framework import serializers
from .models import Sale, UploadHistory

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

class UploadHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadHistory
        fields = ['id', 'filename', 'uploaded_at', 'records_count']