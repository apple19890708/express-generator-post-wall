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
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;