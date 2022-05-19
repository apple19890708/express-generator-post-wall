const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError')
const Post = require("../models/postsModel");

const posts = {
  async getPosts(req, res) {
		// 貼文關鍵字搜尋與篩選
		const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt"
		const q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {};
		const post = await Post.find(q).populate({
				path: 'user',
				select: 'name photo'
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
				user: body.user,
				content: body.content,
				tags: body.tags,
				type: body.type,
				image: body.image
			})
			handleSuccess(res, newPost);
		}
  },
	async updatePosts(req, res, next) {
		const { body } = req;
		if (body.content == undefined) {
			return next(appError(400, "未填寫資料", next))
		} else{
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
			handleSuccess(res, posts);
		}
	},
	async deleteAllPosts(req, res, next) {
		const post = await Post.deleteMany({});
		handleSuccess(res, post);
	},
	async deleteSinglePosts(req, res, next) {
		const post = await Post.findByIdAndDelete(req.params.id)
		handleSuccess(res, post);
	},
}

module.exports = posts;