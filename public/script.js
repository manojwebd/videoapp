const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
//myVideo.classList.add('dragg');
//myVideo.draggable = true; 
 


backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "",
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    //console.log('user stream',stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video"); 
      //video.setAttribute("id", "vlocalcam");
      myVideo.classList.add('localcam');
      call.on("stream", (userVideoStream) => { 
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      myVideo.classList.add('localcam'); 
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
   
  const video = document.createElement("video");
  //video.setAttribute("id", "v"+userId);
  call.on("stream", (userVideoStream) => {
    //myVideo.classList.add('localcam');
    //console.log('user',userVideoStream);
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    const time = moment().format('DD/MM/YYYY hh:mm:ss');
    socket.emit("message", {text:text.value,time});
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    const time = moment().format('DD/MM/YYYY hh:mm:ss');
    socket.emit("message", {text:text.value,time});
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><span><i class="far fa-user-circle"></i>  ${
          userName === user ? "me" : userName
        }</span> <time class="timeago" datetime="">${message.time}</time> </b>
        <span>${message.text}</span>
    </div>`;
});

socket.on("join-room", (roomid, id,userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <span>New user joined : ${userName} <hr/>Id:  ${id}</span>
    </div>`;
});
 
//${moment(message.time).fromNow()}
window.onbeforeunload = function () {
    socket.close();
};
/*$(window).on('beforeunload', function () {
     source.close();
});*/

