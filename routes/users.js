const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/user');
const handleErrorAsync = require("../service/handleErrorAsync");

router.get('/', handleErrorAsync(UsersControllers.getUsers));

module.exports = router;
