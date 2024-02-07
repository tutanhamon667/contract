import base64
import random

from captcha.image import ImageCaptcha, random_color, ColorTuple
import typing as t
from PIL.Image import new as createImage, Image, QUAD, BILINEAR
from PIL.ImageDraw import Draw, ImageDraw
from PIL.ImageFilter import SMOOTH
from PIL.ImageFont import FreeTypeFont, truetype

from users.models.common import Captcha


class SimpleCaptcha(ImageCaptcha):

    def get_base64(self, key):
        return str(base64.b64encode(self.generate(key, 'png').getvalue())).replace("b'", '').replace("'", "")

    @staticmethod
    def captcha_check(request):
        image = SimpleCaptcha(width=280, height=90)
        challenge = Captcha.get_captcha_challenge(hash=request.POST['hashkey'])
        captcha_base64 = str(base64.b64encode(image.generate(challenge, 'png').getvalue()))
        return captcha_base64.replace("b'", '').replace("'", "")
    def generate_image(self, chars: str)-> Image:
        background = random_color(238, 255)
        color = random_color(10, 200, random.randint(220, 255))
        im = self.create_captcha_image(chars, color, background)

        return im

    def _draw_character(
            self,
            c: str,
            draw: ImageDraw,
            color: ColorTuple) -> Image:
        font = random.choice(self.truefonts)

        left, top, right, bottom = draw.textbbox((0, 0), c, font=font)
        w = int((right - left) * 2) or 1
        h = int((bottom - top) * 2) or 1

        dx1 = 0
        dy1 = 0
        im = createImage('RGBA', (w + dx1, h + dy1))
        Draw(im).text((dx1, dy1), c, font=font, fill=color)

        return im

    def create_captcha_image(
            self,
            chars: str,
            color: ColorTuple,
            background: ColorTuple) -> Image:
        """Create the CAPTCHA image itself.

        :param chars: text to be generated.
        :param color: color of the text.
        :param background: color of the background.

        The color should be a tuple of 3 numbers, such as (0, 255, 255).
        """
        image = createImage('RGB', (self._width, self._height), background)
        draw = Draw(image)

        images: t.List[Image] = []
        for c in chars:
            images.append(self._draw_character(c, draw, color))

        text_width = sum([im.size[0] for im in images])

        width = max(text_width, self._width)
        image = image.resize((width, self._height))

        average = int(text_width / len(chars))
        offset = int(average * 0.1)

        for im in images:
            w, h = im.size
            mask = im.convert('L').point(self.lookup_table)
            image.paste(im, (offset, int((self._height - h) / 2)), mask)
            offset = offset + w

        if width > self._width:
            image = image.resize((self._width, self._height))

        return image