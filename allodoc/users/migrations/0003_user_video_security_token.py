# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-09-04 19:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20160903_2014'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='video_security_token',
            field=models.CharField(blank=True, default=' ', max_length=255, verbose_name='SightCall security token'),
        ),
    ]
