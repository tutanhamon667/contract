from django.forms.widgets import Widget

class CaptchaWidget(Widget):
    def render(self, name, value, attrs=None, renderer=None):
        final_attrs = self.build_attrs(attrs)

        return f'<img id="captcha" src="data:image/png;base64, ${final_attrs["captcha"]}"><input type="hidden" name="hashkey" value="${final_attrs["hashkey"]}"><input type="text" placeholder="**" class="login-input" required="required" name="captcha" style="text-transform:uppercase">'

