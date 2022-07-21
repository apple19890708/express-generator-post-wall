const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/user');
const handleErrorAsync = require("../service/handleErrorAsync");
const { generateURLJWT} = require('../service/auth');
const passport = require('passport');
const upload = require('../service/image');

router.get('/', handleErrorAsync(UsersControllers.getUsers));
router.post('/sign_up', handleErrorAsync(UsersControllers.signUpUser));
router.post('/sign_in', handleErrorAsync(UsersControllers.signInUser));
router.post('/sign_out',  handleErrorAsync(UsersControllers.signOutUser));
router.get('/profile/',  handleErrorAsync(UsersControllers.getUsersProfile));
router.get('/:id',  handleErrorAsync(UsersControllers.getOtherUsersProfile));
router.patch('/profile/',  upload, handleErrorAsync(UsersControllers.updateUsersProfile));
router.post('/updatePassword',  handleErrorAsync(UsersControllers.updatePassword));
router.get('/getLikeList',  handleErrorAsync(UsersControllers.getLikeList));
router.get('/getUserCheck',  handleErrorAsync(UsersControllers.getUserCheck));
router.post('/:id/follow',  handleErrorAsync(UsersControllers.addFollowr));
router.delete('/:id/unfollow',  handleErrorAsync(UsersControllers.cancelFollowing));
router.get('/following',  handleErrorAsync(UsersControllers.getUserFollowing));
// google登入
router.get('/google', passport.authenticate('google', {
	scope: ['email', 'profile']
}));
// google callback
router.get('/google/callback', passport.authenticate('google', { 
	session: false,
}), handleErrorAsync(UsersControllers.google));
// 檢查註冊信
router.get('/checkCode', handleErrorAsync(UsersControllers.checkCode));

module.exports = router;
