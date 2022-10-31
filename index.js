const express = require('express')
const app = express()
const db = require('cyclic-dynamodb')
const fetch = require('node-fetch');
const array = require('lodash/array');
const object = require('lodash/fp/object');

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

  const res2 = await fetch(nseUrl+'market-data-pre-open?key=FO');
  if (res2.ok) {
    const data = await res2.json();
    console.log(data);
    console.log("response from nse fetch");
    return data;
  }else{
    console.log(" error to get nse data");
  }
  //var preopen = await nseFetch('market-data-pre-open?key=FO');
  //var lastDay = await nseFetch('equity-stockIndices?index=SECURITIES IN F&O');

 // console.log(preopen);
  //console.log(lastDay);
  res.end();
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

async function findRG() {

  var preopen = await nseFetch('market-data-pre-open?key=FO');
  var lastDay = await nseFetch('equity-stockIndices?index=SECURITIES IN F&O');

  console.log(preopen);
  console.log(lastDay);
  return "done";
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
