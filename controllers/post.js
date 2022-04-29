const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');
const Post = require("../models/postsModel");

const posts = {
  async getPosts(req, res) {
    const allPosts = await Post.find();
    handleSuccess(res, allPosts);
  },
  async createdPosts(req, res) {
    try {
      const { body } = req;
      if (body.content) {
        const newPost = await Post.create({
          name: body.name,
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