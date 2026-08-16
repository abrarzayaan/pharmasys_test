import os
import io
import logging
import requests
from PIL import Image
# pyrefly: ignore [missing-import]
from django.core.files.storage import Storage
# pyrefly: ignore [missing-import]
from django.conf import settings
# pyrefly: ignore [missing-import]
from django.utils.deconstruct import deconstructible

logger = logging.getLogger(__name__)


@deconstructible
class ImgBBStorage(Storage):
    """
    Custom Django Storage Backend for ImgBB API with automatic WebP compression,
    image validation, and max dimension resizing.
    Uploads images directly to ImgBB cloud storage and saves direct HTTPS URLs in DB.
    """

    def __init__(self, api_key=None, upload_url=None):
        self.api_key = api_key or getattr(settings, 'IMGBB_API_KEY', '6ae6f2084f448bf93ad41c4b2c0a2053')
        self.upload_url = upload_url or getattr(settings, 'IMGBB_UPLOAD_URL', 'https://api.imgbb.com/1/upload')

    def _save(self, name, content):
        """
        Validates image file format, resizes and compresses image to lightweight WebP,
        uploads to ImgBB, and returns the direct ImgBB URL.
        """
        if hasattr(content, 'chunks'):
            file_bytes = b''.join(chunk for chunk in content.chunks())
        elif hasattr(content, 'read'):
            file_bytes = content.read()
        else:
            file_bytes = bytes(content)

        # 1. Strict Image Validation
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img.verify()
            img = Image.open(io.BytesIO(file_bytes))
        except Exception as e:
            logger.error(f"Image validation failed for {name}: {e}")
            raise ValueError("Only valid image files (JPEG, PNG, WEBP, GIF, BMP, TIFF) are allowed.")

        # 2. WebP Compression & Resizing (Max 1200x1200px)
        try:
            if img.mode in ('P', 'CMYK'):
                img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
            elif img.mode == '1':
                img = img.convert('L')

            # Preserve aspect ratio with max bounds
            img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)

            compressed_output = io.BytesIO()
            if img.mode in ('RGBA', 'LA'):
                img.save(compressed_output, format='WEBP', quality=75, method=6)
            else:
                img = img.convert('RGB')
                img.save(compressed_output, format='WEBP', quality=75, method=6)

            upload_bytes = compressed_output.getvalue()
            base_name = os.path.splitext(os.path.basename(name))[0]
            filename = f"{base_name}.webp"
        except Exception as compress_err:
            logger.warning(f"Compression fallback for {name}: {compress_err}")
            base_name = os.path.splitext(os.path.basename(name))[0]
            ext = os.path.splitext(name)[1] or '.png'
            filename = f"{base_name}{ext}"
            upload_bytes = file_bytes

        # 3. ImgBB Cloud API Upload
        payload = {'key': self.api_key}
        files = {'image': (filename, upload_bytes)}

        try:
            response = requests.post(self.upload_url, data=payload, files=files, timeout=30)
            data = response.json()

            if response.status_code == 200 and data.get('success'):
                direct_url = data['data']['url']
                logger.info(f"Successfully compressed & uploaded {filename} to ImgBB: {direct_url}")
                return direct_url
            else:
                err_details = data.get('error', {}).get('message', str(data))
                logger.error(f"ImgBB API error during upload of {filename}: {err_details}")
                raise IOError(f"ImgBB API Upload Failed: {err_details}")
        except Exception as e:
            logger.error(f"ImgBB Exception for {filename}: {e}")
            raise IOError(f"Could not upload image to ImgBB: {str(e)}")

    def url(self, name):
        """
        Returns direct URL of image.
        """
        if not name:
            return ""
        if name.startswith('http://') or name.startswith('https://'):
            return name
        media_url = getattr(settings, 'MEDIA_URL', '/media/')
        if name.startswith(media_url):
            return name
        return f"{media_url.rstrip('/')}/{name.lstrip('/')}"

    def exists(self, name):
        return False

    def delete(self, name):
        pass

    def size(self, name):
        return 0

    def get_available_name(self, name, max_length=None):
        return name
