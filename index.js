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

app.get('/hello', async (req, res) => {
  const a = {'a':'b'}

const res2 = await fetch('https://api.telegram.org/bot5296606623:AAE_o1f38coNlUG8k2TnENZfCSZ67WlraOI/getUpdates');
if (res2.ok) {
  const data = await res2.json();
  console.log("response from telegram fetch");
  console.log(data);
}else{
  console.log(" error t data");
}

const tgbody = {
	'text':'<b>bold</b>',
	'chat_id':'1081447817',
	'parse_mode': 'HTML'
}
const response = await fetch('https://api.telegram.org/bot5296606623:AAE_o1f38coNlUG8k2TnENZfCSZ67WlraOI/sendMessage', {
	method: 'post',
	body: JSON.stringify(tgbody),
	headers: {'Content-Type': 'application/json'}
});
if (response.ok) {
  const data = await response.json();
  console.log("response from telegram send");
  console.log(data);
} else {
  console.log(" error send data");
}
  res.json(a).end()
})

app.post('/hammer-green', async (req, res) => {
  console.log(req.body);


  const gres = await fetch('https://api.telegram.org/bot5296606623:AAE_o1f38coNlUG8k2TnENZfCSZ67WlraOI/getUpdates');
if (gres.ok) {
  const data = await gres.json();
  console.log(data);
}

  let request =  https.get('https://api.telegram.org/bot5296606623:AAE_o1f38coNlUG8k2TnENZfCSZ67WlraOI/getUpdates', (res) => {
    if (res.statusCode !== 200) {
      console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
      res.resume();
      return;
    }
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });
  
    res.on('close', () => {
      console.log('Retrieved all data');
      console.log(JSON.parse(data));
    });

   });
   request.on('error', (err) => {
    console.error(`Encountered an error trying to make a request: ${err.message}`);
  });
  

  const tgbody = {
	'text':'<b>bold</b>',
	'chat_id':'1081447817',
	'parse_mode': 'HTML'
};
  const requestOptions = {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(tgbody)
};
fetch('https://api.telegram.org/bot5296606623:AAE_o1f38coNlUG8k2TnENZfCSZ67WlraOI/sendMessage', requestOptions)
    .then(response => response.json())
    .then(data => console.log("done fetch"+data))
    .catch (err => console.log(err));
  
  res.json(req.body).end()
});

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
app.get('/:col', async (req, res) => {
  const col = req.params.col
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const items = await db.collection(col).list()
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
