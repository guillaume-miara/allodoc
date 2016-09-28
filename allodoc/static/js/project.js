/* Project specific Javascript goes here. */

/*
Formatting hack to get around crispy-forms unfortunate hardcoding
in helpers.FormHelper:

    if template_pack == 'bootstrap4':
        grid_colum_matcher = re.compile('\w*col-(xs|sm|md|lg|xl)-\d+\w*')
        using_grid_layout = (grid_colum_matcher.match(self.label_class) or
                             grid_colum_matcher.match(self.field_class))
        if using_grid_layout:
            items['using_grid_layout'] = True

Issues with the above approach:

1. Fragile: Assumes Bootstrap 4's API doesn't change (it does)
2. Unforgiving: Doesn't allow for any variation in template design
3. Really Unforgiving: No way to override this behavior
4. Undocumented: No mention in the documentation, or it's too hard for me to find
*/
$('.form-group').removeClass('row');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////ALLODOC CONTROLLER SCRIPT - TOKBOX///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////
// VARIABLES///////////////////////
//////////////////////////////////////////

var apiKey = '45688762';
var session;
var connectionCount = 0;
var publisher;
var localStreamElement = 'local-video';
var remoteStreamElement = 'remote-video';
var publisherProperties = {insertMode: "replace",
                           usePreviousDeviceSelection: true,
                           resolution: '1280x720'};
var streamReceiverProperties = {insertMode: "replace"
                           };

var CALL_URL = 'ajax/call/';

//Each user should only be connected to one session at a time
var session_id;
var publisher_token;
var subscriber_token;

//////////////////////////////////////////
// UI HELPERS/////////////////////////////
//////////////////////////////////////////

var toggleConnectionStatus = function(status){
  switch(status){
    case 'connecting':
      $('#connection_connecting').show();
      $('#connection_on').hide();
      $('#connection_off').hide();
      break;
    case 'on':
      $('#connection_connecting').hide();
      $('#connection_on').show();
      $('#connection_off').hide();
      break;
    case 'off':
      $('#connection_connecting').hide();
      $('#connection_on').hide();
      $('#connection_off').show();
      break;

  }
};

var toggleCallStatus = function(status){
  switch(status){
    case 'receive':
      $('#call_receive').show();
      $('#call_on').hide();
      $('#call_not_ready').hide();
      $('#call_ready').hide();
      break;
    case 'on':
      $('#call_receive').hide();
      $('#call_on').show();
      $('#call_not_ready').hide();
      $('#call_ready').hide();
      break;
    case 'ready':
      $('#call_receive').hide();
      $('#call_on').hide();
      $('#call_not_ready').hide();
      $('#call_ready').show();
      break;
    case 'not_ready':
      $('#call_receive').hide();
      $('#call_on').hide();
      $('#call_not_ready').show();
      $('#call_ready').hide();
      break;

  }

};


//////////////////////////////////////////
// UI CONTROLLER//////////////////////////
//////////////////////////////////////////

var initiate_call = function(caller, callee, callback){

    //Make AJAX call to get a session id and token
    $.ajax(CALL_URL + caller + '/' + callee, {
      dataType: 'json'
    })
    .done(function(response) {

      //Set OpenTok Global variables for the call
      session_id = response.session_id;
      publisher_token = response.publisher_token;
      subscriber_token = response.subscriber_token;

      if (!publisher_token || !session_id || !subscriber_token) {
        console.log("Error in the Ajax response");
      } else {
        console.log("Succesfully received the server's response to make a call");
        callback(session_id);
      }
    })
    .fail(console.log("makeCall failing"))
};

//Helper
var onStreamReceiveError = function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log('Subscriber added.');
      }
};

// Defines the connection to the session and event handlers
function connect() {

  // Session initialization
  session = OT.initSession(apiKey, session_id);

  //Definition of event handlers to manage the connection
  session.on({
    connectionCreated: function (event) {
      toggleConnectionStatus('on');
      connectionCount++;
      console.log(connectionCount + ' connections.');
      publishStream();
      toggleCallStatus('on');
    },
    connectionDestroyed: function (event) {
      toggleConnectionStatus('off');
      connectionCount--;
      console.log(connectionCount + ' connections.');
    },
    sessionDisconnected: function sessionDisconnectHandler(event) {
      // The event is defined by the SessionDisconnectEvent class
      console.log('Disconnected from the session.');
      toggleConnectionStatus('off');
      //document.getElementById('disconnectBtn').style.display = 'none';
      if (event.reason == 'networkDisconnected') {
        alert('Your network connection terminated.')
      }
    }
  });

  //Definition of the event handlers to manage the streams
  session.on("streamCreated", function (event) {
   //When a doctor joins the session, the patient
   console.log("New stream in the session: " + event.stream.streamId);
   session.subscribe(event.stream,
                     remoteStreamElement,
                     streamReceiverProperties,
                     onStreamReceiveError)
  });


  session.on("streamDestroyed", function (event) {
     console.log("Stream stopped. Reason: " + event.reason);
  });

  //Connect to the session
  session.connect(publisher_token, function(error) {
    if (error) {
      console.log('Unable to connect: ', error.message);
    } else {
      //document.getElementById('disconnectBtn').style.display = 'block';
      console.log('Connected to the session.');
      connectionCount = 1;
    }
  });

}

// Publish the stream to the session
function publishStream(){

    publisher = OT.initPublisher(localStreamElement, publisherProperties, function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log('Publisher initialized.');
      }
    });

    publisher.on({
      accessAllowed: function (event) {
        // The user has granted access to the camera and mic.
        console.log("Access has been granted");
      },
      accessDenied: function accessDeniedHandler(event) {
        // The user has denied access to the camera and mic.
        console.log("Access isn't granted");
      }
    });

    publisher.on('streamCreated', function (event) {
        console.log('The publisher started streaming.');
    });

    publisher.on("streamDestroyed", function (event) {
      console.log("The publisher stopped streaming. Reason: "
        + event.reason);
    });

    session.publish(publisher, function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log('Publishing a stream.');
      }
    });

};

//////////////////////////////////////////
// UI CONTROLLER - PATIENTS///////////////
//////////////////////////////////////////

var makeCall = function(caller, callee){

    //Initiate the call
    initiate_call(caller,callee, connect);

};


//////////////////////////////////////////
// UI CONTROLLER - DOCTORS////////////////
//////////////////////////////////////////

// Initialize the pubnub instance

var pubnub = PUBNUB.init({
    publish_key: 'pub-c-149e1c89-02b4-462f-99bc-200e9ae052ec',
    subscribe_key: 'sub-c-39adec0e-0f18-11e6-a6dc-02ee2ddab7fe',
    error: function (error) {
        console.log('Error:', error);
    }
})


// Connect to the pubnub channel for that user where incoming session will be published
pubnub.subscribe({
    channel : currentUserUid,
    message : function(m){
        console.log(m);
        // When there is a new message, we prompt the user to accept or reject the call with a modal that takes all call
        // information
        // The doctor can then accept to take the call or reject the call ( nothing happens)
        $('#callReceiveModal').modal('show');

        var new_session_id = m['session'];
        var new_subscriber_token = m['subscriber_token'];
        var new_publisher_token = m['publisher_token'];
        var new_caller = m['caller'];

        $('#caller_id').append(new_caller);
        $('#new_session').append(new_session_id);
        $('#new_publisher_token').append(new_publisher_token);
        $('#new_subscriber_token').append(new_subscriber_token);
    },
    error : function (error) {
        // Handle error here
        console.log(JSON.stringify(error));
    }
});


function takeCall(){
    // Destroy existing session

    // Save the new session and tokens
    session_id = $('#new_session').text().trim();
    publisher_token = $('#new_publisher_token').text().trim();
    subscriber_token = $('#new_subscriber_token').text().trim();

    console.log(session_id);
    console.log(publisher_token);
    console.log(subscriber_token);

    // connect to new session
    connect();

    //Hide the modal
    $('#callReceiveModal').modal('hide');

};



