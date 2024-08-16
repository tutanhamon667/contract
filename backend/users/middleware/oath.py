from django.conf import settings
from django_otp.middleware import OTPMiddleware

class CustomOTPMiddleware(OTPMiddleware):
    def _verify_user(self, request, user):
        role = user.role  # assume you have a role attribute on your user model
        allowed_devices = settings.OTP_AUTH_ROLES.get(role, [])

        # check if the user has a verified OTP device that matches one of the allowed devices
        for device in user.otp_devices.all():
            if device.name in allowed_devices:
                user.otp_device = device
                break

        return user