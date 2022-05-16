var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');


//router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');

var app = express();
// 程式出現重大錯誤時
process.on('uncaughtException', err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
	console.error('Uncaughted Exception！')
	console.error(err);
	process.exit(1);
});

require('./connections')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 可做為路由守衛使用
app.use(function(req,res,next) {
	console.log('驗證通過');
	next();
})

const login = function(req, res, next) {
	var _url = req.url;
	if(_url !== '/') {
		console.log('已登入');
		next();
	} else {
		console.log('首頁');
		next();
	}
}

// const checkKeyword = function(req,res,next){
// 	if(req.query.q){
// 		next()
// 	}else{
// 		res.status(400).json({
// 			"message":`您並未輸入關鍵字`
// 		})
// 	}
// }

// app.get('/search',checkKeyword,function(req,res){
// 	res.status(200).json({
// 		"status":"success",
// 		"keyword":`你搜尋到的是${req.query.q}`
// 	})
// })

// app.use(login) 可寫在全域，也能單獨針對相關API做驗證
app.use('/', login, indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// error catch 404

app.use(function(req, res, next) {
	res.status(404).send('抱歉，您找的頁面不存在')
})

// express 錯誤處理
// 自己設定的 err 錯誤 
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員'
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack
  });
};

// 錯誤處理
app.use(function(err, req, res, next) {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  } 
  // production
  if (err.name === 'ValidationError'){
    err.message = "資料欄位未填寫正確，請重新輸入！"
    err.isOperational = true;
    return resErrorProd(err, res)
  }
  resErrorProd(err, res)
});


// 補捉程式錯誤 不可預期錯誤 程式不會執行

process.on('uncaughtException', err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
	console.error('Uncaughted Exception！')
	console.error(err);
	process.exit(1);
});

// promise 未捕捉到的 catch 
process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
  // 記錄於 log 上
});

module.exports = app;
