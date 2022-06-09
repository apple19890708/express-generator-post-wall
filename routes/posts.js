const express = require('express');
const handleErrorAsync = require("../service/handleErrorAsync");
const router = express.Router();
const PostsControllers = require('../controllers/post');
const {isAuth} = require('../service/auth');

router.get('/', isAuth, PostsControllers.getPosts);

router.post('/', isAuth, handleErrorAsync(PostsControllers.createdPosts));

module.exports = router;