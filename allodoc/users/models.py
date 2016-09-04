# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import

from django.contrib.auth.models import AbstractUser
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _


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

    def __str__(self):
        return self.username

    def get_absolute_url(self):
        return reverse('users:detail', kwargs={'username': self.username})

    def is_doctor(self):
        return self.role == 'doctor'

    def is_patient(self):
        return self.role == 'patient'

