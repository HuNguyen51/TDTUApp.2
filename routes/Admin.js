const express = require('express');
const { renderHome } = require('../app/controllers/AccountController');
const router = express.Router()
const AdminController = require('../app/controllers/AdminController');

const checkAdmin = require("../app/middleware/checkAdmin");
//Check
router.use(checkAdmin);

router.get('/view_post', AdminController.renderHome)
router.get('/view_baned_post', AdminController.renderBanedPost)
router.get('/view_account', AdminController.renderAccount)
router.get('/check_account', AdminController.renderCheckAccount)

//ban post
router.post('/ban', AdminController.banPost)
//allow post
router.post('/allow', AdminController.allowPost)
//ban or allow user
router.post('/ban_user', AdminController.banUser)
//accept user
router.post('/accept', AdminController.acceptUser)

module.exports = router;