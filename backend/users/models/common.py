import datetime
import random
import hashlib
import time


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

    def __str__(self):
        return self.name


class Captcha(models.Model):
    challenge = models.CharField(blank=False, max_length=32)
    response = models.CharField(blank=False, max_length=32)
    hashkey = models.CharField(blank=False, max_length=40, unique=True)
    expiration = models.DateTimeField(blank=False)

    def save(self, *args, **kwargs):
        self.response = self.response.lower()
        if not self.expiration:
            self.expiration = timezone.now() + datetime.timedelta(
                minutes=5
            )
        if not self.hashkey:
            key_ = (
                smart_str(randrange(0, MAX_RANDOM_KEY))
                + smart_str(time.time())
                + smart_str(self.challenge, errors="ignore")
                + smart_str(self.response, errors="ignore")
            ).encode("utf8")
            self.hashkey = hashlib.sha1(key_).hexdigest()
            del key_
        super().save(*args, **kwargs)

    def __str__(self):
        return self.challenge

    @classmethod
    def remove_expired(cls):
        cls.objects.filter(expiration__lte=timezone.now()).delete()

    @classmethod
    def check_chaptcha(cls, captcha, hash):
        try:
            return cls.objects.get(challenge=captcha, hashkey=hash)
        except Exception as e:
            print(f"Каптча не найдена: {e}")
            return False

    @classmethod
    def get_captcha_challenge(cls, hash):
        try:
            res = cls.objects.get(hashkey=hash)
            return res.challenge
        except Exception as e:
            print(f"Каптча не найдена: {e}")
            return False

    @classmethod
    def generate_key(cls, generator=None):
        challenge = ""
        hashkey = ""
        chars, ret = "abcdefghijklmnopqrstuvwxyz", ""
        for i in range(4):
            challenge += random.choice(chars)

        store = cls.objects.create(challenge=challenge, response="")
        return store.challenge, store.hashkey
    @classmethod
    def pick(cls):
        return cls.generate_key()
    class Meta:
        verbose_name = 'Каптча'
        verbose_name_plural = 'Каптчи'


