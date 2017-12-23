const request = require('request');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync'); 
const adapter = new FileSync('db.json');
const db = low(adapter);
const mailer = require('nodemailer');
var currentCoins = { coins: [] };

db.defaults({ coins: [] })
  .write();

function checkForNewCoin() {
  request('https://api.coinmarketcap.com/v1/ticker/?limit=2', function (error, response, body) {
    //console.log('error:', error);
    //console.log('statusCode:', response && response.statusCode);
    //console.log('body:', body);
    currentCoins.coins = JSON.parse(body);
    var newCoins = [];
    for (var i = 0, len = currentCoins.coins.length; i < len; i++) {            
      if (typeof db.get('coins').find({ id: currentCoins.coins[i].id}).value() === "undefined") {      
        newCoins.push(currentCoins.coins[i].id);
        console.log("new coin found!!!");
        console.log(currentCoins.coins[i].id);
      }
    };    
    if (newCoins.length > 0) {  
      const smtpTransport = mailer.createTransport({
        service: "Gmail",
        auth: {
            user: "emergence.crypto@gmail.com",
            pass: "idianrutakwakibt"
        }
      });
      
      const mail = {
        from: "Emergence Investment <emergence.crypto@gmail.com>",
        to: "shenbomo@gmail.com",
        subject: "There are new coins!",
        text: newCoins.toString(),
        html: ''
      }

      smtpTransport.sendMail(mail, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + info.messageId);
        }  
        smtpTransport.close();
      });
    }
    db.set('coins', currentCoins.coins)
    .write();
  });
}

console.log('Started polling for new coin from coinmarketcap.com...');
setInterval(checkForNewCoin, 10000);