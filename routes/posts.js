const express = require('express');
const handleErrorAsync = require("../service/handleErrorAsync");
const router = express.Router();
const PostsControllers = require('../controllers/post');

router.get('/', PostsControllers.getPosts);

router.post('/', handleErrorAsync(PostsControllers.createdPosts));


router.patch('/:id', handleErrorAsync(PostsControllers.updatePosts));

router.delete('/', handleErrorAsync(PostsControllers.deleteAllPosts));

router.delete('/:id', handleErrorAsync(PostsControllers.deleteSinglePosts));

module.exports = router;