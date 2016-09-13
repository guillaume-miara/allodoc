# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

import json

from django.core.urlresolvers import reverse
from django.http import Http404
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import DetailView, ListView, RedirectView, UpdateView,View

from django.contrib.auth.mixins import LoginRequiredMixin

from .users.models import User

def doctors(request):
    Doctors = User.objects.filter(role='doctor')
    context = {'doctors': Doctors}
    return render(request, 'pages/doctors.html', context)


def record_call_event(request):

    if request.is_ajax():
        print request

    else:
        raise Http404

def get_security_token(request,uid):

    print uid
    if request.is_ajax():
        response_data = {}
        try:
            user = User.objects.get(username=uid)
            #Ask again for a SightCall token ( limited lifetime )
            user.request_video_security_token()
            response_data['token'] = user.video_security_token
            response_data['message'] = 'We found the user token'
        except Exception as e :
            print "User not found"
            response_data['message'] = e.message

        return JsonResponse(response_data)
    else:
        raise Http404


class DoctorListView(LoginRequiredMixin, ListView):
    model = User
    # These next two lines tell the view to index lookups by username
    slug_field = 'username'
    slug_url_kwarg = 'username'

    template_name = 'pages/doctors.html'
    queryset = User.objects.filter(role='doctor')

