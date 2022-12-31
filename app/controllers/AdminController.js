var {collection, limit, orderBy, addDoc, updateDoc, doc, getDoc, getDocs, query, where, setDoc, deleteDoc} = require("firebase/firestore"); 
// database firestore
const db = require('./config')

// để upload image
var { getApp } = require ("firebase/app");
var { getStorage, ref, uploadBytes , getDownloadURL } = require ("firebase/storage");
// Get a non-default Storage bucket
const storage = getStorage(getApp(), "gs://tdtu-app-ab935.appspot.com");

const fs = require('fs');

const multiparty = require('multiparty');
const { stringify } = require("querystring");
const { Console } = require("console");

class AdminController {
    // lấy bài viết đang được phép lưu hành
    async renderHome(req, res, next) {
        
        const post_q =  query(collection(db, "Posts") , where("isBan", "==", false))
        const post_shapshot = await getDocs(post_q);
        var posts = []
        post_shapshot.forEach((doc) => {
            // load bài viết
            const data = doc.data()
            var dict = {"id": doc.id, "data": data}
            var create_ts = new Date(doc.data().create_date) 
            var from_ts = new Date(doc.data().from)  
            var to_ts = new Date(doc.data().to)   
            dict.data.create_date = create_ts.getFullYear() + '-' + (1+create_ts.getMonth()) +'-'+ create_ts.getDate()
            dict.data.from = from_ts.getFullYear() + '-' + (1+from_ts.getMonth()) +'-'+ from_ts.getDate()
            dict.data.to = to_ts.getFullYear() + '-' + (1+to_ts.getMonth()) +'-'+ to_ts.getDate()
            posts.push(dict)
            
        });

        for (var ids in posts){
            const data = posts[ids].data
            const owner = data.owner
            // load user từ người sở hữu của bài viết
            const club_q = query(collection(db, "Users"), where("username", "==", owner))
            const club_shapshot = await getDocs(club_q)
            var club = {}
            club_shapshot.forEach((doc2) => {
                club = doc2.data()
                club.id = doc2.id
            });
            posts[ids].avatar_club = club.avatar
            posts[ids].name_club = club.name
        }
        console.log(posts)
        res.render('./admin/view_post', {posts: JSON.parse(JSON.stringify(posts))});
    }

    banPost(req, res){ 
        const form =  new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.post_id[0]
                var dict = { 
                    isBan: true, 
                }
                try {
                    const postRef = doc(db, "Posts", id);

                    var data = JSON.parse(JSON.stringify(dict));
                    updateDoc(postRef, data);
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
            }
          })
        res.redirect('/admin/view_post')
    }

    allowPost(req, res){
        const form =  new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.post_id[0]
                var dict = { 
                    isBan: false, 
                }
                try {
                    const postRef = doc(db, "Posts", id);

                    var data = JSON.parse(JSON.stringify(dict));
                    updateDoc(postRef, data);
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
            }
          })
        res.redirect('/admin/view_baned_post')
    }

    async renderBanedPost(req, res, next) { // xem các bài bị chặn
        // lấy bài viết của các clb
        const post_q =  query(collection(db, "Posts") , where("isBan", "==", true))
        const post_shapshot = await getDocs(post_q);
        var posts = []
        post_shapshot.forEach((doc) => {
            // load bài viết
            const data = doc.data()
            var dict = {"id": doc.id, "data": data}
            var create_ts = new Date(doc.data().create_date) 
            var from_ts = new Date(doc.data().from)  
            var to_ts = new Date(doc.data().to)   
            dict.data.create_date = create_ts.getFullYear() + '-' + (1+create_ts.getMonth()) +'-'+ create_ts.getDate()
            dict.data.from = from_ts.getFullYear() + '-' + (1+from_ts.getMonth()) +'-'+ from_ts.getDate()
            dict.data.to = to_ts.getFullYear() + '-' + (1+to_ts.getMonth()) +'-'+ to_ts.getDate()
            posts.push(dict)
            
        });

        for (var ids in posts){

            const data = posts[ids].data
            const owner = data.owner
            // load user từ người sở hữu của bài viết
            const club_q = query(collection(db, "Users"), where("username", "==", owner))
            const club_shapshot = await getDocs(club_q)
            var club = {}
            club_shapshot.forEach((doc2) => {
                club = doc2.data()
                club.id = doc2.id
            });
            posts[ids].avatar_club = club.avatar
            posts[ids].name_club = club.name
        }
        
        res.render('./admin/view_baned_post', {posts: JSON.parse(JSON.stringify(posts))});
    }

    async renderAccount(req, res, next) { 
        // xem tài khoản đã được check
        const q =  query(collection(db, "Users"), where('check', '==', true))
        const querySnapshot = await getDocs(q);
        var users = []

        querySnapshot.forEach((doc) => {
            // load bài viết
            const data = doc.data()
            var dict = data
            dict.id = doc.id
            users.push(dict)
            
        });
        

        res.render('./admin/view_account', {users: JSON.parse(JSON.stringify(users))});
    }

    banUser(req, res){
        const form =  new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.user_id[0]
                var isBan = false
                if (fields.is_ban[0] == true.toString()) isBan = true
                var dict = { 
                    isBan: isBan, 
                }
                try {
                    const postRef = doc(db, "Users", id);

                    var data = JSON.parse(JSON.stringify(dict));
                    updateDoc(postRef, data);
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
            }
          })
        res.redirect('/admin/view_account')
    }

    async renderCheckAccount(req, res, next) {
        // xem tài khoản chưa được check của câu lạc bộ
        const q =  query(collection(db, "Users"), where("check", '==', false), where("role", '==', 'club'))
        const querySnapshot = await getDocs(q);
        var users = []

        querySnapshot.forEach((doc) => {
            // load bài viết
            const data = doc.data()
            var dict = data
            dict.id = doc.id
            users.push(dict)
            
        });
        
        res.render('./admin/check_account', {users: JSON.parse(JSON.stringify(users))});
    }

    acceptUser(req, res){
        const form =  new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.user_id[0]
                var dict = { 
                    check: true, 
                }
                try {
                    const postRef = doc(db, "Users", id);

                    var data = JSON.parse(JSON.stringify(dict));
                    updateDoc(postRef, data);
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
            }
          })
        res.redirect('/admin/check_account')
    }

}

module.exports = new AdminController;