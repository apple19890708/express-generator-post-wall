const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({ // 訊息資訊 包含 訊息 傳送者 時間
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const ChatRoomSchema = new mongoose.Schema( // 聊天室設定
  {
    roomType: {
      type: Number,
      default: 0,
      enum: [0, 1], // 0=私人 //1=公開
    },
    members: {
      type: [mongoose.Types.ObjectId],
      required: true,
      default: [],
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    status: {
      type: Number,
      default: 0,
      enum: [0, 1, 2], // 0=正常  1=禁止發言  2=解散
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    versionKey: false,
  },
);

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
module.exports = ChatRoom;