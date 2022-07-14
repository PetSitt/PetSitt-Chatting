const mongoose = require("mongoose");

const connect = () => {
  mongoose
  .connect("mongodb://127.0.0.1:27017/Tinder_Clone", { ignoreUndefined: true })
  .catch(err => console.error("db 연결이 되지 않았습니다."));      
};

module.exports = connect;