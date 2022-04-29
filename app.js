var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

//router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');

var app = express();

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

// app.use(login) 可寫在全域，也能單獨針對相關API做驗證
app.use('/', login, indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// error catch 404

app.use(function(req, res, next) {
	res.status(404).send('抱歉，您找的頁面不存在')
})

// error catch 500

app.use(function(err, req, res, next) {
	console.log('err', err.stack)
	res.status(500).send('程式發生問題，請稍後再試')
})

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
