const express = require("express");
const connect_MongoDB = require("./schemas/connect_db");
const http = require("http");
const cors = require('cors');
const webSocket = require("./socket.js");
const chatRouter = require("./routes/chats.js");
require("dotenv").config();

const app = express();
const port = process.env.CHAT_PORT || 8000;
// const port = 8000;
const server = http.createServer(app);

connect_MongoDB(); //DB 연결

app.use(cors({
  exposedHeaders: ["authorization"],
  origin: '*', //출처 허용 옵션: 테스트용 - 전부허용!
  credentials: 'true', // 사용자 인증이 필요한 리소스(쿠키..등) 접근
}));

app.use(express.static("static"));
app.use(express.json()); // json형태의 데이터를 parsing하여 사용할 수 있게 만듦.
app.use(express.urlencoded({extended:false}));

app.use((req, res, next) => {
  console.log(`Request URL: [${req.method}] -`, req.originalUrl, ' - ', new Date());
  next();
});

app.use('/chats', chatRouter);

// 채팅 관련
webSocket(server, app);

server.listen(port, () => {
  console.log(port, "포트로 서버가 켜졌습니다.");
});