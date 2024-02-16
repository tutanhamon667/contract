import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv()


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = os.getenv('SECRET_KEY')
SECRET_KEY = 'django-insecure-mziq8mo-wgp#urg02d(uaau4gGultuiot8hbxlguev@bh%'


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', default='True') == 'True'

ALLOWED_HOSTS = ['*']
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'django_bootstrap5',
    'djoser',
    'corsheaders',
    'users',
    'orders',
    'chat',
    'drf_yasg',
    'drf_extra_fields',
    'contract',
    'ckeditor',
    'btc',
    'django_bootstrap_icons'

]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'users.middleware.captcha_check.captcha_check'
]

ROOT_URLCONF = 'contract.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS':  [BASE_DIR / "contract/templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'contract.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases


DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE', default='django.db.backends.postgresql'),
        'NAME': 'contract' ,
        'USER': 'contract',
        'PASSWORD': 'uyfuy^6jji',
        'HOST':'localhost',
        'PORT':5433
    }
}

#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
#}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'users.validators.UppercaseValidator',
    },
    {
        'NAME': 'users.validators.SpecialCharValidator',
    },
    {
        'NAME': 'users.validators.DigitValidator',
    },
]

AUTH_USER_MODEL = 'users.Member'

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/


STATIC_URL = 'static/'

# Add these new lines
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],

    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],

    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 7,
}


SIMPLE_JWT = {
    # Устанавливаем срок жизни токена
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

DJOSER = {
    'LOGIN_FIELD': 'email',
    'USER_CREATE_PASSWORD_RETYPE': 'True',
    'SET_PASSWORD_RETYPE': 'True',
    'SET_USERNAME_RETYPE': 'True',
    'PASSWORD_RESET_CONFIRM_RETYPE': 'True',
    'PASSWORD_RESET_CONFIRM_URL': 'api/v1/users/reset_password_confirm/{uid}/{token}/',

    # 'EMAIL': {'password_reset': 'djoser.email.PasswordResetEmail'},
    'EMAIL': {'password_reset': 'users.email.PasswordResetEmail'},

    'PERMISSIONS': {
        'user': ['rest_framework.permissions.AllowAny'],
        'user_list': ['rest_framework.permissions.AllowAny'],
        'set_password': ['rest_framework.permissions.AllowAny'],
    },

    'SERIALIZERS': {
        'user_create_password_retype': 'users.serializers.UserCreateSerializer',
        'set_password_retype': 'users.serializers.SetPasswordSerializer',
        'set_username_retype': 'users.serializers.NewEmailSerializer',
        'password_reset': 'users.serializers.SendEmailResetSerializer',
        'password_reset_confirm_retype': 'users.serializers.PasswordResetConfirmSerializer'

    }
}


# Настройка email
EMAIl_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.yandex.ru'
EMAIL_PORT = 465
EMAIL_HOST_USER = 'maxim-s-paramonov@yandex.ru'
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True
SERVER_EMAIL = EMAIL_HOST_USER
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


# SWAGGER
SWAGGER_SETTINGS = {
    'DEFAULT_AUTO_SCHEMA_CLASS': 'drf_yasg.inspectors.SwaggerAutoSchema',
    'DEFAULT_INFO': 'contract.urls.swagger_info',
}


# CORS
CORS_URLS_REGEX = r'^/api/.*$'
CORS_ALLOWED_ORIGINS = [
    'http://localhost:4173',
    'http://localhost:5173',
]


# APPS CONSTANTS

# Требования к размерам файлов в задании - используется в api/serializers.py
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_FILE_EXT = ['.jpg', '.jpeg', '.png']
DATETIME_FORMAT = "%Y-%m-%d"

# Размер миниатюры (api/utils.py)
THUMBNAIL_SIZE = (100, 100)

# Cообщения ошибок валидации в api/serializers.py
FILE_OVERSIZE_ERR = f"Превышен размер файла: {MAX_FILE_SIZE_MB} МБ."
FILE_EXT_ERR = 'Допустимые типы файлов:' + ', '.join(ALLOWED_FILE_EXT)
STACK_ERR_MSG = 'Укажите минимум 1 навык'
CURRENT_DATE_ERR = 'Срок выполнения не может быть раньше сегодняшней даты.'
PUB_DATE_ERR = 'Срок выполнения не может быть раньше даты создания заказа.'
CHAT_ALREADY_EXISTS_ERR = 'Вы уже создали чат с фрилансером по этому заданию.'
JOB_ALREADY_APPLIED_ERR = 'Вы уже откликнулись на задание.'
DATE_FORMAT_ERR = ("Некорректный формат даты - "
                   "требуется дата по образцу '2023-12-12' "
                   f"({DATETIME_FORMAT})")
ASK_MSG = 'Жду предложений'
BUDGET_DATA_ERR = f'Бюджет должен быть числом или {ASK_MSG}'
DEADLINE_ERR = 'Укажите сроки или выберете "Жду предложений"'
BUDGET_ERR = 'Укажите бюджет или выберете "Жду предложений"'

ERRORS = {'captcha': 'Не верно введена каптча', 'auth_login_pass': 'Не верные данные от аккаунта'}

# Cообщения в api/controllers.py
OTHER_TASK_CHAT_ERR = 'Вы не можете создать чат по чужому заданию.'
SELECTED_FOR_JOB_MSG = 'Вас выбрали в качестве исполнителя'

# Перечень специализаций для моделей
CATEGORY_CHOICES = (
    ('design', 'дизайн'),
    ('development', 'разработка'),
    ('testing', 'тестирование'),
    ('administration', 'администрирование'),
    ('marketing', 'маркетинг'),
    ('content', 'контент'),
    ('other', 'разное'),
)

JOB_TARIFF = (
    (0, 'Базовый'),
(1, 'Плюс'),
(2, 'Премиум'),
(3, 'Не оплачен'),
)

# Перечень контактов для моделей в users
CONTACT_TYPE = (
    ('phone', 'Phone number'),
    ('email', 'E-mail'),
    ('telegram', 'Telegram'),
    ('other', 'Other')
)
