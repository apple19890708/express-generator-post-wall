const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError')
const Post = require("../models/postsModel");
const Comment = require('../models/commentsModel');

const posts = {
  async getPosts(req, res) {
		// 貼文關鍵字搜尋與篩選
		const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt"
		const q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {};
		const post = await Post.find(q).populate({
				path: 'user',
				select: 'name photo'
	  }).populate({
			path: 'comments',
			select: 'comment user'
		}).sort(timeSort);
    handleSuccess(res, post);
  },
  async createdPosts(req, res, next) {
		const { body } = req;
		if (body.content == undefined) {
			return next(appError(400, "未填寫資料", next))
		} else {
			const newPost = await Post.create({
				// user: body.user,
				user: req.user.id,
				content: body.content,
				tags: body.tags,
				type: body.type,
				image: body.image,
				likes: body.likes
			})
			handleSuccess(res, newPost);
		}
  }
}

module.exports = posts;