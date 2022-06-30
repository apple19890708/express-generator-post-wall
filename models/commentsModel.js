const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
	{
		comment: {
			type: String,
			required: [true, '訊息不可為空']
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'user',
			required: [true, '貼文必須要有對應發文者']
		},
		post: {
			type: mongoose.Schema.ObjectId,
			ref: 'post',
			require: ['true', '回復必須要有對應貼文']
		}
	},{
    versionKey: false,
  }
);
commentSchema.pre(/^find/, function(next) { // pre 為前置器的意思，如果有使用到 find 開頭的語法，就會觸發
	this.populate({
		path: 'user',
		select: 'name id createdAt photo'
	});
	next();
})
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;