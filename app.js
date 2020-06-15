let bodyParser = require("body-parser"),
    axios = require('axios'),
    cheerio = require('cheerio'),
    express = require("express"),
    mongoose = require("mongoose"),
    app = express(),
    PORT = process.env.PORT || 4000;

//models
let Product = require('./models/product')


const fileUpload = require('express-fileupload');
let cheerioAdv = require('cheerio-advanced-selectors')
cheerio = cheerioAdv.wrap(cheerio)

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
var fs = require('fs');
const puppeteer = require('puppeteer');

mongoose.connect(`mongodb+srv://muba:dangerkhan@cluster0-fhqof.mongodb.net/mySaleDB?retryWrites=true&w=majority`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false
  })
  .then(() => {
    console.log("Connected to the Database");
  })
  .catch(() => {
    console.log("Could not connected to the Database");
  });
app.get('/',async(req,res)=>{
    // const response = await axios.get('https://www.daraz.pk/wow/i/pk/landingpage/flash-sale?spm=a2a0e.home.flashSale.1.7ba54937bPGAbK&wh_weex=true&amp;wx_navbar_transparent=true&amp;scm=1003.4.icms-zebra-5029921-2824236.OTHER_5360388823_2475751&skuIds=129551832,136344323,131691660,132232436,125176553,117820223,109654251');
    
    // if (response.status === 200) {
    //     const html = response.data;
    //     const $Ht = cheerio.load(html, {
    //         xmlMode: true
    //     });
    //     // let newhtml=$Ht('.J_FSBody .J_FSItemList').html()
    //     // console.log($Ht.html())
    //     fs.appendFile('mynewfile1.txt', $Ht.html(), function (err) {
    //         if (err) throw err;
    //         console.log('Saved!');
    //       });
    //     // let $ =cheerio.load(newhtml);

    //     // $('img.image').each((i, elem) => {
    //     //   console.log( $(elem).attr('src'));
    //     // });
    // }





  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1000 });
  await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://www.daraz.pk/wow/i/pk/landingpage/flash-sale', {waitUntil: 'networkidle2'});
  await page.evaluate(scrollToBottom);
  await page.waitFor(3000);

  let bodyHTML = await page.evaluate(() => document.body.innerHTML);

    const $Ht = cheerio.load(bodyHTML, {
            xmlMode: true
        });
        let newhtml=$Ht('.J_FSBody .J_FSItemList').first().html()

        let $ =cheerio.load(newhtml);
        let items=[];
        $('.item-list-content a').each((i, elem) => {
          if($(elem).find('img.image') != undefined){
            let obj = {};
          obj.link=($(elem).attr('href'));
          obj.image=($(elem).find('img.image').attr('src'));
          obj.title=($(elem).find('.sale-title').text().trim())
          obj.salePrice=($(elem).find('.sale-price').text().trim())
          obj.orignalPrice=($(elem).find('.origin-price-value').text().trim())
          if(obj.title){
            items.push(obj);

          }
        }
        });
  await browser.close();
for (const item of items) {
  let createProduct = await Product.create({title:item.title,link:item.link,image:item.image,salePrice:item.salePrice,orignalPrice:item.orignalPrice})
}
  res.send(items);


});

app.get("/getMore",async(req,res)=>{
  

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1000 });
  await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://www.worldometers.info/coronavirus/', {waitUntil: 'networkidle2'});
  await page.evaluate(scrollToBottom);
  await page.waitFor(3000);

  let bodyHTML = await page.evaluate(() => document.body.innerHTML);

    const $ = cheerio.load(bodyHTML, {
            xmlMode: true
        });
        $('#maincounter-wrap').each((i, elem) => {
      console.log($(elem).find('h1').text())
      console.log($(elem).find('.maincounter-number').text())

        })
       
  await browser.close();

  res.send('items');

})
async function scrollToBottom() {
  await new Promise(resolve => {
    const distance = 100; // should be less than or equal to window.innerHeight
    const delay = 100;
    const timer = setInterval(() => {
      document.scrollingElement.scrollBy(0, distance);
      if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}
app.listen(PORT, () => {
    console.log("Server is Listening on port :", PORT);
});
