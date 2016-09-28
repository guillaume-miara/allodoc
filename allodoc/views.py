# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

import json

from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import Http404
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import DetailView, ListView, RedirectView, UpdateView,View

from django.contrib.auth.mixins import LoginRequiredMixin

from allodoc.models import OpenTokSession
from .users.models import User

def doctors(request):
    Doctors = User.objects.filter(role='doctor')
    context = {'doctors': Doctors}
    return render(request, 'pages/doctors.html', context)

def call(request,caller,callee):

    if request.is_ajax():
        response_data = {}
        try:
            #Make sure the users exists
            caller = User.objects.get(username=caller)
            callee = User.objects.get(username=callee)
            print caller, callee

            session = OpenTokSession.objects.create_session(caller.username, callee.username)

            response_data['session_id'] = session.opentok_id
            response_data['publisher_token'] = session.opentok_publisher_token
            response_data['subscriber_token'] = session.opentok_subscriber_token
            response_data['message'] = 'We created the session succesfully'

            print "We answered the AJAX request successfully"
        except Exception as e :
            print "Error creating the session"
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

