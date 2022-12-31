var {collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, setDoc, deleteDoc} = require("firebase/firestore"); 
// database firestore
const db = require('../controllers/config')

module.exports = async function checkLogin(req, res, next) {
    var username = ""
    if (req.session.user) username = req.session.user.username

    const docRef = collection(db, "Users")
    const q = query(docRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    var role = ""
    querySnapshot.forEach((doc) => { 
        role = doc.data().role
    });
    if (role != "") { // có tồn tại user
        if (role == "admin") {
            next();
        } else {
            console.log('role admin không hợp lệ');
            res.redirect("/login");
        }
    } else {
        console.log('không tìm thấy account của admin');
        res.redirect("/login");
    }
};