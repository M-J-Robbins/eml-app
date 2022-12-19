const express = require('express')
const fs = require('fs');

const router = express.Router();

let emailData = fs.createReadStream('public/uploads/emaildata.json')
// console.log(emailData)



router.get("/", function(req, res){
    console.log('start page')
    res.render( "index", {emailData : ''})
});

module.exports = router;