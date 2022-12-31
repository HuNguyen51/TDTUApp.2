const admin = require('firebase-admin')

var serviceAccount = require("path/to/serviceAccountKey.json");
// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://tdtu-app-ab935.appspot.com"
})
// Cloud storage
const bucket = admin.storage().bucket()

module.exports = {
  bucket
}