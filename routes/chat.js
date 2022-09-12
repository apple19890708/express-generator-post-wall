const router = require('express').Router();
const chatController = require('../controllers/chats');
const {isAuth} = require('../service/auth');
const handleErrorAsync = require("../service/handleErrorAsync");

// 尋找使用者去過的所有聊天室列表
router.get(
  '/chat-record',
  isAuth,
  handleErrorAsync(chatController.getChatRecord),
);

// 尋找公開聊天室列表
router.get(
  '/open-chat-record',
  isAuth,
  handleErrorAsync(chatController.getOpenChatRecord),
);

// 透過 對方個人頁 userId 取得與對方相對應房間資訊，沒有則創建新的
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
