const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// diskstorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Folder Name
      cb(null, './public/images/upload');
    },
    // File name satup
    filename: function (req, file, cb) {
         crypto.randomBytes(12, function(err, name) {
            const fn = name.toString("hex")+path.extname(file.originalname)// thats add file last name
            cb(null, fn)

         })    
    }
  })
  
  // export upload variables
  const upload = multer({ storage: storage })

  module.exports = upload;
