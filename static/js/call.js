var localstream = null;
var token = null;
var room = null;

var initcall = function (sessionid, username) {

    var socket = io.connect("http://conqueror.applait.com:8000/"),
        callidholder = document.getElementById("callid");

    socket.on("message", function (message) {
        if (message.type) {
            switch (message.type) {
            case "CONNECTION":
                checkcall();
                break;
            default:
                console.log(message.value);
                break;
            }
        }
    });

    var checkcall = function () {
        if (!localstream && !token && !room) {
            createcall();
        } else {
            console.log("Reconnecting call");
            if (room && room.connect) {
                room.disconnect();
                alert("Connection dropped.");
            }

        }
    };

    var createcall = function () {
        var callid = sessionid && sessionid.trim(),
            callmethod = "call:create",
            calldata = {};

        console.log(callid);

        if (callid) {
            callmethod = "call:connect";
            calldata.sessionid = callid;
        }

        calldata.username = username;

        socket.emit(callmethod, calldata, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }

            token = data.token;
            callidholder.innerHTML = data.session.id;

            localstream = Erizo.Stream({ audio: true, video: false, data: false });
            room = Erizo.Room({ roomID: data.session.data.room._id, token: token});

            localstream.addEventListener("access-accepted", function () {

                var subscribeall = function (streamslist) {
                    for (var index in streamslist) {
                        var currentstream = streamslist[index];
                        if (localstream.getID() !== currentstream.getID()) {
                            console.log("Subscribing Stream", currentstream);
                            room.subscribe(currentstream);
                        }
                    }
                };

                room.addEventListener("room-connected", function (roomevent) {
                    console.log("Connected to room");
                    room.publish(localstream, { maxAudioBW: 24}, function (pubid, err) {
                        if (pubid === undefined) {
                            console.log("Error publishing stream", err);
                        } else {
                            console.log("Published stream", pubid);
                        }
                    });
                    subscribeall(roomevent.streams);
                });

                room.addEventListener("stream-subscribed", function (streamevent) {
                    console.log("Stream subscribed. Trying to play", streamevent.stream);
                    var div = document.createElement("div");
                    div.setAttribute("id", "stream-" + streamevent.stream.getID());
                    document.querySelector("#audiocontainer").appendChild(div);
                    streamevent.stream.play("stream-" + streamevent.stream.getID());
                });

                room.addEventListener("stream-added", function (streamevent) {
                    console.log("Stream added fired");
                    var streams = [];
                    streams.push(streamevent.stream);
                    subscribeall(streams);
                });

                room.addEventListener("stream-failed", function (){
                    console.log("STREAM FAILED, DISCONNECTION");
                    room.disconnect();
                });

                room.addEventListener("stream-removed", function (streamevent) {
                    console.log("Removing stream", streamevent.stream);
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
        });
    };
};
