from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from collections import defaultdict
from datetime import datetime
from .models import Sale
import pandas as pd
import io
import csv
from io import BytesIO
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from .serializers import UploadHistorySerializer
from rest_framework.permissions import IsAdminUser
from .models import Sale, UploadHistory  
from django.db.models import Sum, F, FloatField
from django.http import HttpResponse

# sales/views.py

import pandas as pd
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Sale, UploadHistory

class UploadCSVAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        csv_file = request.FILES.get('file')

        if not csv_file or not csv_file.name.endswith('.csv'):
            return Response({'error': 'Valid CSV file required'}, status=400)

        try:
            # Read CSV using pandas
            df = pd.read_csv(io.StringIO(csv_file.read().decode('utf-8')))

            # Ensure required columns exist
            expected_columns = ['Date', 'Product', 'Category', 'Region', 'Quantity', 'Unit_Price']
            if not all(col in df.columns for col in expected_columns):
                return Response({'error': 'CSV format is incorrect'}, status=400)

            # Clean and convert data
            df = df[expected_columns].dropna()
            df['Quantity'] = pd.to_numeric(df['Quantity'], errors='coerce').fillna(0).astype(int)
            df['Unit_Price'] = pd.to_numeric(df['Unit_Price'], errors='coerce').fillna(0.0).astype(float)
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce').dt.date
            df = df.dropna(subset=['Date'])  # remove invalid dates

            count = 0
            for _, row in df.iterrows():
                Sale.objects.update_or_create(
                    date=row['Date'],
                    product=row['Product'],
                    user=user,
                    defaults={
                        'category': row['Category'],
                        'region': row['Region'],
                        'quantity': row['Quantity'],
                        'unit_price': row['Unit_Price'],
                    }
                )
                count += 1

            # Log upload history
            UploadHistory.objects.create(
                user=user,
                filename=csv_file.name,
                records_count=count
            )

            return Response({'message': f'✅ Uploaded {count} records successfully'}, status=201)

        except Exception as e:
            return Response({'error': f'❌ Error during upload: {str(e)}'}, status=500)


class SalesSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            sales = Sale.objects.filter(user=request.user)  # ✅ Filter by user

            total_revenue = sum(s.revenue for s in sales)
            total_orders = sales.count()

            top_product = (
                sales.values("product")
                .annotate(total_quantity=Sum("quantity"))
                .order_by("-total_quantity")
                .first()
            )

            top_region = (
                sales.values("region")
                .annotate(total_sales=Sum("quantity"))
                .order_by("-total_sales")
                .first()
            )

            return Response({
                "total_revenue": round(total_revenue, 2),
                "total_orders": total_orders,
                "top_product": top_product["product"] if top_product else "N/A",
                "top_region": top_region["region"] if top_region else "N/A"
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SalesChartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            sales = Sale.objects.filter(user=request.user).order_by('date')  # ✅ Filter by user

            revenue_by_date = defaultdict(float)
            for sale in sales:
                date_str = sale.date.strftime('%Y-%m-%d')
                revenue_by_date[date_str] += sale.revenue

            revenue_over_time = [
                {'date': k, 'revenue': v} for k, v in revenue_by_date.items()
            ]

            product_sales = (
                sales.values('product')
                .annotate(quantity=Sum('quantity'))
                .order_by('-quantity')
            )
            region_sales = (
                sales.values('region')
                .annotate(quantity=Sum('quantity'))
                .order_by('-quantity')
            )

            return Response({
                'revenue_over_time': revenue_over_time,
                'product_sales': list(product_sales),
                'region_sales': list(region_sales)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UploadHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = UploadHistory.objects.filter(user=request.user).order_by('-uploaded_at')
        serializer = UploadHistorySerializer(history, many=True)
        return Response(serializer.data)
    
class AdminAllSalesAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        sales = Sale.objects.select_related('user').all()

        # Filtering logic
        user_id = request.GET.get('user_id')
        product = request.GET.get('product')
        region = request.GET.get('region')
        date_from = request.GET.get('from')
        date_to = request.GET.get('to')

        if user_id:
            sales = sales.filter(user_id=user_id)
        if product:
            sales = sales.filter(product__icontains=product)
        if region:
            sales = sales.filter(region__icontains=region)
        if date_from:
            sales = sales.filter(date__gte=parse_date(date_from))
        if date_to:
            sales = sales.filter(date__lte=parse_date(date_to))

        data = [
            {
                'user': sale.user.username,
                'product': sale.product,
                'category': sale.category,
                'region': sale.region,
                'quantity': sale.quantity,
                'unit_price': sale.unit_price,
                'revenue': sale.revenue,
                'date': sale.date,
                'uploaded_at': sale.uploaded_at
            }
            for sale in sales.order_by('-uploaded_at')
        ]

        return Response(data)
class AdminUploadHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        history = UploadHistory.objects.select_related('user').order_by('-uploaded_at')
        data = [
            {
                'user': h.user.username,
                'filename': h.filename,
                'uploaded_at': h.uploaded_at,
            }
            for h in history
        ]
        return Response(data)
    
class SalesAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        sales_qs = Sale.objects.filter(user=user)
        df = pd.DataFrame.from_records(sales_qs.values())

        if df.empty:
            return Response({
                'total_revenue': 0,
                'total_quantity': 0,
                'top_products': [],
                'sales_by_region': [],
                'sales_over_time': []
            })

        # Handle query params
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        product = request.GET.get('product')
        region = request.GET.get('region')

        # Filter by query parameters
        if from_date:
            df = df[df['date'] >= from_date]
        if to_date:
            df = df[df['date'] <= to_date]
        if product:
            df = df[df['product'] == product]
        if region:
            df = df[df['region'] == region]

        # Compute KPIs and summaries
        df['revenue'] = df['quantity'] * df['unit_price']
        total_revenue = df['revenue'].sum()
        total_quantity = df['quantity'].sum()

        top_products = (
            df.groupby('product')['revenue']
            .sum().sort_values(ascending=False)
            .head(5).reset_index().to_dict(orient='records')
        )

        sales_by_region = (
            df.groupby('region')['revenue']
            .sum().sort_values(ascending=False)
            .reset_index().rename(columns={'revenue': 'total'}).to_dict(orient='records')
        )

        sales_over_time = (
            df.groupby('date')['revenue']
            .sum().sort_index().reset_index().rename(columns={'revenue': 'total'}).to_dict(orient='records')
        )

        return Response({
            'total_revenue': total_revenue,
            'total_quantity': total_quantity,
            'top_products': top_products,
            'sales_by_region': sales_by_region,
            'sales_over_time': sales_over_time
        })
        
class ExportSalesCSVAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Admins get all data; others only their own
        if request.user.is_staff:
            sales = Sale.objects.select_related('user').all()
        else:
            sales = Sale.objects.filter(user=request.user)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sales_data.csv"'

        writer = csv.writer(response)
        writer.writerow(['Username', 'Product', 'Category', 'Region', 'Quantity', 'Unit Price', 'Date', 'Uploaded At'])

        for sale in sales:
            writer.writerow([
                sale.user.username,
                sale.product,
                sale.category,
                sale.region,
                sale.quantity,
                sale.unit_price,
                sale.date,
                sale.uploaded_at,
            ])

        return response
    
class ExportSalesPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Admins get all data; others only their own
        if request.user.is_staff:
            sales = Sale.objects.select_related('user').all()
        else:
            sales = Sale.objects.filter(user=request.user)

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        p.setFont("Helvetica-Bold", 14)
        p.drawString(200, height - 40, "Sales Report")

        y = height - 80
        p.setFont("Helvetica", 10)
        for i, sale in enumerate(sales, 1):
            line = f"{i}. {sale.user.username} | {sale.product} | {sale.category} | {sale.region} | {sale.quantity} | {sale.unit_price} | {sale.date}"
            p.drawString(30, y, line)
            y -= 15
            if y < 40:
                p.showPage()
                y = height - 40

        p.save()
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename='sales_report.pdf')