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

class CLBController {
    
    // [GET] /user/home
    async renderHome(req, res, next) {
        // lấy thông tin user
        var username = "unknow clb"
        if (req.session.user) username = req.session.user.username
        else res.redirect('/login') // nếu chưa đăng nhập thì quay về trang login

        const club_q = query(collection(db, "Users"), where("username", "==", username)) // orderBy("create_date", "desc")
        const club_shapshot = await getDocs(club_q)
        var club = {}
        club_shapshot.forEach((doc) => {
            club = doc.data()
            club.id = doc.id
        });
        // console.log(JSON.parse(JSON.stringify(club)))

        // lấy bài viết của user
        const post_q =  query(collection(db, "Posts"), where("owner", "==", username))
        const post_shapshot = await getDocs(post_q);
        var posts = []
        const linkimg = "https://firebasestorage.googleapis.com/v0/b/tdtu-app-ab935.appspot.com/o/vyZ3XrkJTFJMEdJKbW0iADjB.jpg?alt=media&token=6e334561-fdc4-4a56-9269-9560f0105a15"
        
        post_shapshot.forEach((doc) => {

            var dict = {"id": doc.id, "data": doc.data()}
            var create_ts = new Date(doc.data().create_date) 
            var from_ts = new Date(doc.data().from)  
            var to_ts = new Date(doc.data().to)   
            dict.data.create_date = create_ts.getFullYear() + '-' + (1+create_ts.getMonth()) +'-'+ create_ts.getDate()
            dict.data.from = from_ts.getFullYear() + '-' + (1+from_ts.getMonth()) +'-'+ from_ts.getDate()
            dict.data.to = to_ts.getFullYear() + '-' + (1+to_ts.getMonth()) +'-'+ to_ts.getDate()
            var comment_array = []
            const comments = doc.data().comment

            for (const userCmt in comments){
                var cmt = comments[userCmt]
                comment_array.push({user: cmt.name, cmt:cmt.content, imgUser: cmt.avatar})
            }

            dict.comments = comment_array
            dict.avatar_club = club.avatar
            dict.name_club = club.name
            posts.push(dict)
        });

        // console.log(JSON.parse(JSON.stringify(posts)))
        res.render('./CLB/home', {club: JSON.parse(JSON.stringify(club)), posts: JSON.parse(JSON.stringify(posts))})
    }

    async createPost(req, res, next) {
        const form =  new multiparty.Form()
        form.parse(req, async(err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                
                const docRef = collection(db, "Users")
                const q = query(docRef, where("username", "==", req.session.user.username));
                const querySnapshot = await getDocs(q);
                var ischecked = true.toString()
                querySnapshot.forEach((doc) => { // có user thì đưa vào cookie rồi load vào clb/home
                    ischecked = doc.data().check.toString()
                });
                // nếu tài khoản đã được kích hoạt
                
                if (ischecked == true.toString()){
                    var localImg = files.post_content_img[0].path
                    var dict = { 
                        content: fields.post_content_text[0], 
                        owner: req.session.user.username ,
                        from: new Date(fields.post_content_from_date[0]).getTime() ,
                        to : new Date(fields.post_content_to_date[0]).getTime() ,
                        linkImg: localImg,
                        create_date: new Date().getTime() ,
                        field: fields.post_content_field[0],
                        comment: {},
                        like: [],
                        isBan: false,
                    }
    
                    const imageRef = ref(storage, localImg.split("\\").pop());
                    const blob = fs.readFileSync(localImg)
                    // uplooad file
                    const metadata = {
                        contentType: 'image/jpeg',
                      };
                    
                    try {
                        const docRef = doc(collection(db, "Posts"))
            
                        uploadBytes(imageRef, blob, metadata).then((snapshot) => {
                            getDownloadURL(snapshot.ref).then((downloadURL) => {
                                console.log(downloadURL)
                                dict.linkImg = downloadURL
                                var data = JSON.parse(JSON.stringify(dict));
                                setDoc(doc(db, "Posts", docRef.id), data);
                            })
                        });
                    } catch (e) {
                        console.error("Error adding document: ", e);
                    }
                } else {
                    console.error("Tài khoản của bạn chưa được kích hoạt");
                }
            }
          })

        res.redirect('/clb/home')
    }

    async getPost(req, res, next) {
        const data = req.params
        const docRef = doc(db, "Posts", data.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log("Document data:", );
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
        
        res.redirect('/clb/home')
    }

    updatePost(req, res, next) {
        const form =  new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.post_id[0]
                var dict = { 
                    content: fields.post_content_text[0], 
                    from: new Date(fields.post_content_from_date[0]).getTime(),
                    to : new Date(fields.post_content_to_date[0]).getTime(),
                    field: fields.post_content_field[0],
                }
                var localImg = files.post_content_img[0].path
                var fileType = ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'apng', 'avif', 'gif', 'svg', 'bmp', 'ico', 'tif', 'tiff']
                if (!fileType.includes(localImg.split(".").pop())) { // không phải định dạng hình
                    try {
                        const postRef = doc(db, "Posts", id);

                        var data = JSON.parse(JSON.stringify(dict));
                        updateDoc(postRef, data);
                    } catch (e) {
                        console.error("Error updating document: ", e);
                    }
                } else {
                    dict.linkImg = localImg
                    const imageRef = ref(storage, localImg.split("\\").pop());
                    const blob = fs.readFileSync(localImg)
                    // uplooad file
                    const metadata = {
                        contentType: 'image/jpeg',
                      };
                    
                    try {
                        const postRef = doc(db, "Posts", id);
            
                        uploadBytes(imageRef, blob, metadata).then((snapshot) => {
                            getDownloadURL(snapshot.ref).then((downloadURL) => {
                                dict.linkImg = downloadURL
                                var data = JSON.parse(JSON.stringify(dict));
                                updateDoc(postRef, data);
                            })
                        });
                    } catch (e) {
                        console.error("Error adding document: ", e);
                    }
                }
            }
          })
        res.redirect('/clb/home')
    }

    editProfile(req, res){
        const form =  new multiparty.Form()
        form.parse(req, async (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.club_id[0]
                var dict = { 
                    name: fields.edit_profile_name[0], 
                    faculty: fields.edit_profile_faculty[0]
                }
                var localImg = files.club_avatar[0].path
                var fileType = ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'apng', 'avif', 'gif', 'svg', 'bmp', 'ico', 'tif', 'tiff']
                if (!fileType.includes(localImg.split(".").pop())) { // không phải định dạng hình (hình rỗng)
                    try {
                        const postRef = doc(db, "Users", id);

                        var data = JSON.parse(JSON.stringify(dict));
                        await updateDoc(postRef, data);
                    } catch (e) {
                        console.error("Error updating document: ", e);
                    }
                } else {
                    dict.avatar = localImg
                    const imageRef = ref(storage, localImg.split("\\").pop());
                    const blob = fs.readFileSync(localImg)
                    // uplooad file
                    const metadata = {
                        contentType: 'image/jpeg',
                      };
                    
                    try {
                        const postRef = doc(db, "Users", id);
            
                        await uploadBytes(imageRef, blob, metadata).then((snapshot) => {
                            getDownloadURL(snapshot.ref).then( async (downloadURL) => {
                                dict.avatar = downloadURL
                                var data = JSON.parse(JSON.stringify(dict));
                                await updateDoc(postRef, data);
                            })
                        });
                    } catch (e) {
                        console.error("Error adding document: ", e);
                    }
                }
            }
          })
        res.redirect('/clb/home')
    }

    editBio(req, res){
        const form =  new multiparty.Form()
        form.parse(req, async (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.club_id[0]
                var dict = { 
                    bio: fields.club_bio[0], 
                }
                try {
                    const postRef = doc(db, "Users", id);

                    var data = JSON.parse(JSON.stringify(dict));
                    await updateDoc(postRef, data);
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
                
            }
          })
        res.redirect('/clb/home')
    }

    deletePost(req, res, next) {
        const form =  new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (err) {
              console.log(err)
            } else {
                var id = fields.post_id[0]
                try {
                    const postRef = doc(db, "Posts", id);
                    deleteDoc(postRef);
                } catch (e) {
                    console.error("Error delete document: ", e);
                }
            }
        })    
        res.redirect('/clb/home')
    }
}

async function getimgUser(username){
    const post_q =  query(collection(db, "Users"), where("username", "==", username))
    const userSnapshot = await getDocs(post_q);
    var avatar = ""
    userSnapshot.forEach((doc)=> {
        avatar = doc.data().avatar
    })
    // console.log("function",avatar)
    return avatar
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

module.exports = new CLBController;