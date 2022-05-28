const handleSuccess = require('../service/handleSuccess');
const User = require("../models/usersModel");
const appError = require('../service/appError');
const validator = require('validator'); // 使用者資料驗證
const bcrypt = require('bcryptjs');
const {generateSendJWT} = require('../service/auth');
const Post = require('../models/postsModel');

const users = {
	async getUsers(req, res) {
    const allUsers = await User.find().select("+password +isLogin").sort("-createdAt");
    handleSuccess(res, allUsers);
  },
  async signUpUser(req, res, next) {
    const errArr = [];
    let { email, password, confirmPassword, name, photo } = req.body;
    // 內容不為空
    if(!email || !password || !confirmPassword || !name) {
      errArr.push('欄位未填寫')
    }
    // 密碼不一致
    if(password !== confirmPassword) {
      errArr.push('密碼不一致')
    }
    // 密碼至少8位以上
    if(!validator.isLength(password, {min:8})) {
      errArr.push('密碼至少8位以上')
    }
    // Email格式錯誤
    if(!validator.isEmail(email)) {
      errArr.push('Email格式錯誤')
    }
    if(errArr.length > 0) {
      return next(appError("400", errArr, next));
    }
    // 加密密碼
    password = await bcrypt.hash(req.body.password,12);
    const newUser = await User.create({
      email,
      password,
      name,
      photo: photo || "https://thumb.fakeface.rest/thumb_male_10_8c02e4e9bdc0e103530691acfca605f18caf1766.jpg",
      role: "user",
      isLogin: "false"
    });
      generateSendJWT(newUser,201,res);
  },
  async signInUser(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, '帳號密碼不為空', next));
    }
    const user = await User.findOne({ email }).select('+password');
    const auth = await bcrypt.compare(password, user.password);
    await User.findByIdAndUpdate(user._id, { isLogin: true });
    if(!auth) {
      return next(appError(400, '密碼錯誤', next));
    }
    generateSendJWT(user, 200, res)
  },
  async signOutUser(req, res, next) {
    await User.findByIdAndUpdate(req.user._id, { isLogin: false }); // req.user 的來源是isAuth回傳的資料
    res.send({ 
      status: true,
      message: "登出成功" 
    });
  },

  async getUsersProfile(req, res, next) {
    res.send({
      status: 'success',
      user: req.user
    });
  },
  async updateUsersProfile(req, res, next) {
    const { body } = req;
    const data = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: body.name,
      },
      { new: true }
    )
    res.send({
      status: 'success',
      data
    });
  },
  async updatePassword(req, res, next) {
    const { password, confirmPassword } = req.body;
    if(password !== confirmPassword) {
      return next(appError(400, '密碼不一致', next));
    }
    newPassword =await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateSendJWT(user, 200, res);
  },
  async getLikeList(req, res, next) {
    const likeList = await Post.find({
      likes: { $in: [ req.user.id ] } // 再 POST資料表內尋找 likes陣列內的 user id 有符合的撈出 user資料表的 name、_id ; $in 表示 field 只要和 array 中的任意一个 value 相同，那么该文档就会被检索出来
    }).populate({
      path:'user',
      select:"name _id"
    });
    res.send({
      status: 'success',
      likeList
    });
  },
  async getUserCheck(req, res, next) {
    if (!req.user) return appError(401, "此帳號無法使用，請聯繫管理員", next);
    res.send({
      status: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        photo: req.user.photo,
      },
    });
  }
};

module.exports = users;