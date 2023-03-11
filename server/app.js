const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
    methods: ["GET", "POST"],
  },
});
io.use((socket, next) => {
  const { username } = socket.handshake.auth;
  if (!username)
    return next(new Error("Invalid username or no field user name"));
  next();
});
io.on("connection", (socket) => {
  console.log("a user connected", socket.handshake.auth);
  const { username } = socket.handshake.auth;
  socket.username = username;
  const users = [];
  console.log(io.of("/").sockets);
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userId: id,
      username: socket.username,
      messages: []
    });
  }
  socket.emit("getUsers", users);
  socket.broadcast.emit("userJustConnected", {
    userId: socket.id,
    username: socket.username,
    messages: []
  });
  socket.on("privateMessage", ({ message, to }) => {
    socket.to(to).emit("privateMessageToReceiver", {
      message,
      from: socket.id,
    });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
