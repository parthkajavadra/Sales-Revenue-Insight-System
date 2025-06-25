from django.urls import path
from .views import UploadCSVAPIView, SalesSummaryAPIView, SalesChartAPIView, UploadHistoryAPIView, AdminAllSalesAPIView, AdminUploadHistoryAPIView,SalesAnalyticsAPIView, ExportSalesCSVAPIView, ExportSalesPDFAPIView

urlpatterns = [
    path('upload/', UploadCSVAPIView.as_view(), name='upload_csv'),
    path('summary/', SalesSummaryAPIView.as_view(), name='sales_summary'),
    path('charts/', SalesChartAPIView.as_view(), name='sales-chart'),
    path('upload-history/', UploadHistoryAPIView.as_view(), name='upload-history'),
    path('admin/all-sales/', AdminAllSalesAPIView.as_view(), name='admin_all_sales'),
    path('admin/upload-history/', AdminUploadHistoryAPIView.as_view(), name='admin-upload-history'),
    path('analytics/', SalesAnalyticsAPIView.as_view(), name='sales-analytics'),
    path('export/csv/', ExportSalesCSVAPIView.as_view(), name='export-sales-csv'),
    path('export/pdf/', ExportSalesPDFAPIView.as_view(), name='export-sales-pdf'),
]

