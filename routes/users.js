const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/user');
const handleErrorAsync = require("../service/handleErrorAsync");
const {isAuth} = require('../service/auth');

router.get('/', handleErrorAsync(UsersControllers.getUsers));
router.post('/sign_up', handleErrorAsync(UsersControllers.signUpUser));
router.post('/sign_in', handleErrorAsync(UsersControllers.signInUser));
router.get('/profile/', isAuth, handleErrorAsync(UsersControllers.getUsersProfile));
router.post('/updatePassword', isAuth, handleErrorAsync(UsersControllers.updatePassword));
router.get('/getLikeList', isAuth, handleErrorAsync(UsersControllers.getLikeList));
router.get('/getUserCheck', isAuth, handleErrorAsync(UsersControllers.getUserCheck))

module.exports = router;
