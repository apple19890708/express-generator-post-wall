const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');
const Post = require("../models/postsModel");

const posts = {
  async getPosts(req, res) {
    // const post = await Post.find().populate({
		// 	path: 'user',
		// 	select: 'name photo'
		// });

		// 貼文關鍵字搜尋與篩選
		const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt"
		const q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {};
		const post = await Post.find(q).populate({
				path: 'user',
				select: 'name photo'
	  }).sort(timeSort);
    handleSuccess(res, post);
  },
  async createdPosts(req, res) {
    try {
      const { body } = req;
			const userId = '626bf8b06793149aa8f975f9';
      if (body.content) {
        const newPost = await Post.create({
          // user: body.user,
					user: userId, // 先固定會員ID
          content: body.content,
          tags: body.tags,
          type: body.type,
					image: body.image
        })
        handleSuccess(res, newPost);
      } else {
        handleError(res);
      }
    } catch (err){
      handleError(res, err);
    }
  },
	async updatePosts(req, res) {
		try {
			const { body } = req;
			if (body.content) {
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
			} else {
        handleError(res);
      }
		} catch (error) {
			handleError(res);
		}
	},
	async deleteAllPosts(req, res) {
		try {
			const post = await Post.deleteMany({});
			handleSuccess(res, post);
		} catch (error) {
			handleError(res);
		}
	},
	async deleteSinglePosts(req, res) {
		try {
			const post = await Post.findByIdAndUpdate(req.params.id)
			handleSuccess(res, post);
		} catch (error) {
			handleError(res);
		}
	},
}

module.exports = posts;