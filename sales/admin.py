from django.contrib import admin
from .models import Sale

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('date', 'product', 'category', 'region', 'quantity', 'unit_price', 'revenue')
    list_filter = ('category', 'region', 'date')
    search_fields = ('product', 'category', 'region')
