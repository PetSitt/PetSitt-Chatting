const express = require("express");
const router = express.Router();
const { User }    = require("../schemas/user.js");
const { Sitter }  = require("../schemas/sitter.js");
const { Room }    = require("../schemas/room.js");
const { Chat }    = require("../schemas/chat.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

//채팅 리스트 요청
router.get("/chatList", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;

    //클라이언트로 보낼 rooms 데이터 세팅
    const room_set = await setRoomForm( user );

    return res.status(200).send({ rooms: room_set });

  } catch {
    return res.status(400).send({ errorMessage: "DB정보를 받아오지 못했습니다." }); 
  }
});


// 채팅방 접속
router.get("/:roomId", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { roomId } = req.params;

    const room = await Room.findById( roomId );
    if (!room) {
      return res.status(401).send({ errorMessage: "존재하지 않는 방입니다." }); 
    }

    // 해당 room의 모든 chat 가져오기
    const set_chats = [];
    let chats = await Chat.find({ roomId }).sort('createdAt');

    const otherId = (chats[0].userId !== user.id) ? chats[0].userId : sitter_userId; 

    if (chats?.length) {
      //채팅방 접속순간 내가 확인하게 되기 때문에 상대방의 newMessage는 모두 false 처리
      await Chat.updateMany(
        { 
          userId: otherId, 
          roomId 
        }, 
        { $set: { newMessage: false } },
      );

      for (let i = 0; i < chats.length; i++) {

        const me = chats[i].userId === user.id ? true : false;

        const chat = {
          newMessage: me ? chats[i].newMessage : false,
          roomId:     chats[i].roomId,
          userName:   chats[i].userName,
          chatText:   chats[i].chatText,
          createdAt:  new Date(chats[i].createdAt).getTime(),
          me,
        };

        set_chats.push(chat);
      }
    }

    //해당 사람의 소켓을 roomId방에 join 시킨다.
    const io = req.app.get('io');
    // io.of('/').in(socketId).socketsJoin( roomId ); //테스트해 봐야해요.
    io.of('/').in(`${ user.userEmail }`).socketsJoin( roomId );

    console.log("들어간 roomId: "+ roomId);
    console.log("모든방 정보: " + io.sockets.adapter.rooms);

    return res.status(200).send({ chats: set_chats });

  } catch {
    return res.status(400).send({ errorMessage: "DB정보를 받아오지 못했습니다." }); 
  }
});

// 채팅 보내기
router.post("/chatting", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { 
      socketId,
      roomId,
      message
    } = req.body;

    const room = await Room.findById( roomId );
    if (!room) {
      return res.status(401).send({ errorMessage: "존재하지 않는 방입니다." }); 
    }

    const otherId = (el.userId !== user.id) ? el.userId : sitter_userId;
    const other = await User.findById(otherId);
    if (!other) {
      return res.status(401).send({ errorMessage: "상대방이 존재하지 않습니다." }); 
    }

    const chat = new Chat({
      roomId,
      userId: user.id,
      userName: user.userName,
      chatText: message,
      me: false,
    });

    chat.save();

    // 방정보 업데이트
    room.lastChat = message;
    room.lastChatAt = chat.createdAt;
    room.save();

    //상대방에게 전달
    const io = req.app.get('io');
    // io.of('/').to(other.userEmail).emit("receive_message", chat );
    io.of('/').sockets.connected[socketId].to(roomId).emit("receive_message", chat );
    io.of('/').to(other.userEmail).emit("receive_chatList", { ...room, newMessage: true } );

    return res.send({msg: "성공"});
  } catch {
    return res.status(400).send({ errorMessage: "DB정보를 받아오지 못했습니다." }); 
  }
});

// 채팅방 만들기
router.post("/:sitterId", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const { sitterId } = res.params;

    const sitter = await Sitter.findById(sitterId);
    if (!sitter) {
      return res.status(401).send({ errorMessage: "상대방이 존재하지 않습니다." });
    }

    const room = new Room({
      userId: user.id,
      sitter_userId: sitter.userId,
    });

    room.save();

    return res.send({ chats: [] });

  } catch {
    return res.status(400).send({ errorMessage: "DB정보를 받아오지 못했습니다." }); 
  }
});


// 룸 리스트 정보 세팅
const setRoomForm = async ( user ) => {
  let other         = null;
  let otherId       = null;
  let other_sitter  = null;
  let room          = null;
  let imageUrl      = "https://kimguen-storage.s3.ap-northeast-2.amazonaws.com/sitterImage/default_user.jpg";
  const room_set    = [];

  // 유저 속해있는 모든 room 검색
  const rooms = await Room.find({
    $or: [
      { userId: user.id },
      { sitter_userId: user.id },
    ]
  });

  if (!rooms?.length) return null;

  for( let i = 0; i < rooms?.length; i++ ) {
    //초기화
    other         = null;
    otherId       = null;
    other_sitter  = null;
    room          = null;
    imageUrl = "https://kimguen-storage.s3.ap-northeast-2.amazonaws.com/sitterImage/default_user.jpg";

    //상대방 정보 가져오기
    otherId = (rooms[i].userId !== user.id) ? rooms[i].userId : rooms[i].sitter_userId; 
    other = await User.findById(otherId);
    if (!other) { continue; }

    other_sitter = await Sitter.findOne({ userId: other.id });
    if (other_sitter) { imageUrl = other_sitter.imageUrl; }

    //room 정보 세팅
    room = {
      newMessage: rooms[i].newMessage,
      roomId:     rooms[i].id,
      userName:   other.userName,
      lastChat:   rooms[i].lastChat,
      lastChatAt: new Date(rooms[i].lastChatAt).getTime(),
      imageUrl,
    };

    room_set.push(room);
  }

  return room_set;
};


module.exports = router;