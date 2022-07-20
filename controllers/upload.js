const handleSuccess = require('../service/handleSuccess');
const appError = require('../service/appError');
const sizeOf = require('image-size');
const { ImgurClient } = require('imgur');
const upload = {
	async uploadImg(req, res, next) {
		if (!req.length) {
			return next(appError(400, "尚未上傳檔案", next));
		}
		// const dimension = sizeOf(req.files[0].buffer);
		// if (dimension.width !== dimension.height) {
		// 	return next(appError(400, "圖片長寬不符合 1:1 尺寸", next))
		// }
		const client = new ImgurClient({ // ImgurClient 套件用來夾帶 client資訊環境變數
			clientId : process.env.IMGUR_CLIENTID,
			clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN
		})
		const resData = [];
		for (let item of req) {
			const response = await client.upload({ // 會回傳一包物件資料
				image: item.buffer.toString('base64'), // 將圖片轉成 base64
				type: 'base64',
				album: process.env.IMGUR_ALBUM_ID // 要放置的相簿名稱
			})
			console.log('response', response)
			const newImageInfo = {
				url: response.data.link,
				deletehash: response.data.deletehash,
			}
			resData.push(newImageInfo);
		}
		return resData;
	}
};

module.exports = upload;