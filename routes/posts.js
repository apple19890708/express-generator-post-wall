const express = require('express');
const router = express.Router();
const Post = require("../models/postsModel")

router.get('/', async (req, res, next) => {
	const post = await Post.find();
  res.status(200).json({
    post
  })
});

router.post('/', async (req, res, next) => {
	const newPost = await Post.create({
		content: req.body.content,
		image: req.body.image,
		name: req.body.name
	})
	res.status(200).json({
    status: "success",
		post: newPost
  })
})

router.patch('/:id', async (req, res, next) => {
	console.log('req.params.id', req.params.id)
	const posts = await Post.findByIdAndUpdate(
		req.params.id, 
		{
			content: req.body.content,
			image: req.body.image,
			name: req.body.name
		},
		{
			returnDocument: 'after',
		}
	);
	res.status(200).json({
		status: "success",
		post: posts
	})
})

router.delete('/', async (req, res, next) => {
	const post = await Post.deleteMany({});
  res.status(200).json({
		status: "success",
    post
  })
})

router.delete('/:id', async (req, res, next) => {
	const posts = await Post.findByIdAndUpdate(req.params.id)
	res.status(200).json({
    status: "success",
		post: posts
  })
})

module.exports = router;