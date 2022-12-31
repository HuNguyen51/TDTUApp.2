const express = require('express');
const router = express.Router()

const AccountController = require('../app/controllers/AccountController');

// [GET] /login
router.get('/login', AccountController.renderLogin)
// [GET] /register
router.get('/register', AccountController.renderRegister)
// [GET] /register
router.get('/change_password', AccountController.renderChangePassword)
// [GET] /logout
router.get('/logout', AccountController.logoutAccount)

// [POST] /register
router.post('/register', AccountController.createAccount)
// [POST] /login
router.post('/login', AccountController.loginAccount)
// [POST] /change_password
router.post('/change_password', AccountController.changePassword)


module.exports = router