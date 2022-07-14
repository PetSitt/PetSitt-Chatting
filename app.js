const express = require("express");
const connect_MongoDB = require("./schemas/connect_db");
const cors = require('cors');
const app = express();
const port = 3000;

connect_MongoDB(); //DB 연결

app.use(cors({
  exposedHeaders:["authorization"],
  origin: '*', //출처 허용 옵션: 테스트용 - 전부허용!
  credentials: 'true', // 사용자 인증이 필요한 리소스(쿠키..등) 접근
}));

app.use(express.static("static"));
app.use(express.json()); // json형태의 데이터를 parsing하여 사용할 수 있게 만듦.
app.use(express.urlencoded({extended:false}));

app.listen(port, () => {
  console.log(port, "포트로 서버가 켜졌습니다.");
});