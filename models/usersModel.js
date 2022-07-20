const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請輸入您的名字']
  },
  email: {
    type: String,
    required: [true, '請輸入您的 Email'],
    unique: true,
    lowercase: true,
    select: false
  },
  photo: String,
  sex:{
    type: String,
    enum:["male","female"] // enum列舉的意思 今天進來的字串只能是這兩個
  },
  password:{
    type: String,
    required: [true,'請輸入密碼'],
    minlength: 8,
    select: false
  },
  role:{
    type: String,
    enum:["user","admin","main"]
  },
  isLogin: {
    type: Boolean,
    default: false,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  followers: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  following: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  googleId: {
    type: String
  },
  activeStatus: {
    type: String,
    enum: ['none', 'meta', 'third', 'both'],
    default: 'none',
    select: false,
  },
  chatRecord: {
    type: [
      {
        roomId: {
          type: mongoose.Schema.ObjectId,
          ref: 'ChatRoom',
        },
        receiver: {
          type: mongoose.Schema.ObjectId,
          ref: 'user',
        },
      },
    ],
    default: [],
  },
},{
  versionKey: false,
});

const User = mongoose.model('user', userSchema);

module.exports = User;