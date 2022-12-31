var {collection, getCountFromServer, addDoc, updateDoc, doc, getDoc, getDocs, query, where, setDoc, deleteDoc} = require("firebase/firestore"); 
// database firestore
const db = require('./config')

var validator = require('validator');

// để upload image
var { getApp } = require ("firebase/app");
var { getStorage, ref, uploadBytes , getDownloadURL } = require ("firebase/storage");
// Get a non-default Storage bucket
const storage = getStorage(getApp(), "gs://tdtu-app-ab935.appspot.com");

const fs = require('fs');

const multiparty = require('multiparty');
const { stringify } = require("querystring");

const argon2 = require('argon2')
const crypto = require('crypto')

const saltRounds = 12;

const hashingConfig = { // based on OWASP cheat sheet recommendations (as of March, 2022)
    parallelism: 1,
    memoryCost: 64000, // 64 mb
    timeCost: 3 // number of itetations
}

class AccountController{

    async renderLogin(req, res){
        res.render('./login', {err: req.flash('msg-login')})
    }


    renderRegister(req, res){
        var fieldsFilled = null
        if (req.session.register) fieldsFilled = req.session.register
        res.render('./register', {err: req.flash('msg-register'), data: fieldsFilled})
    }

    renderChangePassword(req, res){
        res.render('./change_password', {err: req.flash('msg-change-password')})
    }

    logoutAccount(req, res) {
        delete req.session.user
        res.redirect('/login') 
    }

    createAccount(req, res){
        const form =  new multiparty.Form()
        form.parse(req,async (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                // console.log(fields.clb_department[0])
                
                const username = fields.clb_username[0]
                const name = fields.clb_name[0]
                const email = fields.clb_email[0] 
                const password = fields.clb_password[0]
                const repeatPassword = fields.clb_repeat_password[0]
                const faculty = fields.clb_department[0]
                req.session.register = {
                    username:username,
                    name: name,
                    email: email,
                    password: password,
                    repeatPassword: repeatPassword,
                    faculty:faculty
                }
                var errMessage = ""
                // check tên đăng nhập đã tồn tại
                const q_check = query(collection(db, "Users"), where("username", "==", username));
                const querySnapshot_check = await getDocs(q_check);
                var isExist = false
                querySnapshot_check.forEach((doc) => {
                    isExist = true
                });
                if (username==="" || name==="" || email==="" || password==="" || faculty==="")
                    errMessage = "Vui lòng nhập đầy đủ thông tin"
                else if (repeatPassword==="") errMessage = "Vui lòng xác nhận mật khẩu"
                else if (password.length < 8) errMessage = "Mật khẩu phải có tối thiểu 8 ký tự"
                else if (!validator.isEmail(email)) errMessage = "Email chưa đúng định dạng"
                else if (isExist) errMessage = "Tên đăng nhập đã tồn tại"
                else if (repeatPassword!==password) errMessage = "Xác nhận mật khẩu chưa đúng"
                

                if (errMessage === ""){ // không có lỗi
                    // khởi tạo hash
                    let salt = crypto.randomBytes(16);
                    var hash = await argon2.hash(password, {
                        ...hashingConfig,
                        salt,
                    })
                 
                    var dict = { 
                        name: fields.clb_name[0], 
                        username: username,
                        email: fields.clb_email[0], 
                        password: hash,
                        faculty :fields.clb_department[0],
                        role: "club" ,
                        bio: "",
                        avatar : "https://firebasestorage.googleapis.com/v0/b/tdtu-app-ab935.appspot.com/o/356-3562377_personal-user.png?alt=media&token=96693493-19f6-4d88-bd44-58e91cbea7d6",
                        check:false,
                        follower: [],
                        isBan: false
                    }
                    var data = JSON.parse(JSON.stringify(dict));
                    const docRef = doc(collection(db, "Users"))
                    await setDoc(doc(db, "Users", docRef.id), data);
                    res.redirect('/login')
                } else {
                    req.flash('msg-register', errMessage);
                    res.redirect('/register')
                }
            }
          })
    }

    changePassword(req, res){
        const form =  new multiparty.Form()
        form.parse(req, async (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var username = fields.username[0]
                var password = fields.old_pass[0]

                var newPass = fields.new_pass[0]
                var repeatNewPass = fields.repeat_new_pass[0]

                const docRef = collection(db, "Users")
                const q = query(docRef, where("username", "==", username))
                
                const querySnapshot = await getDocs(q);
                var bar = new Promise((resolve, reject) => { // để chờ hàm for xong
                    var isExist = false // kiểm tra user có tồn tại hay không
                    var id = ""
                     // kiểm tra user có tồn tại hay không
                    querySnapshot.forEach(async (doc) => {     // chỉ có 1 username vì username là duy nhất                    
                        const user = doc.data()
                        const result = await argon2.verify(user.password, password, hashingConfig);
                        if (result.toString() == true.toString()){ // có tồn tại user
                            isExist = true
                            id = doc.id
                        }
                        resolve({isExist: isExist, id: id}) 
                    })
                })
                bar.then( async (data) => {
                    var errMessage = ""
                    if (username=="" || password=="") errMessage = "Vui lòng nhập đầy đủ thông tin"
                    else if (!data.isExist) errMessage = "Tài khoản hoặc mật khẩu cũ không đúng"
                    else if (newPass.length < 8) errMessage = "Mật khẩu quá ngắn"
                    else if (newPass != repeatNewPass) errMessage = "Xác nhận mật khẩu không đúng"
                    
                    // khởi tạo hash
                    let salt = crypto.randomBytes(16);
                    var hash = await argon2.hash(newPass, {
                        ...hashingConfig,
                        salt,
                    })
    
                    if (errMessage === "" && data.id !== ""){
                        var dict = {
                            password: hash
                        }
                        const postRef = doc(db, "Users", data.id);
                        var data = JSON.parse(JSON.stringify(dict));
                        await updateDoc(postRef, data);
                        res.redirect('/login')
                    } else {
                        req.flash('msg-change-password', errMessage);
                        res.redirect('/change_password')
                    }
                })
            }
        })
    }


    async loginAccount(req, res){
        const form =  new multiparty.Form()
        form.parse(req, async (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var username = fields.clb_username[0]
                var password = fields.clb_password[0]

                const docRef = collection(db, "Users")
                const q = query(docRef, where("username", "==", username));
                const querySnapshot = await getDocs(q); // lấy hết user

                var bar = new Promise((resolve, reject) => { // để chờ hàm for xong
                    var isExist = false // kiểm tra user có tồn tại hay không
                    var isBan = false.toString(); // kiểm tra user có bị ban không
                    var role = "" // kiểm tra vai trò của user
                    var index = 0
                    querySnapshot.forEach(async (doc) => {     // chỉ có 1 username vì username là duy nhất                    
                        const user = doc.data()
                        const result = await argon2.verify(user.password, password, hashingConfig);
                        if (result.toString() == true.toString()){ // có tồn tại user
                            isExist = true
                            role = user.role
                            isBan = user.isBan.toString()
                        }
                        resolve({isExist: isExist, role: role, isBan: isBan}) 
                    })
                })
                bar.then((data) => {
                    var errMessage = ""
                    if (username==="" || password==="") errMessage = "Vui lòng nhập đầy đủ thông tin"
                    else if (!data.isExist) errMessage = "Tài khoản hoặc mật khẩu không đúng"
                    else if (data.isBan == true.toString()) errMessage = "Tài khoản của bạn đã bị khóa"

                    if (errMessage === ""){ // đúng username và mật khẩu
                        //console.log("Đăng nhập thành công");
                        req.session.user = {
                            username: username,
                        } 
                        // console.log(req.session.user.username)
                        if (data.role=="admin"){
                            res.redirect('/admin/view_post')
                        } else if (data.role=="club") {
                            res.redirect('/clb/home')
                        } else {
                            req.flash('msg-login', "Tài khoản của bạn không phải câu lạc bộ");
                            res.redirect('/login')
                        }
                        
                    } else {
                        req.flash('msg-login', errMessage);
                        res.redirect('/login')
                    }
                });
            }
          })
    } 
}

module.exports = new AccountController
