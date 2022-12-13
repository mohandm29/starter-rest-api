const express = require('express')
const app = express()
const db = require('cyclic-dynamodb')
const fetch = require('node-fetch');
const array = require('lodash/array');
const object = require('lodash/fp/object');
const marketdata = require('./market-data.json')
const preOpenJson = require('./pre-open.json')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

const nseUrl = 'https://www.nseindia.com/api/';
const botURL = 'https://api.telegram.org/bot5296606623:AAE_o1f38coNlUG8k2TnENZfCSZ67WlraOI';
//Mohan
const mohan_chatId = '1081447817'; 
//Vinay
const vinay_chatId = '841550544';
//group  = -763158766
const chatId = process.env.chatId;
const dbData = {'shooting' : [], 'hammer': []};  
const rgdata = {'buy_above_high' :[], 'sell_below_low' :[], 'buy_within_high' :[], 'sell_within_low' :[]}; 
app.post('/hammer', async (req, res) => {

  const scanData = req.body;

 //var update = await getUpdate();

  var stockArray = scanData.stocks.split(",");
  if(stockArray && stockArray.length > 0 ){
    var scanName = scanData.scan_name;
    var msgHeader  = "<b>"+scanName+"</b>\n -------------- \n";
    var testMessage = "";
    var inDB  = dbData.hammer;
    for (const item of stockArray) {
      if(inDB.indexOf(item) === -1) {
        testMessage += item+"\n";
        inDB.push(item);
      }
    }
  
    if(testMessage.length > 0) {
      console.log(testMessage);
     await sendMessage(mohan_chatId, msgHeader+testMessage);
     await sendMessage(vinay_chatId, msgHeader+testMessage);
     dbData.hammer = inDB;
    } 
  }
  res.end();
})

app.post('/shootingstar', async (req, res) => {

  const scanData = req.body;

 //var update = await getUpdate();

  var stockArray = scanData.stocks.split(",");
  if(stockArray && stockArray.length > 0 ){
    var scanName = scanData.scan_name;
    var msgHeader  = "<b>"+scanName+"</b>\n -------------- \n";
    var testMessage = "";
    var inDB  = dbData.shooting;
    for (const item of stockArray) {
      if(inDB.indexOf(item) === -1) {
        testMessage += item+"\n";
        inDB.push(item);
      }
    }
  
    if(testMessage.length > 0) {
      console.log(testMessage);
     await sendMessage(mohan_chatId, msgHeader+testMessage);
     await sendMessage(vinay_chatId, msgHeader+testMessage);
     dbData.shooting = inDB;
    } 
  }
  res.end();
})

app.get('/memorydata', async (req, res) => {
  
  res.json(dbData).end();
})

app.get('/cleardata', async (req, res) => {
  dbData.shooting = [];
  dbData.hammer = [];
  res.end();
})

app.get('/processrg', async (req, res) => {


  const myHeaders =  {
    'authority': 'www.nseindia.com',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'cookie': 'RT="z=1&dm=nseindia.com&si=d8b5b0d2-c9f0-4da8-b4e6-89390de0c451&ss=l9y74brc&sl=4&tt=8z8&bcn=%2F%2F684d0d44.akstat.io%2F&ul=12mox"',
    //'cookie': '',
    'pragma': 'no-cache',
    'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
  }
  var requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  let preopen = {};
  //TODO 
  const response =  await fetch("https://www.nseindia.com", requestOptions);
requestOptions.cookie = response.headers.cookie;

 //const response1 =  await fetch("https://www.nseindia.com/api/market-data-pre-open?key=FO", requestOptions);
 console.log(response);
 if (true) {
 // const data = await response.json();
 const data = preOpenJson;
 data.data.forEach(element => {
    preopen[element.metadata.symbol] = element.metadata;
  });

  marketdata.data.forEach(md => {
    try {
      
    const lasthigh = Number(md.dayHigh);
    const lastlow = Number(md.dayLow);
    const lastopen = Number(md.open);
    const prevClose = Number(preopen[md.symbol].previousClose);
    const open = Number(preopen[md.symbol].iep);
    // case 1 previous Red candle 
    if(lastopen > prevClose) { 
        if(open >= lasthigh) {
          rgdata.buy_above_high = array.concat(rgdata.buy_above_high,md.symbol);
         console.log('above high '+md.symbol);
        } else if((lastopen < open)  && (open< lasthigh)) {
          rgdata.buy_within_high = array.concat(rgdata.buy_within_high,md.symbol);
         console.log('within high '+md.symbol);
        }
    } else if (lastopen < prevClose) {
      if(open <= lastlow) {
        rgdata.sell_below_low = array.concat(rgdata.sell_below_low,md.symbol);  
        console.log('below low '+md.symbol);
      } else if((lastlow < open) &&  (open < lastopen)) {
        rgdata.sell_within_low=  array.concat(rgdata.sell_within_low,md.symbol);  
       console.log('within low '+md.symbol);
      }
    }
    } catch (error) {
      console.log(error);
    }
  });
} else {
  console.log(" error send data"+response.error);
}

var buyaboveh  = " * <b>BUY - RG Open Above High \n --------------- \n</b>"+rgdata.buy_above_high.join(",");
var sellbelowL  = "\n\n * <b>SELL - RG Open Below Low \n ---------------\n</b>"+rgdata.sell_below_low.join(",");
var buywithinh  = "\n\n * <b>BUY - RG Open within High \n ---------------\n</b>"+rgdata.buy_within_high.join(",");
var sellwithinL  = "\n\n * <b>SELL - RG Within Low \n --------------\n</b>"+rgdata.sell_within_low.join(",");

  //await sendMessage(mohan_chatId, buyaboveh+sellbelowL+buywithinh+sellwithinL);
  //await sendMessage(vinay_chatId, buyaboveh+sellbelowL+buywithinh+sellwithinL);
  res.json(rgdata).end();
})

async function sendMessage(chat_id,text) {
  let tgbody = {
    'text':text,
    'chat_id':chat_id,
    'parse_mode': 'HTML'
  }
  
  const response = await fetch(botURL+'/sendMessage', {
    method: 'post',
    body: JSON.stringify(tgbody),
    headers: {'Content-Type': 'application/json'}
  });
  if (response.ok) {
    const data = await response.json();
    console.log("response from telegram send");
    console.log(data);
    return data;
  } else {
    console.log(" error send data"+response.error);
  }

}
async function getUpdate() {
  const res2 = await fetch(botURL+'/getUpdates');
    if (res2.ok) {
      const data = await res2.json();
      console.log("response from telegram fetch");
      console.log(data);
      return data;
    }else{
      console.log(" error t data");
    }
}

async function nseFetch(suffix) {
  const res2 = await fetch(nseUrl+suffix);
  if (res2.ok) {
    const data = await res2.json();
    console.log("response from nse fetch");
    return data;
  }else{
    console.log(" error to get nse data");
  }
}

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})