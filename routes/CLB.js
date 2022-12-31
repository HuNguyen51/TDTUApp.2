const express = require('express');
const router = express.Router()
const CLBController = require('../app/controllers/CLBController');

const checkCLB = require("../app/middleware/checkCLB");
// router.use(checkLogin)
router.use(checkCLB);

router.get('/home', CLBController.renderHome)
// tạo bài viết mới
router.post('/create', CLBController.createPost)
// // lấy tất cả bài viết
// router.get('/posts', CLBController.getAllPost)
// // lấy 1 bài viết
// router.get('/posts/:id', CLBController.getPost)
// sửa 1 bài viết
router.post('/update', CLBController.updatePost)
// xóa 1 bài viết
router.post('/delete', CLBController.deletePost)
// sửa ảnh đại diện và tên
router.post('/edit_profile', CLBController.editProfile)
// tiểu sử
router.post('/edit_bio', CLBController.editBio)

module.exports = router;