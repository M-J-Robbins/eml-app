const express = require('express')
const fs = require('fs');

const router = express.Router();

let emailData = ''

router.get("/", function(req, res){
    console.log('start page')
    res.render( "index", {emailData : ''})
});

module.exports = router;