const jwt = require('jsonwebtoken');
const appError = require('../service/appError'); 
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccess = require('../service/handleSuccess');
const User = require('../models/usersModel');
const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(appError(401,'你尚未登入！',next));
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve,reject)=>{
    jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
      if(err){
        reject(appError(401, '驗證過期，請重新授權', next));
      }else{
        resolve(payload)
      }
    })
  })
  const currentUser = await User.findById(decoded.id).select("+isLogin");

  req.user = currentUser; // 將自己需要的資料帶到下一步處理
  next();
});
const generateSendJWT= (user, statusCode, res)=>{
  // 產生 JWT token
  const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  user.password = undefined;
  const userInfo = {
    token,
    name: user.name
  }
  handleSuccess(res, userInfo)
}

// 第三方登入 回傳轉址
const generateURLJWT= (user, res)=>{
  // 產生 JWT token
  const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  let path = `${process.env.WEBSITE_URL}/callback?token=${token}&id=${user._id}&name=${user.name}&avatar=${user.photo}`;
  if (user?.mode) {
    path += `&mode=${user.mode}`;
  }
  res.redirect(path) // 要上到heroku 要補上它的網址，會重新導向到前端
}

module.exports = {
    isAuth,
    generateSendJWT,
    generateURLJWT
}