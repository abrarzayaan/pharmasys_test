from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.products.models.cms import CmsHeroSlide, CmsAnnouncementBar
from core.storage import ImgBBStorage

class UniversalImageUploadView(APIView):
    """
    Universal API Endpoint for Image Uploads.
    Validates that the file is an image, resizes, compresses to lightweight WebP,
    uploads to ImgBB, and returns the direct HTTPS ImgBB URL.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        file_obj = request.FILES.get('image') or request.FILES.get('file') or request.FILES.get('image_url')
        if not file_obj:
            image_url_str = request.data.get('image_url')
            if image_url_str and isinstance(image_url_str, str):
                return Response({"url": image_url_str, "success": True})
            return Response({"error": "Please provide a valid image file or URL."}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj.content_type and not file_obj.content_type.startswith('image/'):
            return Response({"error": "Only valid image files (JPEG, PNG, WEBP, GIF, BMP) are allowed."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            storage = ImgBBStorage()
            imgbb_url = storage._save(file_obj.name, file_obj)
            return Response({"url": imgbb_url, "success": True}, status=status.HTTP_201_CREATED)
        except ValueError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            return Response({"error": f"Upload failed: {str(err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CmsHeroSlideListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        slides = CmsHeroSlide.objects.all()
        data = [
            {
                "id": s.id,
                "title": s.title,
                "headline": s.title,
                "subtitle": s.subtitle,
                "subheadline": s.subtitle,
                "badge": s.badge,
                "badge_tag": s.badge,
                "cta_text": s.cta_text,
                "cta_link": s.cta_link,
                "target_url": s.cta_link,
                "image_url": s.image_url,
                "slide_type": s.slide_type,
                "type": s.slide_type,
                "is_published": s.is_published,
                "is_active": s.is_published,
                "order": s.order,
                "sort_order": s.order,
                "created_at": s.created_at.isoformat() if s.created_at else "",
            }
            for s in slides
        ]
        return Response(data)

    def post(self, request):
        data = request.data
        image_url = data.get("image_url", "https://i.ibb.co/Lhb8Z30/hero-default.jpg")

        file_obj = request.FILES.get('image') or request.FILES.get('image_url') or request.FILES.get('file')
        if file_obj:
            try:
                storage = ImgBBStorage()
                image_url = storage._save(file_obj.name, file_obj)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        slide_type = data.get("slide_type") or data.get("type") or "main_hero"

        slide = CmsHeroSlide.objects.create(
            title=data.get("headline") or data.get("title") or "New Slide",
            subtitle=data.get("subheadline") or data.get("subtitle") or "",
            badge=data.get("badge_tag") or data.get("badge") or "",
            cta_text=data.get("cta_text", "Shop Now"),
            cta_link=data.get("target_url") or data.get("cta_link") or "/products",
            image_url=image_url,
            slide_type=slide_type,
            is_published=data.get("is_active", True) if "is_active" in data else data.get("is_published", True),
            order=data.get("sort_order") or data.get("order") or 0,
        )
        return Response({
            "id": slide.id,
            "title": slide.title,
            "headline": slide.title,
            "subtitle": slide.subtitle,
            "subheadline": slide.subtitle,
            "badge": slide.badge,
            "badge_tag": slide.badge,
            "cta_text": slide.cta_text,
            "cta_link": slide.cta_link,
            "target_url": slide.cta_link,
            "image_url": slide.image_url,
            "slide_type": slide.slide_type,
            "type": slide.slide_type,
            "is_published": slide.is_published,
            "is_active": slide.is_published,
            "order": slide.order,
            "sort_order": slide.order,
        }, status=status.HTTP_201_CREATED)


class CmsHeroSlideDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            slide = CmsHeroSlide.objects.get(pk=pk)
        except CmsHeroSlide.DoesNotExist:
            return Response({"error": "Hero slide not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        file_obj = request.FILES.get('image') or request.FILES.get('image_url') or request.FILES.get('file')
        if file_obj:
            try:
                storage = ImgBBStorage()
                slide.image_url = storage._save(file_obj.name, file_obj)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if "headline" in data or "title" in data:
            slide.title = data.get("headline") or data.get("title")
        if "subheadline" in data or "subtitle" in data:
            slide.subtitle = data.get("subheadline") or data.get("subtitle")
        if "badge_tag" in data or "badge" in data:
            slide.badge = data.get("badge_tag") or data.get("badge")
        if "cta_text" in data:
            slide.cta_text = data["cta_text"]
        if "target_url" in data or "cta_link" in data:
            slide.cta_link = data.get("target_url") or data.get("cta_link")
        if "image_url" in data and not file_obj:
            slide.image_url = data["image_url"]
        if "slide_type" in data or "type" in data:
            slide.slide_type = data.get("slide_type") or data.get("type")
        if "is_active" in data:
            slide.is_published = data["is_active"]
        elif "is_published" in data:
            slide.is_published = data["is_published"]
        if "sort_order" in data:
            slide.order = data["sort_order"]
        elif "order" in data:
            slide.order = data["order"]

        slide.save()

        return Response({
            "id": slide.id,
            "title": slide.title,
            "headline": slide.title,
            "subtitle": slide.subtitle,
            "subheadline": slide.subtitle,
            "badge": slide.badge,
            "badge_tag": slide.badge,
            "cta_text": slide.cta_text,
            "cta_link": slide.cta_link,
            "target_url": slide.cta_link,
            "image_url": slide.image_url,
            "slide_type": slide.slide_type,
            "type": slide.slide_type,
            "is_published": slide.is_published,
            "is_active": slide.is_published,
            "order": slide.order,
            "sort_order": slide.order,
        })

    def delete(self, request, pk):
        try:
            slide = CmsHeroSlide.objects.get(pk=pk)
            slide.delete()
            return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)
        except CmsHeroSlide.DoesNotExist:
            return Response({"error": "Hero slide not found"}, status=status.HTTP_404_NOT_FOUND)


class CmsAnnouncementBarView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        bar, _ = CmsAnnouncementBar.objects.get_or_create(id=1)
        return Response({
            "id": bar.id,
            "text": bar.text,
            "bg_theme": bar.bg_theme,
            "is_visible": bar.is_visible,
            "is_active": bar.is_visible,
        })

    def patch(self, request):
        bar, _ = CmsAnnouncementBar.objects.get_or_create(id=1)
        if "text" in request.data:
            bar.text = request.data["text"]
        if "bg_theme" in request.data:
            bar.bg_theme = request.data["bg_theme"]
        if "is_visible" in request.data:
            bar.is_visible = request.data["is_visible"]
        elif "is_active" in request.data:
            bar.is_visible = request.data["is_active"]
        bar.save()

        return Response({
            "id": bar.id,
            "text": bar.text,
            "bg_theme": bar.bg_theme,
            "is_visible": bar.is_visible,
            "is_active": bar.is_visible,
        })
