const request = require('request');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync'); 
const adapterCMC = new FileSync('./db/coin-market-cap-db.json');
const adapterKucoin = new FileSync('./db/kucoin-db.json');
const dbCMC = low(adapterCMC);
const dbKucoin = low(adapterKucoin);
const mailer = require('nodemailer');
var currentCoinsCMC = { coins: [] };
var currentCoinsKucoin = { coins: [] };

dbCMC.defaults({ coins: [] })
  .write();
dbKucoin.defaults({ coins: [] })
  .write();

function checkForNewCoinCMC() {
  console.log("Polling from CoinMarketCap...");
  request('https://api.coinmarketcap.com/v1/ticker/?limit=99999', function (error, response, body) {
    //console.log('error:', error);
    //console.log('statusCode:', response && response.statusCode);
    //console.log('body:', body);
    currentCoinsCMC.coins = JSON.parse(body);
    var newCoins = [];
    for (var i = 0, len = currentCoinsCMC.coins.length; i < len; i++) {            
      if (typeof dbCMC.get('coins').find({ id: currentCoinsCMC.coins[i].id}).value() === "undefined") {      
        newCoins.push(currentCoinsCMC.coins[i].id);
        console.log("new coin found!!!");
        console.log(currentCoinsCMC.coins[i].id);
      }
    };    
    if (newCoins.length > 0 && newCoins.length <= 1000) {  
      const smtpTransport = mailer.createTransport({
        service: "Gmail",
        auth: {
            user: "emergence.crypto@gmail.com",
            pass: "idianrutakwakibt"
        }
      });
      
      const mail = {
        from: "Emergence Investment <emergence.crypto@gmail.com>",
        to: "shenbomo@gmail.com, njabels@gmail.com, kcwiener.1990@gmail.com, jakethecryptoking@gmail.com",
        subject: "There are new coins listed on CoinMarketCap!",
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
    dbCMC.set('coins', currentCoinsCMC.coins)
    .write();
  });
}

function checkForNewCoinKucoin() {
  console.log("Polling from Kucoin...");
  request('https://api.kucoin.com/v1/open/tick', function (error, response, body) {
    //console.log('error:', error);
    //console.log('statusCode:', response && response.statusCode);
    //console.log('body:', body);
    currentCoinsKucoin.coins = JSON.parse(body).data;
    var newCoins = [];
    for (var i = 0, len = currentCoinsKucoin.coins.length; i < len; i++) {            
      if (typeof dbKucoin.get('coins').find({ coinType: currentCoinsKucoin.coins[i].coinType}).value() === "undefined") {      
        newCoins.push(currentCoinsKucoin.coins[i].coinType);
        console.log("new coin found!!!");
        console.log(currentCoinsKucoin.coins[i].coinType);
      }
    };    
    if (newCoins.length > 0 && newCoins.length <= 200) {  
      const smtpTransport = mailer.createTransport({
        service: "Gmail",
        auth: {
            user: "emergence.crypto@gmail.com",
            pass: "idianrutakwakibt"
        }
      });
      
      const mail = {
        from: "Emergence Investment <emergence.crypto@gmail.com>",
        to: "shenbomo@gmail.com, njabels@gmail.com, kcwiener.1990@gmail.com, jakethecryptoking@gmail.com",
        subject: "There are new coins listed on Kucoin!",
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
    dbKucoin.set('coins', currentCoinsKucoin.coins)
    .write();
  });
}

console.log('Started polling for new coin from coinmarketcap.com and kucoin.com...');
setInterval(checkForNewCoinCMC, 10000000);
setInterval(checkForNewCoinKucoin, 10000000);