from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Brand, Category, Product


class ProductPermissionTests(APITestCase):
    def setUp(self):
        self.admin_user = get_user_model().objects.create_user(
            phone_number='1111111111',
            email='admin@example.com',
            username='admin',
            password='StrongPass123!',
            is_staff=True,
        )
        self.vendor_user = get_user_model().objects.create_user(
            phone_number='2222222222',
            email='vendor@example.com',
            username='vendor',
            password='StrongPass123!',
        )
        self.category = Category.objects.create(name='Tablets', slug='tablets', status='active')
        self.brand = Brand.objects.create(name='PharmaBrand', slug='pharmabrand', status='active')
        self.url = reverse('product-list')

    def test_staff_user_can_create_product(self):
        self.client.force_authenticate(self.admin_user)
        payload = {
            'name': 'Paracetamol 500mg',
            'category': self.category.id,
            'brand': self.brand.id,
            'sku': 'SKU-ADMIN-1',
            'barcode': 'BAR-ADMIN-1',
            'status': 'active',
            'meta': {'tags': ['painkiller']},
        }

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Product.objects.filter(name='Paracetamol 500mg').exists())

    def test_non_staff_user_cannot_create_product(self):
        self.client.force_authenticate(self.vendor_user)
        payload = {
            'name': 'Vitamin C',
            'category': self.category.id,
            'brand': self.brand.id,
            'sku': 'SKU-VENDOR-1',
            'barcode': 'BAR-VENDOR-1',
            'status': 'active',
            'meta': {'tags': ['vitamin']},
        }

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Product.objects.filter(name='Vitamin C').exists())
