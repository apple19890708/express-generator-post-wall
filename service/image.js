const path = require('path');
const multer = require('multer');

const upload = multer({ // multer會把資料夾帶到 req.files
	limits: {
		fileSize: 2*1024*1024,
	},
	fileFilter(req, file, cb) {
		const ext = path.extname(file.originalname).toLowerCase(); // path.extname()方法用於獲取文件路徑的擴展部分。擴展字符串從路徑中最後一次出現的句點(。)返回到路徑字符串的末尾。如果文件路徑中沒有句點，則返回一個空字符串。
		const fileSize = parseInt(req.headers['content-length']);
		if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
			cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg、png 格式"));
		}
		if (fileSize >= 2*1024*1024) {
      cb(new Error("檔案需在 2 MB 內"));
    }
		cb(null, true);
	},
}).any(); // any 表示所有檔案都接收 也可設置單檔上傳指定為特定名稱

module.exports = upload;