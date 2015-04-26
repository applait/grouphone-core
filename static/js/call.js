window.addEventListener("DOMContentLoaded", function () {
  var localstream = null;
  var token = null;
  var room = null;
  var socket = null;
  var membercount = 0;
  var creator;

  var initcall = function () {

    var callinfo = $("#callInfo"),
        calllink = $("#callLink input[type='text']");

    socket = io.connect(conqueror_path, { secure: true });

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

    socket.on("user:joined", function () {
      membercount++;
      updatecallinfo();
    });

    socket.on("user:dropped", function () {
      membercount--;
      updatecallinfo();
    });

    socket.on("call:ended", function () {
      if (localstream) localstream.close();
      if (room) room.disconnect();
      if (socket) socket.disconnect();
      callinfo.innerHTML = "Call ended by call creator";
      calllink.value = "...";
      window.onbeforeunload = null;
      room = socket = localstream = null;
      $("#mute").classList.add("hide");
      $("#share").classList.add("hide");
    });

    var updatecallinfo = function () {
      var infoString = ["In call with", creator.name];
      if ((membercount - 2) > 0) {
        infoString.push("<br>and", (membercount - 2));
        if ((membercount - 2) == 1) {
          infoString.push("other");
        } else {
          infoString.push("others");
        }
      }
      callinfo.innerHTML = infoString.join(" ");
    };

    var checkcall = function () {
      if (!localstream && !token && !room) {
        createcall();
      } else {
        // Try reconnecting here
        callinfo.innerHTML = "Call dropped.";
      }
    };

    var getcreator = function (members) {
      var user = null;
      var key;
      for (key in members) {
        if (members.hasOwnProperty(key) && members[key].creator) {
          user = members[key];
        }
      }
      creator = user;
      return user;
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
          switch (err.status) {
          case 401:
            callinfo.innerHTML = "Invalid data provided. Cannot join/create call.";
            break;
          case 403:
            callinfo.innerHTML = "Either you are already in this call from elsewhere<br>" +
              "(Or you don't have access to this one.)";
            break;
          case 500:
            callinfo.innerHTML = "Oops! Probably this call has ended.<br>Or, maybe, Grouphone is taking a nap.";
            break;
          default:
            callinfo.innerHTML = "Unable to create/join call. Grouphone seems busy. Please try again later.";
          }
          $("#callLink").classList.add("hide");
          $("#callActions").classList.add("hide");
          setTimeout(function () {
            $("#callLink").parentNode.removeChild($("#callLink"));
            $("#callActions").parentNode.removeChild($("#callActions"));
          }, 500);
          return;
        }

        // No error has been hit. Do stuff.
        sessionid = data.session.id;

        window.onbeforeunload = function () {
          return "Call in progress. Navigating away will end call. You can always press the 'End' button.";
        };

        var creator = getcreator(data.session.data.members);
        membercount = Object.keys(data.session.data.members).length;

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
            calllink.setAttribute("value", [location.origin, "join", data.session.id].join("/"));
            updatecallinfo();
            $("#callLink").classList.remove("hide");
            $("#callActions").classList.remove("hide");
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
        }, false);

        localstream.init();
        callinfo.innerHTML = "Waiting for you to share mic...";
      });
    };
  };

  // Start call
  initcall(sessionid);
  window.onunload = function () {
    if (room) room.disconnect();
    if (socket) {
      socket.emit("call:disconnect", { sessionid: sessionid, username: username }, function () {
        socket.disconnect();
      });
    }
  };

  $("#mute").addEventListener("click", function () {
    if (localstream && localstream.stream){
      if (localstream.stream.getAudioTracks()[0].enabled) {
        localstream.stream.getAudioTracks()[0].enabled = false;
        $("#mute svg use").setAttribute("xlink:href", "#icon-mute");
      } else {
        localstream.stream.getAudioTracks()[0].enabled = true;
        $("#mute svg use").setAttribute("xlink:href", "#icon-unmute");
      }
    }
  });

  $("#endCall").addEventListener("click", function () {
    if (room) room.disconnect();
    if (socket) {
      socket.emit("call:disconnect", { sessionid: sessionid, username: username }, function (err, sess) {
        socket.disconnect();
        window.onbeforeunload = null;
        location.assign("/app");
      });
    } else {
      window.onbeforeunload = null;
      location.assign("/app");
    }
  }, false);

  $("#share").addEventListener("click", function () {
    if (window.MozActivity) {
      new MozActivity({
        name: "share",
        data: {
          type: "url",
          url: $("#callLink input[type='text']").value.trim()
        }
      });
    } else $("#callLink input[type='text']").click();
  }, false);

});
