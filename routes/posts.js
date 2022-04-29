const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/post');

router.get('/', PostsControllers.getPosts);

router.post('/', PostsControllers.createdPosts);


router.patch('/:id', PostsControllers.updatePosts);

router.delete('/', PostsControllers.deleteAllPosts);

router.delete('/:id', PostsControllers.deleteSinglePosts);

module.exports = router;