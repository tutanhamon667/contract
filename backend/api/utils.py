from io import BytesIO

from drf_extra_fields.fields import Base64ImageField
from pdf2image import convert_from_bytes, convert_from_path
from PIL import Image

from taski.settings import THUMBNAIL_SIZE


def generate_thumbnail(file):
    """
    Создание миниатюр загруженных файлов в профайле заказа.
    """
    try:
        img = Image.open(file)
        img.thumbnail(THUMBNAIL_SIZE)
        thumbnail_buffer = BytesIO()
        img.save(thumbnail_buffer, 'JPEG')
        thumbnail_buffer.seek(0)
        return thumbnail_buffer
    except Exception as e:
        print(f"Ошибка при создании миниатюры: {e}")


class CustomBase64ImageField(Base64ImageField):
    """
    Fix для корректного отображения файла задания в документации swagger
    см. https://github.com/Hipo/drf-extra-fields/issues/66
    """

    class Meta:
        swagger_schema_fields = {
            'type': 'string',
            'title': 'File Content',
            'description': 'Content of the file base64 encoded',
            'read_only': False
        }
