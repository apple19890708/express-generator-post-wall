const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError')
const Post = require("../models/postsModel");
const Comment = require('../models/commentsModel');
const UploadControllers = require('./upload');
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
			select: 'comment user createdAt'
		}).sort(timeSort);
    handleSuccess(res, post);
  },
  async createdPosts(req, res, next) {
		const { body } = req;
		if (body.content == undefined) {
			return next(appError(400, "未填寫資料", next))
		} else {
			const data = {
				user: req.user.id,
				content: body.content,
			};
			if (req.files.length > 0) {
				data.image = await UploadControllers.uploadImg(req.files);
			}
			const newPost = await Post.create({
				...data,
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
					user: req.user.id,
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
	async addLike(req, res, next) {
		const id = req.params.id;
		await Post.findOneAndUpdate( // 找到貼文ID
			{ _id: id },
			{ $addToSet: { likes: req.user.id } } // 把ID資訊放入 addToSet 如果原本有資訊就不會推入 ， push 不管裡面有沒有一樣ID都會推
		);
		res.send({
      status: 'success',
      postId: id,
			userId: req.user.id
    });
	},
	async cancelLike(req, res, next) {
		const id = req.params.id;
		await Post.findOneAndUpdate( // 找到貼文ID
			{ _id: id },
      { $pull: { likes: req.user.id } } // 
		);
		res.send({
      status: 'success',
      postId: id,
			userId: req.user.id
    });
	},
	async getOnePost(req, res, next) {

		const post = await Post.find({ _id: req.params.id })
		.populate({
      path: 'user',
      select: 'name photo',
    })
		.populate({
      path: 'comments',
    });
    // 無資料，回傳空陣列
    res.send({ status: true, data: post });

	},
	async postCommentMessage(req, res, next) {
		const currentUser = req.user;
		const user = req.user.id;
		const post = req.params.id;
		const { comment } = req.body;
		const newComment = await Comment.create({
			post,
			user: currentUser,
			comment
		});
		res.send({
      status: 'success',
			data: {
				comments: newComment
			}
    });

	}
}

module.exports = posts;