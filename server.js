const express = require("express");
const app = express();
const server = require("http").Server(app);
/*
const fs = require("fs");
const https = require("https");
const credentials= {key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.crt")}

const httpsServer = https.createServer(credentials, app);*/

const { v4: uuidv4 } = require("uuid");
const room_id = uuidv4();
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true, 
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${room_id}`); 
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    //const time = moment().format("hh:mm A");
  socket.on("join-room", (roomId, userId, userName) => {
    io.to(roomId).emit("join-room", roomId, userId, userName);
    socket.join(roomId);

    console.log('new join to room',userId,roomId,userName)
    //socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
        console.log(message,userName)
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);

/*httpsServer.listen(3031, () => {
    console.log('HTTPS Server running on port 3031');
});*/