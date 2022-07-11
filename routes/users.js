const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/user');
const handleErrorAsync = require("../service/handleErrorAsync");
const {isAuth, generateURLJWT} = require('../service/auth');
const passport = require('passport');
const upload = require('../service/image');

router.get('/', handleErrorAsync(UsersControllers.getUsers));
router.post('/sign_up', handleErrorAsync(UsersControllers.signUpUser));
router.post('/sign_in', handleErrorAsync(UsersControllers.signInUser));
router.post('/sign_out', isAuth, handleErrorAsync(UsersControllers.signOutUser));
router.get('/profile/', isAuth, handleErrorAsync(UsersControllers.getUsersProfile));
router.patch('/profile/', isAuth, upload, handleErrorAsync(UsersControllers.updateUsersProfile));
router.post('/updatePassword', isAuth, handleErrorAsync(UsersControllers.updatePassword));
router.get('/getLikeList', isAuth, handleErrorAsync(UsersControllers.getLikeList));
router.get('/getUserCheck', isAuth, handleErrorAsync(UsersControllers.getUserCheck));
router.post('/:id/follow', isAuth, handleErrorAsync(UsersControllers.addFollowr));
router.delete('/:id/unfollow', isAuth, handleErrorAsync(UsersControllers.cancelFollowing));
router.get('/following', isAuth, handleErrorAsync(UsersControllers.getUserFollowing));
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
