from django.conf import settings
from opentok import OpenTok
from pubnub import Pubnub

#OpenTok for session creation and token generation
OpenTokApiKey = settings.OPENTOK_API_KEY
OpenTokApiSecret = settings.OPENTOK_API_SECRET

opentok_sdk = OpenTok(OpenTokApiKey, OpenTokApiSecret)

#PubNub for a bus to notify users of events
PubNubPublishKey = settings.PUBNUB_PUBLISH_KEY
PubNubSubscribeKey = settings.PUBNUB_SUBSCRIBE_KEY

pubnub = Pubnub(publish_key=PubNubPublishKey, subscribe_key=PubNubSubscribeKey)


# Publish a welcome message
def callback(message):
    print(message)


def publish_message(channel, message):
    pubnub.publish(channel, message, callback=callback, error=callback)
