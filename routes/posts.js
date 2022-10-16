const router = require('express').Router();
const handleErrorAsync = require("../service/handleErrorAsync");
const PostsControllers = require('../controllers/post');
const {isAuth} = require('../service/auth');
const upload = require('../service/image');

router.get('/', isAuth, PostsControllers.getPosts);

router.post('/', isAuth, upload, handleErrorAsync(PostsControllers.createdPosts));


router.patch('/:id', isAuth, handleErrorAsync(PostsControllers.updatePosts));

router.delete('/', isAuth, handleErrorAsync(PostsControllers.deleteAllPosts));

router.delete('/:id', isAuth, handleErrorAsync(PostsControllers.deleteSinglePosts));

router.post('/:id/likes', isAuth, handleErrorAsync(PostsControllers.addLike));

router.delete('/:id/likes', isAuth, handleErrorAsync(PostsControllers.cancelLike));

router.get('/user/:id', handleErrorAsync(PostsControllers.getOnePost));

router.post('/:id/comment', isAuth, handleErrorAsync(PostsControllers.postCommentMessage))

module.exports = router;