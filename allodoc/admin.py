from django.contrib import admin
from  .models import OpenTokSession

class OpenTokSessionAdmin(admin.ModelAdmin):
    fields = ('opentok_id', 'opentok_publisher_token', 'opentok_subscriber_token')


admin.site.register(OpenTokSession, OpenTokSessionAdmin)
