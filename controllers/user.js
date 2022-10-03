const jwt = require('jsonwebtoken');
const path = require('path');
const handleSuccess = require('../service/handleSuccess');
const User = require("../models/usersModel");
const appError = require('../service/appError');
const validator = require('validator'); // 使用者資料驗證
const bcrypt = require('bcryptjs');
const {generateSendJWT} = require('../service/auth');
const Post = require('../models/postsModel');
const sendMail = require('../service/email');
const thirdPartySignIn = require('../service/thirdPartySignIn');
const UploadControllers = require('./upload');
const { validationResult } = require('express-validator');

const idPath = '_id';

const users = {
	async getUsers(req, res) {
    const allUsers = await User.find().select("+password +isLogin").sort("-createdAt");
    handleSuccess(res, allUsers);
  },
  async signUpUser(req, res, next) {
    const errArr = [];
    let { email, password, confirmPassword, name, photo } = req.body;

    const userData = await User.findOne({ email });
    if (userData && (userData.activeStatus === 'meta' || userData.activeStatus === 'both')) { // 啟用碼被啟用後才算，有可能放到過期
      return appError("400", '信箱已被使用', next);
    }

    if (!validator.isLength(name, { min: 2 })) {
      errArr.push('暱稱至少 2 個字元以上')
    }

    // 內容不為空
    if(!email || !password || !confirmPassword || !name) {
      errArr.push('欄位未填寫')
    }
    // 密碼不一致
    if(password !== confirmPassword) {
      errArr.push('密碼不一致')
    }
    // 密碼需至少 8 碼以上，並英數混合
    if(!validator.isLength(password, {
      minLength: 8,
      minUppercase: 0,
      minSymbols: 0,
    })) {
      errArr.push('密碼需至少 8 碼以上，並英數混合')
    }
    // Email格式錯誤
    if(!validator.isEmail(email)) {
      errArr.push('Email格式錯誤')
    }
    if(errArr.length > 0) {
      return next(appError("400", errArr, next));
    }
    const activeCode = jwt.sign({ email, name }, process.env.JWT_SECRET, { // 建立啟用碼
      expiresIn: '1d',
    });
    const mail = { //建立信件內容
      from: 'MetaWall <metawall001@gmail.com>',
      subject: '[MetaWall]帳號啟用確認信',
      to: email,
      text: `尊敬的 ${name} 您好！點選連結即可啟用您的 MetaWall 帳號，[${process.env.HEROKU_URL}/users/checkCode?code=${activeCode}] 為保障您的帳號安全，請在24小時內點選該連結，您也可以將連結複製到瀏覽器位址列訪問。`,
    };
    const result = await sendMail(mail);

    if (!result.startsWith('250 2.0.0 OK')) {
      return appError(422, '寄送確認信件失敗，請嘗試其他信箱', next);
    }

    password = await bcrypt.hash(req.body.password, 12);
    if (!userData) {
      await User.create({ email, password, name });
    } else {
      await User.findByIdAndUpdate(userData[idPath], { password });
    }

    return res.send({ status: true, message: '已將啟用確認信件寄送至您的信箱' });

    // 加密密碼
    // password = await bcrypt.hash(req.body.password,12);
    // const newUser = await User.create({
    //   email,
    //   password,
    //   name,
    //   photo: photo || "https://thumb.fakeface.rest/thumb_male_10_8c02e4e9bdc0e103530691acfca605f18caf1766.jpg",
    //   role: "user",
    //   isLogin: "false"
    // });
    //   generateSendJWT(newUser,201,res);
  },
  // 帳號啟用檢查

  async checkCode(req, res) { // 透過啟動碼連結檢查啟動碼是否過期
    // 解析token
    const decodedToken = await new Promise((resolve) => {
      jwt.verify(req.query.code, process.env.JWT_SECRET, (error, payload) => {
        if (error) {
          res.sendFile(
            path.join(__dirname, '../public/emailCheckFailed.html'),
          );
        } else {
          resolve(payload);
        }
      });
    });

    // 取得註冊的資料
    const userData = await User.findOne({
      email: decodedToken.email,
    }).select('+activeStatus');
    // 再次確認
    if (!userData) {
      res.sendFile(path.join(__dirname, '../public/emailCheckFailed.html'));
      return;
    }

    if (decodedToken?.mode && decodedToken.mode === 'forgetPassword') {
      userData.mode = 'forgetPassword';
      return generateUrlJWT(userData, res);
    }

    // 更新啟用狀態
    let activeStatus;
    if (userData.activeStatus === 'none') {
      activeStatus = 'meta';
    } else if (userData.activeStatus === 'third') { // 如果啟動狀態為之前已經有過的第三方登入則改成 both
      activeStatus = 'both';
    } else {
      // 已經啟用
      res.sendFile(path.join(__dirname, '../public/emailCheckFailed.html'));
      return;
    }
    await User.findByIdAndUpdate(userData[idPath], {
      name: decodedToken.name,
      activeStatus,
    });

    res.sendFile(path.join(__dirname, '../public/emailCheckSuccess.html'));
  },

  // 第三方登入（google）
  async google(req, res) {
    const data = {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    };
    thirdPartySignIn('google', data, res);
  },

  async signInUser(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, '帳號密碼不為空', next));
    }
    
    const user = await User.findOne({ email }).select('+password +activeStatus');
    if (!user) {
      return appError(401, '信箱或密碼錯誤', next);
    }
    if (user.activeStatus === 'none' || user.activeStatus === 'third') {
      return appError(401, '尚未啟用一般登入', next);
    }
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      return appError(401, '信箱或密碼錯誤', next);
    }
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
// 忘記密碼
  async forgetPassword(req, res, next) {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      return appError(400, '輸入資料錯誤', next);
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return appError(400, '信箱未註冊', next);
    }

    const activeCode = jwt.sign({ email, name: userData.name, mode: 'forgetPassword' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const mail = {
      from: 'MetaWall <metawall001@gmail.com>',
      subject: '[MetaWall]密碼重置確認信',
      to: email,
      text: `尊敬的 ${userData.name} 您好！請點選連結進入 MetaWall 修改您的帳號密碼，[${process.env.HEROKU_URL}/users/checkCode?code=${activeCode}] 為保障您的帳號安全，請在24小時內點選該連結，您也可以將連結複製到瀏覽器位址列訪問。`,
    };
    const result = await sendMail(mail);

    if (!result.startsWith('250 2.0.0 OK')) {
      return appError(422, '寄送信件失敗', next);
    }

    return res.send({ status: true, message: '已將密碼變更信件寄送至您的信箱' });
  },
  async getOtherUsersProfile(req, res, next) {
    const userData = await User.findById(req.params.id);
    res.send({
      status: 'success',
      user: userData
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

    const data = {
      name: body.name,
    };
    if (req.files.length > 0) {
      const resPhotoInfo = await UploadControllers.uploadImg(req.files);
      data.photo = resPhotoInfo[0].url;
    }

    const resInfo = await User.findByIdAndUpdate(
      req.user._id,
      data,
      { new: true }
    )
    res.send({
      status: 'success',
      resInfo
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
  },
  async addFollowr(req, res, next) {
    if(req.params.id === req.user.id) {
      return next(appError(401, "您無法追蹤自己", next));
    }
    const following = await User.find({
      'followers.user': { $in: [req.user._id] }
    })
    const isFollowing = following.some(item => req.params.id === item._id.valueOf());
    if (isFollowing) {
      return next(appError(401, "您已追蹤過此人", next));
    }
    await User.updateOne(
      {
        _id: req.user.id,
        'following.user': { $ne: req.params.id }
      },
      {
        $addToSet: { // $addToSet 有資料就不加入，我追蹤了誰
          following: {
            user: req.params.id
          }
        }
      }
    );
    await User.updateOne( // 誰被我追蹤了
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id }
      },
      {
        $addToSet: {
          followers: {
            user: req.user.id
          }
        }
      }
    );
    res.send({
      status: 'success',
      message: '您已成功追蹤！'
    });
  },
  async cancelFollowing(req, res, next) {
    if(req.params.id === req.user.id) {
      return next(appError(401, "您無法取消追蹤自己", next));
    }
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $pull: {
          following: {
            user: req.params.id
          }
        }
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $pull: {
          followers: {
            user: req.user.id
          }
        }
      }
    );
    res.send({
      status: 'success',
      message: '您取消追蹤！'
    });
  },
  async getUserFollowing(req, res, next) {
    const following = await User.find({
      'followers.user': { $in: [req.user._id] } // 在 User 資料表內尋找 followers user 為 req.user._id 的資料
    }).select('name photo _id');
    res.send({
      status: 'success',
      following
    });
  }
};

module.exports = users;