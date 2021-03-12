const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const linkPreviewJs = require('link-preview-js');
const { getLinkPreview } = linkPreviewJs; 

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;


app.route('/getlinkpreview')
    .get((req,res)=>{
        const url = req.query.url;
        getLinkPreview(url)
         .then((data) => {
            if(data.contentType === 'text/html'){
                const link = data.url;
                 const name = data.siteName;
                 const imgUrl = data.images[0];
                res.json({link:link,name:name,imgUrl:imgUrl});
             }else{
                res.json({error:'the link must refer to a website'});
            }
         });
    })
    .post((req,res)=>{
        const url = req.body.url;
        getLinkPreview(url)
         .then((data) => {
             if(data.contentType === 'text/html'){
                 const link = data.url;
                 const name = data.siteName;
                 const imgUrl = data.images[0];
                res.json({link:link,name:name,imgUrl:imgUrl})
             }else{
                res.json({error:'the link must refer to a website'});
             }
         });
    })

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})