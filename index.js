const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const path = require("path");
const routes = require('./routes');

const EmlParser = require('eml-parser');
const fs = require('fs');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));

app.set("port", process.env.PORT ||3000)
app.use(routes);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: path.join(__dirname, 'temp'),
        createParentPath: true,
        limits: { fileSize: 20 * 1024 * 1024 },
    })
)

app.post('/', async (req, res) =>{
    try{
        // Get the uploaded file
        const file = req.files.emlFile
        // Save it
        const savePath = path.join(__dirname, 'public', 'uploads', 'email.eml')
        await file.mv(savePath)
        // Throw errors is needed
        if (file.truncated){
            throw new Error('File size is too big')
        }
        if (file.mimetype !== 'text/eml' && file.mimetype !== 'message/rfc822'){
            throw new Error('Unsuported format, please use text/eml, text/html or message/rfc822')
        }

        // Parse email file 
        let emailData = await new EmlParser(fs.createReadStream('public/uploads/email.eml'))
        .parseEml()
        .then(result  => {
            return result
        })        
        .catch(err  => {
            console.log(err);
        })     

        let data = JSON.stringify(emailData);
        fs.writeFileSync(path.join(__dirname, 'public', 'uploads', 'emaildata.json'), data);

        // Redirect back to homepage                
        res.render( "index", {emailData : emailData})
    } catch (error) {
        console.log(error)
        res.send(`<p>Error uploading file</p> <p><strong>${error}</strong></p>`)
    }
})

app.listen(app.get("port"),function(){
    console.log("server started on port http://localhost:" + app.get("port"));
})
