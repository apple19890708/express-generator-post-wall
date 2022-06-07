const { default: mongoose } = require('mongoose');
const {Schema, model} = require('mongoose');

const postSchema = new Schema(
	{
		content: {
			type: String,
			required: [true, 'Content 未填寫']
		},
		image: {
			type:String,
			default:""
		},
		createdAt: {
			type: Date,
			default: Date.now, //位配合創造貼文的新增時間把()移除
			select: false
		},
		user: { // 為引用user資料表的相關資訊
			type: mongoose.Schema.ObjectId,
			ref:"user", // 表示連接哪張資料表，不能寫 users 是因為 mongo 會自動幫加 s
			required: [true, '貼文 ID 未填']
		},
		// name: {
		// 		type: String,
		// 		required: [true, '貼文姓名未填寫']
		// },
		likes: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'user'
			}
		]
	}, {
		versionKey: false,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

postSchema.virtual('comments', { // 在貼文內掛上虛擬欄位
	ref: 'Comment',
	foreignField: 'post',
	localField: '_id' // 透過本地貼文 ID 尋找 comment 內相同 id 貼文
});
const Post = model('Post', postSchema);

module.exports = Post;