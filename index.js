const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const svg2img = require("svg2img");
const linkPreviewJs = require("link-preview-js");
const facebookGetLink = require("facebook-video-link");
const { getLinkPreview } = linkPreviewJs;
const path = require('path');
const app = express();

app.use('/countries',express.static(__dirname +"/countries"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

const convertAllSvgFlagToImg = async (data, alpha3CodeTable) => {
  for (i = 0; i < data.length; i++) {
    let svgString;
    let name = `${alpha3CodeTable[i]}.jpg`;
    svgString = await axios.default.get(data[i]["flag"]).then((response) => {
      return response.data;
    });
    await svg2img(
      svgString,
      { format: "jpg", quality: 75 },
      function (error, buffer) {
        //default jpeg quality is 75

        fs.writeFileSync(name, buffer);
      }
    );
  }
};

app
  .route("/getlinkpreview")
  .get((req, res) => {
    const url = req.query.url;
    getLinkPreview(url).then((data) => {
      if (data.contentType === "text/html") {
        const link = data.url;
        const name = data.siteName;
        const imgUrl = data.images[0];
        res.json({ link: link, name: name, imgUrl: imgUrl });
      } else {
        res.json({ error: "the link must refer to a website" });
      }
    });
  })
  .post((req, res) => {
    const url = req.body.url;
    getLinkPreview(url).then((data) => {
      if (data.contentType === "text/html") {
        const link = data.url;
        const name = data.siteName;
        const imgUrl = data.images[0];
        res.json({ link: link, name: name, imgUrl: imgUrl });
      } else {
        res.json({ error: "the link must refer to a website" });
      }
    });
  });

app.route("/getFacebookLink").get((req, res) => {
  const url = req.query.url;
  facebookGetLink(url).then((response) => {
    res.json(response);
  });
});

app.route("/getCountriesData").get((req, res) => {
  let countriesData;
  let alpha3CodeTable;
//   const countryAlpha3Code = req.query.alpha3Code;
  axios.default
    .get(
      `https://restcountries.eu/rest/v2/all?fields=name;alpha3Code;flag;callingCodes`
    )
    .then((response) => {
      countriesData = response.data;
      alpha3CodeTable = response.data.map((item) => {
        return item.alpha3Code;
      });
      // convertAllSvgFlagToImg(countriesData,alpha3CodeTable);
      // res.json(countriesData[0]);
    })
    .catch((err) => console.log(err));


  res.set("Content-type", "image/jpeg");
  res.json(alpha3CodeTable);
});
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
