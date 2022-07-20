const express = require("express");
const connect_MongoDB = require("./schemas/connect_db");
const http = require("http");
const cors = require('cors');
const webSocket = require("./socket.js");
const chatRouter = require("./routes/chats.js");
const roomRouter = require("./routes/rooms.js");
require("dotenv").config();

const app = express();
// const port = process.env.CHAT_PORT || 8000;
const port = 8000;
const server = http.createServer(app);

connect_MongoDB(); //DB 연결

app.use(cors());
app.use(express.static("static"));
app.use(express.json()); // json형태의 데이터를 parsing하여 사용할 수 있게 만듦.
app.use(express.urlencoded({extended:false}));

app.use('/rooms', roomRouter);
app.use('/chats', chatRouter);

// 채팅 관련
webSocket(server, app);

server.listen(port, () => {
  console.log(port, "포트로 서버가 켜졌습니다.");
});