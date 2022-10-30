const express = require('express')
const app = express()
const db = require('cyclic-dynamodb')
const fetch = require('node-fetch');
const https = require('https');

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

const botURL = 'https://api.telegram.org/bot5296606623:AAE_o1f38coNlUG8k2TnENZfCSZ67WlraOI';
const chatId = '1081447817';

app.post('/hammer-green', async (req, res) => {

  const scanData = req.body;

  var update = await getUpdate();

  var stockArray = scanData.stocks.split(",");
  if(stockArray && stockArray.length > 0 ){
    var scanName = scanData.scan_name;
    var testMessage  = "<b>"+scanName+"</b>\n";
  
    let inDB = await db.collection('coffee-nightingale-gownCyclicDB').get("hammer");
    console.log(inDB);
    for (const item of stockArray) {
      if(inDB.indexOf(item) != -1) {
        testMessage += item+"\n";
        inDB.push(item);
      }
    }
    await db.collection('coffee-nightingale-gownCyclicDB').set("hammer",inDB);
    const tgbody = {
      'text':testMessage,
      'chat_id':chatId,
      'parse_mode': 'HTML'
    }
    console.log(testMessage);
    const response = await fetch(botURL+'/sendMessage', {
      method: 'post',
      body: JSON.stringify(tgbody),
      headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
      const data = await response.json();
      console.log("response from telegram send");
      console.log(data);
    } else {
      console.log(" error send data"+response.error);
    }
  }
  res.end();
})

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

// Create or Update an item
app.post('/:col/:key', async (req, res) => {
  console.log(req.body)

  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).set(key, req.body)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})


// Get a single item
app.get('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).get(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a full listing
app.get('/createDb', async (req, res) => {
  const items = await db.collection("coffee-nightingale-gownCyclicDB")
  console.log(JSON.stringify(items, null, 2))
  res.json(items).end()
})

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
