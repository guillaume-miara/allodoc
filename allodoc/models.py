import time
from django.db import models
from opentok import Roles

from allodoc.utility import opentok_sdk, publish_message


class OpenTokSessionManager(models.Manager):
    def create_session(self, caller, callee):
        print "Creating a session"

        #Create an OpenTok session
        ot_session = opentok_sdk.create_session()
        print ot_session.session_id

        #Create the tokens for the caller and callee
        publisher_token = ot_session.generate_token(role=Roles.publisher,
                                                    expire_time=int(time.time()) + 100000)

        subscriber_token = ot_session.generate_token(role=Roles.subscriber,
                                       expire_time=int(time.time()) + 100000)

        #Save session ready to be used
        try:
            session = self.create(opentok_id=ot_session.session_id,
                                  opentok_publisher_token=publisher_token,
                                  opentok_subscriber_token=subscriber_token,
                                  caller_username=caller,
                                  callee_username=callee)
        except Exception as e:
            print e.message

        #Notify the callee
        notification = {'session': ot_session.session_id,
                        'subscriber_token': subscriber_token,
                        'publisher_token': publisher_token,
                        'caller':caller}
        publish_message(callee, notification)

        return session


class OpenTokSession(models.Model):

    opentok_id = models.CharField(max_length=1000)
    opentok_publisher_token = models.CharField(max_length=1000)
    opentok_subscriber_token = models.CharField(max_length=1000)
    caller_username = models.CharField(max_length=30)
    callee_username = models.CharField(max_length=30)

    objects = OpenTokSessionManager()




