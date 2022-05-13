const handleSuccess = require('../service/handleSuccess');
const User = require("../models/usersModel");

const users = {
	async getUsers(req, res) {
    const allUsers = await User.find();
    handleSuccess(res, allUsers);
  },
};

module.exports = users;