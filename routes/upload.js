const express = require('express');
const handleErrorAsync = require("../service/handleErrorAsync");
const router = express.Router();
const UploadControllers = require('../controllers/upload');
const {isAuth} = require('../service/auth');
const upload = require('../service/image');

router.post('/', isAuth, upload, handleErrorAsync(UploadControllers.uploadImg));

module.exports = router; 