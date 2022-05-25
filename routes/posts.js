const express = require('express');
const handleErrorAsync = require("../service/handleErrorAsync");
const router = express.Router();
const PostsControllers = require('../controllers/post');
const {isAuth} = require('../service/auth');

router.get('/', isAuth, PostsControllers.getPosts);

router.post('/', isAuth, handleErrorAsync(PostsControllers.createdPosts));


router.patch('/:id', isAuth, handleErrorAsync(PostsControllers.updatePosts));

router.delete('/', isAuth, handleErrorAsync(PostsControllers.deleteAllPosts));

router.delete('/:id', isAuth, handleErrorAsync(PostsControllers.deleteSinglePosts));

router.post('/:id/likes', isAuth, handleErrorAsync(PostsControllers.addLike));

router.delete('/:id/likes', isAuth, handleErrorAsync(PostsControllers.cancelLike));

router.get('/user/:id', handleErrorAsync(PostsControllers.getUserInfo));

module.exports = router;