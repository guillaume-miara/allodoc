from django import forms

from .users.models import User

#We ovewrite the allauth Signup form to add a few important fields
class CustomSignupForm(forms.Form):
    first_name = forms.CharField(max_length=30)
    last_name = forms.CharField(max_length=30)
    role = forms.ChoiceField(choices=User.ROLE_CHOICES)

    class Meta:
        model = User

    #Here we are going to do a little hack on the user creation to get him a unique token for video
    def save(self, user):
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.role = self.cleaned_data['role']
        user.save()
        user.request_video_security_token()
        user.save()
