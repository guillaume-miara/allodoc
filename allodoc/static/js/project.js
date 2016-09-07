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
//////////////////////////////////////////////ALLODOC CONTROLLER SCRIPT////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////
// INITIALIZATION OF THE SIGHTCALL SDK////
//////////////////////////////////////////

// Based on the tutorial found here: https://github.com/sightcall/JS-Tutorials/blob/master/call/call.js

var APP_IDENTIFIER = "cwvojvsd6sge";
var TOKEN;
var AUTH_URL = 'ajax/authentification/';

// Details here: https://docs.sightcall.com/gd/references/javascript-sdk/Rtcc.html
var options = {
    debugLevel : 3
    //Not adding the container, so expecting to get the video in a draggable box.
    };

/**
 * AUTHENTICATION
 *
 * In this part, we manage the authentication process. First we create an instance of the
 * API, then we define the callbacks related to the authentication events.
 *
 * Detailed tutorial available here:
 * https://docs.sightcall.com/GD/01_javascript/Tutorials/01_js_authentication.html
 */

//Creates the rtcc object with the given options
var rtcc = new Rtcc(APP_IDENTIFIER, undefined, 'internal', options);
var storedDisplayName = '';

//Creates the rtcc object and define the callbacks to the events of the API
var bindAuthCallbacks = function(rtcc, user_id) {
  //log each event
  rtcc.onAll(function() {
    if (window.console) {
      console.log('Rtcc: event "' + this.eventName + '"" with arguments: ' + JSON.stringify(arguments));
    }
  })

  //what to do when we are ready to make calls


  rtcc.on('cloud.sip.ok', function() {
    $('#connecting').css('display', 'none');
    $('#stat').text('You are now connected in mode: ' + rtcc.getConnectionMode());
    rtcc.setDisplayName(storedDisplayName)
  })

  //what to do when we are connected when we are connected with another user id
  //in plugin or driver mode
  rtcc.on('cloud.loggedasotheruser', function() {
    // force connection, kick other logged users
    getToken(user_id, function(token) {
      rtcc.forceAuthenticate();
    });
  })


  //what do to when we are disconnected from the client: we reconnect
  rtcc.on('cloud.authenticate.error', function(number) {
    if (number === 15 || number === 29) {
      console.log("Reconnecting");
      getToken(user_id, rtcc.setToken);
    }
  });
};

function showError(error) {
  $('#error-content').text(error)
  $('#error').show()
}

//this will get an authentification token from your backend
function getToken(uid, callback) {
  $.ajax(AUTH_URL + uid, {
      dataType: 'json'
    })
    .done(function(response) {
      var token = response.token;
      if (!token) {
        showError('error getting the token:' + JSON.stringify(response))
      } else {
        console.log(token);
        callback(token);
      }
    })
    .fail(showError)
}

//start by getting a token, then initialize the rtcc object.
function initialize(userId, displayName) {
  bindAuthCallbacks(rtcc, userId);
  storedDisplayName = displayName
  getToken(userId, function(token) {
    rtcc.setToken(token);
    rtcc.initialize();
  });
}

//we connect with a UID and a display name.
initialize(currentUserUid, currentUserDisplayName);


/////////////
// CALLS////
/////////////


/**
 * Call
 *
 * In this part, we manage the creation and the reception of a  call. We use the rtcc.createCall function,
 * and we define the callbacks for changing the UI on various call events.
 *
 * Detailed tutorial available here:
 * https://docs.sightcall.com/GD/01_javascript/Tutorials/02_js_call.html
 */


//when we are connected to the presence service, we show the chat
rtcc.on('cloud.sip.ok', function() {
  $('#once_connected').show();
  $('#call').html('Ready for incoming/outgoing call');
})

// Define the callbacks each time we have a new call
function defineCallListeners(call) {
  if (call.getDirection() === "incoming") {
      $('#call').html('Receiving call from ' + call.dn);
  }
  call.onAll(function() {
    if (window.console) {
      console.log('Call: event "' + this.eventName + '"" with arguments: ' + JSON.stringify(arguments));
    }
  })
  call.on('active', function() {
    $('#call').html('Call active');
  });

  // for webrtc screen share
  call.on('chrome.screenshare.missing', function(url) {
    window.open(url);
  });

  call.on('terminate', function(reason) {
    if (reason === 'not allowed') {
      $('#call').html('Only allowed to call the parent, Mike in our case');
    } else {
      $('#call').html('Ready for incoming/outgoing call');
    }
  })
}

//when a call has started
rtcc.on('call.create', defineCallListeners)

//UI Bindings
makeCall = function(uid, displayName){

    $('#call').html('Calling ' + displayName);
    rtcc.createCall(uid, 'internal', displayName);
}

//

