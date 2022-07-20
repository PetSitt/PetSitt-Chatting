const { Server } = require("socket.io");

module.exports = (server, app) => {
  const io = new Server(server, {
    cors:{
      origin: '*', //출처 허용 옵션: 테스트용 - 전부허용!
      methods: ["GET", "POST"],
    },
  });
  
  const defaultSpace = io.of("/");

  defaultSpace.on("connection", (socket) => {
    console.log(`연결된 소켓 정보: ${socket}`);

    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`ID: ${socket.id} joined room: ${data.room}`);
      console.log("모든방 정보: " + io.sockets.adapter.rooms);
    });
  
    socket.on("send_message", (data) => {
      console.log(data);
      socket.to(data.room).emit("receive_message", data);
    });

    socket.on("leave", (data) => {
      console.log(data, "번방을 나감");
      socket.leave(data);
    });
  
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });

  //app 에서 io를 사용할 수 있게 세팅합니다.
  app.set('io', io);
}