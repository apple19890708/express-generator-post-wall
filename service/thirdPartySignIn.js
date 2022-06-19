const uuid = require('uuid');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel');
const { generateURLJWT } = require('./auth');

const thirdPartySignIn = async (thirdPartyName, data, res) => {
	const {
    id, email, name, picture,
  } = data;
	
	const key = `${thirdPartyName}Id`;
	const userExisted = await User.findOne({ email }).select( //檢查使用者是否存在
    `+${key} +activeStatus +isLogin`,
  );

	let user;

	if (userExisted) {
		let userStateData = {};
		if (!userExisted[key]) { // 判斷登入方式，如果沒登入過 回傳 third，註冊過帳號，又使用google登入 回傳 both
			if (userExisted.activeStatus === 'none') {
        userStateData = { activeStatus: 'third' };
      } else if (userExisted.activeStatus === 'meta') {
        userStateData = { activeStatus: 'both' };
      } else {
				userStateData[key] = `${id}6666`; //為相對應的第三方登入加上ID
				userStateData['isLogin'] = true;
      	await User.updateOne({ email }, userStateData);
				await User.updateOne({ email }, {$set: {isLogin: true}});
			}
		}
		user = userExisted;
	} else {
		const randomPasswordBase = uuid.v4();
    const password = await bcrypt.hash(randomPasswordBase, 12); // 為第三方登入新帳戶創立一個假密碼
		const newUserData = {
      email,
      name,
      photo: picture,
      password,
			isLogin: true,
      activeStatus: 'third',
    };
		newUserData[key] = id;
		user = await User.create(newUserData);
	}
	generateURLJWT(user, res);
};

module.exports = thirdPartySignIn;