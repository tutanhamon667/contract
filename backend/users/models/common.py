import datetime
import random
import hashlib
import time

from django.core.cache import cache


from django.db import models

from django.utils import timezone
from django.utils.encoding import smart_str


if hasattr(random, "SystemRandom"):
    randrange = random.SystemRandom().randrange
else:
    randrange = random.randrange
MAX_RANDOM_KEY = 18446744073709551616  # 2 << 63


class Region(models.Model):
    name = models.CharField(null=False, max_length=50)

    class Meta:
        verbose_name = 'Регион'
        verbose_name_plural = 'Регионы'

    def __str__(self):
        return self.name


class Captcha():

    def __init__(self):
        pass

    def __str__(self):
        return self.challenge


    @classmethod
    def check_chaptcha(cls, captcha, hash):
        try:
            res = cache.get(hash)
            return res == captcha
        except Exception as e:
            print(f"Каптча не найдена: {e}")
            return False

    @classmethod
    def get_captcha_challenge(cls, hash):
        try:
            return cache.get(hash)
        except Exception as e:
            print(f"Каптча не найдена: {e}")
            return False

    @classmethod
    def generate_key(cls, generator=None):
        challenge = ""
        chars, ret = "abcdefghijklmnopqrstuvwxyz", ""
        for i in range(5):
            challenge += random.choice(chars)

        key_ = (
                smart_str(randrange(0, MAX_RANDOM_KEY))
                + smart_str(time.time())
                + smart_str(challenge, errors="ignore")
        ).encode("utf8")
        hash_key = hashlib.sha1(key_).hexdigest()
        cache.set(hash_key, challenge, timeout=600)
        return challenge, hash_key
    @classmethod
    def pick(cls):
        return cls.generate_key()



