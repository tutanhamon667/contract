from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image


def create_thumbnail(self):
    image = Image.open(self.file)
    thumbnail_size = self.THUMBNAIL_SIZE
    image.thumbnail(thumbnail_size)
    thumb_name = self.file.name.replace('.', '_thumb.')
    thumb_io = BytesIO()
    image.save(thumb_io, 'JPEG')
    self.thumbnail.save(
        thumb_name,
        InMemoryUploadedFile(
            thumb_io,
            None,
            thumb_name,
            'image/jpeg',
            thumb_io.tell,
            None
        )
    )
    thumb_io.close()
