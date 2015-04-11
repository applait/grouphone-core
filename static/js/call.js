window.addEventListener("DOMContentLoaded", function () {
  var localstream = null;
  var token = null;
  var room = null;
  var socket = null;

  var initcall = function () {

    var callinfo = $("#callInfo"),
        calllink = $("#callLink input[type='text']");

    socket = io.connect("http://conqueror.applait.com:8000/");

    socket.on("message", function (message) {
      if (message.type) {
        switch (message.type) {
        case "CONNECTION":
          checkcall();
          break;
        case "STATUS":
          callinfo.innerHTML = message.value;
          break;
        }
      }
    });

    var checkcall = function () {
      if (!localstream && !token && !room) {
        createcall();
      } else {
        // Try reconnecting here
        callinfo.innerHTML = "Reconnecting...";
      }
    };

    var getcreator = function (members) {
      var creator = null;
      var key;
      for (key in members) {
        if (members.hasOwnProperty(key) && members[key].creator) {
          creator = members[key];
        }
      }
      return creator;
    };

    var createcall = function () {
      var callid = sessionid && sessionid.trim(),
          callmethod = "call:create",
          calldata = {};

      if (callid) {
        callmethod = "call:connect";
        calldata.sessionid = callid;
      }

      calldata.username = username;

      socket.emit(callmethod, calldata, function (err, data) {
        if (err) {
          console.log(err);
          callinfo.innerHTML = "Unable to create call";
          return;
        }

        window.onbeforeunload = function () {
          return "Call in progress. Navigating away will end call. You can always press the 'End' button.";
        };

        var creator = getcreator(data.session.data.members);
        var membercount = Object.keys(data.session.data.members).length;

        token = data.token;

        localstream = Erizo.Stream({ audio: true, video: false, data: false });
        room = Erizo.Room({ roomID: data.session.data.room._id, token: token});

        localstream.addEventListener("access-accepted", function () {

          callinfo.innerHTML = "Got stream. Connecting to call...";

          var subscribeall = function (streamslist) {
            for (var index in streamslist) {
              var currentstream = streamslist[index];
              if (localstream.getID() !== currentstream.getID()) {
                room.subscribe(currentstream);
              }
            }
          };

          room.addEventListener("room-connected", function (roomevent) {
            room.publish(localstream, { maxAudioBW: 24}, function (pubid, err) {
              if (pubid === undefined) {
                console.log("Error publishing stream");
                callinfo.innerHTML = "Unable to publish stream";
              }
            });
            calllink.value = "http://grouphone.me/join/" + data.session.id;
            callinfo.innerHTML = "Call started by " + creator.name + "<br>";
            if ((membercount - 2) > 0) {
              callinfo.innerHTML += "with " + (membercount - 2);
              callinfo.innerHTML += (membercount - 2) > 1 ? " others" : " other";
            }
            subscribeall(roomevent.streams);
          });

          room.addEventListener("stream-subscribed", function (streamevent) {
            var div = document.createElement("div");
            div.setAttribute("id", "stream-" + streamevent.stream.getID());
            document.querySelector("#audiocontainer").appendChild(div);
            streamevent.stream.play("stream-" + streamevent.stream.getID());
          });

          room.addEventListener("stream-added", function (streamevent) {
            var streams = [];
            streams.push(streamevent.stream);
            subscribeall(streams);
          });

          room.addEventListener("stream-failed", function (){
            callinfo.innerHTML = "Stream dropped";
            room.disconnect();
          });

          room.addEventListener("stream-removed", function (streamevent) {
            if (streamevent.stream.elementID !== undefined) {
              var streamer = document.getElementById(streamevent.stream.elementID);
              if (streamer) {
                document.querySelector("#audiocontainer").removeChild(streamer);
              }
            }
          });

          room.connect();
          localstream.play("localaudio");
        });

        localstream.init();
        callinfo.innerHTML = "Waiting for you to share mic...";
      });
    };
  };

  // Start call
  initcall(sessionid);
  window.onunload = function () {
    if (room) room.disconnect();
    if (socket) socket.disconnect();
  };

  $("#endCall").addEventListener("click", function () {
    if (room) room.disconnect();
    if (socket) socket.disconnect();
    window.onbeforeunload = null;
    location.assign("/app");
  });

});
