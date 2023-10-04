from io import BytesIO

from drf_extra_fields.fields import Base64FileField, Base64ImageField
from pdf2image import convert_from_bytes, convert_from_path
from PIL import Image

THUMBNAIL_SIZE = (100, 100)


def generate_thumbnail(file):
    """
    Создание миниатюр загруженных файлов в профайле заказа.
    """
    try:
        if file.name.endswith(('.pdf', '.PDF')):
            if isinstance(file, bytes):
                images = convert_from_bytes(file)
            else:
                images = convert_from_path(file.path)
            if images:
                img = images[0]
        else:
            img = Image.open(file)

        img.thumbnail(THUMBNAIL_SIZE)
        thumbnail_buffer = BytesIO()
        img.save(thumbnail_buffer, 'JPEG')
        thumbnail_buffer.seek(0)
        return thumbnail_buffer
    except Exception as e:
        print(f"Ошибка при создании миниатюры: {e}")
        return None


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


class CustomCurrentUserDefault(object):
    """
    Fix для корректного отображения файла задания в документации swagger
    см. https://github.com/Hipo/drf-extra-fields/issues/66
    """
    def set_context(self, serializer_field):
        self.user_id = serializer_field.context['request'].user.id

    def __call__(self):
        return self.user_id

    def __str__(self):
        return f"{self.__class__.__name__} instance with data: {self.data}"
