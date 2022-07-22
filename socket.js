const { Server } = require("socket.io");

module.exports = (server, app) => {
  const io = new Server(server, {
    cors:{
      origin: '*', //출처 허용 옵션: 테스트용 - 전부허용!
      methods: ["GET", "POST"],
      credentials: 'true', // 사용자 인증이 필요한 리소스(쿠키..등) 접근
    },
  });
  
  const defaultSpace = io.of("/");

  defaultSpace.on("connection", (socket) => {
    console.log(`연결된 소켓 정보: ${socket.id}`);
    
    //내 개인방을 만든다.
    socket.on("join_my_room", (userEmail) => {
      socket.data.userEmail = userEmail;
      socket.join(userEmail);
      console.log(`ID: ${socket.id} joined my room: ${userEmail}`);
      console.log("모든방 정보", io.of("/").adapter.rooms);
    });

    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`ID: ${socket.id} joined room: ${data}`);
    });
  
    socket.on("send_message", (data) => {
      console.log(data);
      socket.to(data.room).emit("receive_message", data);
    });

    socket.on("check", async () => {
      console.log("현재 서버상태 체크--------------------------");
      console.log("모든방 정보: " + io.sockets.adapter.rooms);
      console.log("모든 소켓정보", await io.allSockets());
    });

    socket.on("leave", (data) => {
      console.log(`ID: ${socket.id} leave room: ${data.room}`);
      socket.leave(data.room);
    });
  
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });

  //app 에서 io를 사용할 수 있게 세팅합니다.
  app.set('io', io);
}