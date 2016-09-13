# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import

import json

import requests
from django.contrib.auth.models import AbstractUser
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _

from django.conf import settings


@python_2_unicode_compatible
class User(AbstractUser):

    name = models.CharField(_('Name of User'), blank=True, max_length=255)

    #This extends AbstractUser so it already has first name and last name

    #To simplify, our users will only be doctors or patients
    #TODO: use an enum instead of hard coding
    ROLE_CHOICES = (
        ('doctor', 'Doctor'),
        ('patient', 'Patient')
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')

    video_security_token = models.CharField(_('SightCall security token'), blank=True,default=' ', max_length=255)

    def __str__(self):
        return self.username

    def get_absolute_url(self):
        return reverse('users:detail', kwargs={'username': self.username})

    def is_doctor(self):
        return self.role == 'doctor'

    def is_patient(self):
        return self.role == 'patient'

    #Will asynchronously request a token from rtcc cloud
    def request_video_security_token(self):

        SightCallApiKey = settings.SIGHTCALL_API_KEY


        headers = {
                    'Authorization': 'Apikey ' + SightCallApiKey,
        }

        data = {
                'uid': self.username,
                'domain': '',
                'profile': '',
        }

        url = 'https://api.rtccloud.net/v2.0/provider/usertoken'

        try:
            response = requests.post(url,data=data,headers=headers)
            payload = response.json()
            response.raise_for_status()
            self.video_security_token = payload['data']
        except requests.exceptions.Timeout:
            print "Request has timed out!"
        except requests.exceptions.HTTPError as e:
            print e
        except requests.exceptions.RequestException as e:
            print e

        return self.video_security_token

