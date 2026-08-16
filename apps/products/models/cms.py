# pyrefly: ignore [missing-import]
from django.db import models

class CmsHeroSlide(models.Model):
    SLIDE_TYPES = [
        ('main_hero', 'Main Hero Banner (Large Left)'),
        ('side_top', 'Side Stack Banner (Top Right)'),
        ('side_bottom_left', 'Side Stack (Bottom Left)'),
        ('side_bottom_right', 'Side Stack (Bottom Right)'),
    ]

    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True, default='')
    badge = models.CharField(max_length=100, blank=True, default='')
    cta_text = models.CharField(max_length=100, default='Shop Now')
    cta_link = models.CharField(max_length=255, default='/products')
    image_url = models.CharField(max_length=500)
    slide_type = models.CharField(max_length=50, choices=SLIDE_TYPES, default='main_hero')
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.slide_type})"


class CmsAnnouncementBar(models.Model):
    text = models.CharField(max_length=255, default='⚡ Free Home Delivery on orders over ৳1,000!')
    bg_theme = models.CharField(max_length=50, default='Midnight')
    is_visible = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text
