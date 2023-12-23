import base64

from drf_extra_fields.fields import Base64ImageField

# from django.core.files.base import ContentFile
# from rest_framework import serializers


class CustomizedBase64ImageField(Base64ImageField):
    def to_representation(self, value):
        if value:
            extension = self.get_file_extension(value.name, value)
            with open(value.path, 'rb') as image_file:
                return bytes(
                    'data:image/' + extension + ';base64,', 'utf-8'
                ) + base64.b64encode(image_file.read())
        return None


'''
class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)
        return super().to_internal_value(data)

    def to_representation(self, value):
        if value:
            print(value.path)
            print(value.extentions)
            with open(value.path, 'rb') as image_file:
                encoded_string = base64.b64encode(image_file.read())
            print(encoded_string)
            return encoded_string # super().to_representation(encoded_string)
        return None
'''
