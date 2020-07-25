
const webex = window.Webex.init({
  credentials: {
    access_token: 'MzVlMWNiYmYtNGNhMi00ZDM0LWJlOWItY2QzZjJkMzk1OTliNDZlY2RjMzQtNmE2_PF84_9a7361ca-2cd9-4da0-9088-c76d40d0dfcb'
  }
});

// var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdC11c2VyLTczNDkiLCJuYW1lIjoiR3Vlc3QgVXNlcidzIERpc3BsYXkgTmFtZSIsImlzcyI6IlkybHpZMjl6Y0dGeWF6b3ZMM1Z6TDA5U1IwRk9TVnBCVkVsUFRpODVZVGN6TmpGallTMHlZMlE1TFRSa1lUQXRPVEE0T0Mxak56WmtOREJrTUdSbVkySSIsImlhdCI6MTU5NTYyMTY5OCwiZXhwIjoxNTk1NjI1Mjk4fQ.m3S-k9LLPsWBXg-kma3ETY5TtO1USwINRbL3d48CkSw';
// // wait until the SDK is loaded and ready
// webex.once(`ready`, function() {
//     webex.authorization.requestAccessTokenFromJwt({jwt: token})
//       .then(() => {
//         // the user is now authenticated with a guest token (JWT)
//         // proceed with your app logic
//       })
// });

webex.meetings.register()
  .catch((err) => {
    console.error(err);
    alert(err);
    throw err;
  });

function bindMeetingEvents(meeting) {
  meeting.on('error', (err) => {
    console.error(err);
  });

  // Handle media streams changes to ready state
  meeting.on('media:ready', (media) => {
    if (!media) {
      return;
    }
    if (media.type === 'local') {
      document.getElementById('self-view').srcObject = media.stream;
    }
    if (media.type === 'remoteVideo') {
      document.getElementById('remote-view-video').srcObject = media.stream;
    }
    if (media.type === 'remoteAudio') {
      document.getElementById('remote-view-audio').srcObject = media.stream;
    }
  });

  // Handle media streams stopping
  meeting.on('media:stopped', (media) => {
    // Remove media streams
    if (media.type === 'local') {
      document.getElementById('self-view').srcObject = null;
    }
    if (media.type === 'remoteVideo') {
      document.getElementById('remote-view-video').srcObject = null;
    }
    if (media.type === 'remoteAudio') {
      document.getElementById('remote-view-audio').srcObject = null;
    }
  });

  // Of course, we'd also like to be able to leave the meeting:
  document.getElementById('hangup').addEventListener('click', () => {
    meeting.leave();
  });
}

// Join the meeting and add media
function joinMeeting(meeting) {

  return meeting.join().then(() => {
    const mediaSettings = {
      receiveVideo: true,
      receiveAudio: true,
      receiveShare: false,
      sendVideo: true,
      sendAudio: true,
      sendShare: false
    };

    // Get our local media stream and add it to the meeting
    return meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
      const [localStream, localShare] = mediaStreams;

      meeting.addMedia({
        localShare,
        localStream,
        mediaSettings
      });
    });
  });
}

document.getElementById('destination').addEventListener('submit', (event) => {
  // again, we don't want to reload when we try to join
  event.preventDefault();

  const destination = document.getElementById('invitee').value;

  return webex.meetings.create(destination).then((meeting) => {
    // Call our helper function for binding events to meetings
    bindMeetingEvents(meeting);

    return joinMeeting(meeting);
  })
  .catch((error) => {
    // Report the error
    console.error(error);
  });
});