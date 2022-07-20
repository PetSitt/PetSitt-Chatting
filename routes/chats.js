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
    let chats = await Chat.find({ roomId });

    if (chats?.length) {
      const otherId = (el.userId !== user.id) ? el.userId : sitter_userId; 

      //채팅방 접속순간 내가 확인하게 되기 때문에 상대방의 newMessage는 모두 false 처리
      await Chat.updateMany(
        { 
          userId: otherId, 
          roomId 
        }, 
        { $set: { newMessage: false } },
      );

      chats = chats.map((el) => {
        const me = el.userId === user.id ? true : false;

        const chat = {
          newMessage: me ? el.newMessage : false,
          roomId:     el.roomId,
          userName:   el.userName,
          chatText:   el.chatText,
          createdAt:  el.createdAt,
          me,
        };

        return chat;
      });
    }

    //해당 사람의 소켓을 join 시킨다.
    const io = req.app.get('io');


    //상대방에게 내가 접속한걸 알린다. emit
    //why? 상대방쪽의 채팅 1 을 없애기 위해서

    return res.send({msg: "성공"});

  } catch {
    return res.status(400).send({ errorMessage: "DB정보를 받아오지 못했습니다." }); 
  }
});

// 채팅 보내기
router.post("/chatting", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;




    return res.send({msg: "성공"});
  } catch {
    return res.status(400).send({ errorMessage: "DB정보를 받아오지 못했습니다." }); 
  }
});

// 채팅방 만들기
router.post("/:sitterId", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;




    return res.send({msg: "성공"});
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
    other = await User.findById(otherId).exec();
    if (!other) { continue; }

    other_sitter = await Sitter.findOne({ userId: other.id }).exec();
    if (other_sitter) { imageUrl = other_sitter.imageUrl; }

    //room 정보 세팅
    room = {
      newMessage: rooms[i].newMessage,
      roomId:     rooms[i].id,
      userName:   other.userName,
      lastChat:   rooms[i].lastChat,
      lastChatAt: rooms[i].lastChatAt,
      imageUrl,
    };

    room_set.push(room);
  }

  return room_set;
};


module.exports = router;