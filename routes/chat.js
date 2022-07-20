const router = require('express').Router();
const chatController = require('../controllers/chats');
const {isAuth} = require('../service/auth');
const handleErrorAsync = require("../service/handleErrorAsync");

// 取得聊天記錄
router.get(
  '/chat-record',
  isAuth,
  handleErrorAsync(chatController.getChatRecord),
);

router.post(
  '/room-info',
  isAuth,
  handleErrorAsync(chatController.postRoomInfo),
);

router.delete(
  '/chat-record',
  isAuth,
  handleErrorAsync(chatController.deleteChatRecord),
);

router.delete(
  '/room-record',
  isAuth,
  handleErrorAsync(chatController.deleteRoomRecord),
);
module.exports = router;
