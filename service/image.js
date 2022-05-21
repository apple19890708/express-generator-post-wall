const path = require('path');
const multer = require('multer');

const upload = multer({ // multer會把資料夾帶到 req.files
	limits: {
		fileSize: 2*1024*1024,
	},
	fileFilter(req, file, cb) {
		const ext = path.extname(file.originalname).toLowerCase();
		if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
			cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg、png 格式"));
		}
		cb(null, true);
	},
}).any(); // any 表示所有檔案都接收 也可設置單檔上傳指定為特定名稱

module.exports = upload;