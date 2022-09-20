import TelegramBot from 'node-telegram-bot-api';
import axios from "axios";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import https from 'https';
import { idlFactory } from "./candid/icpswap.did.js"; //Import DID of Token XCANIC
global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// replace the value below with the Telegram token you receive from @BotFather
const access_token = '5738768169:AAFnRfH3FSsk0K2tHfHSy2_fqqCSjOJozPM';
const Tokens = {
	"xcanic": {
		"name": "Canister Token",
		"symbol": "XCANIC",
		"canister_id": "qi26q-6aaaa-aaaap-qapeq-cai",
		"pool_id": "iskvz-zqaaa-aaaan-qatfq-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=qi26q-6aaaa-aaaap-qapeq-cai",
		"sonic": "https://app.sonic.ooo/swap?from=qi26q-6aaaa-aaaap-qapeq-cai&to=utozz-siaaa-aaaam-qaaxq-cai",
		"total_supply": 100_000_000
	},
	"ghost": {
		"name": "GHOST",
		"symbol": "GHOST",
		"canister_id": "fjbi2-fyaaa-aaaan-qanjq-cai",
		"pool_id": "i3j6f-pyaaa-aaaan-qatea-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=fjbi2-fyaaa-aaaan-qanjq-cai",
		"sonic": "",
		"total_supply": 10_000_000_000
	},
	"ndp": {
		"name": "NnsDAO Protocol",
		"symbol": "NDP",
		"canister_id": "ioopi-oqaaa-aaaan-qathq-cai",
		"pool_id": "ioopi-oqaaa-aaaan-qathq-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=ioopi-oqaaa-aaaan-qathq-cai",
		"sonic": "https://app.sonic.ooo/swap?from=ioopi-oqaaa-aaaan-qathq-cai&to=utozz-siaaa-aaaam-qaaxq-cai",
		"total_supply": 100_000_000
	},
	"land": {
		"name": "BunnyIsland Land Token",
		"symbol": "LAND",
		"canister_id": "5xnja-6aaaa-aaaan-qad4a-cai",
		"pool_id": "kushu-qaaaa-aaaan-qatiq-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=5xnja-6aaaa-aaaan-qad4a-cai",
		"sonic": "",
		"total_supply": 100_000_000
	},
	"whale": {
		"name": "Dream Whale Token",
		"symbol": "WHALE",
		"canister_id": "e2gn7-5aaaa-aaaal-abata-cai",
		"pool_id": "k5rmi-giaaa-aaaan-qatja-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=5xnja-6aaaa-aaaan-qad4a-cai",
		"sonic": "",
		"total_supply": 10_000_000_000
	},
	"icd": {
		"name": "IC Drip Token",
		"symbol": "ICD",
		"canister_id": "ilmem-diaaa-aaaak-actma-cai",
		"pool_id": "m4mib-siaaa-aaaan-qaucq-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=ilmem-diaaa-aaaak-actma-cai",
		"sonic": "",
		"total_supply": 10_000_000_000
	},
	"dogmi": {
		"name": "DOGMI Coin",
		"symbol": "DOGMI",
		"canister_id": "ltire-ryaaa-aaaan-qautq-cai",
		"pool_id": "jhwuq-uyaaa-aaaan-qau5q-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=ltire-ryaaa-aaaan-qautq-cai",
		"sonic": "",
		"total_supply": 1_000_000_000
	},
	"avocado": {
		"name": "Avocado Research token",
		"symbol": "AVOCADO",
		"canister_id": "j4tiv-oaaaa-aaaan-qau7a-cai",
		"pool_id": "f7hux-2iaaa-aaaan-qavsq-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=j4tiv-oaaaa-aaaan-qau7a-cai",
		"sonic": "",
		"total_supply": 100_000_000
	},
	"plat": {
		"name": "ICPlat Token",
		"symbol": "PLAT",
		"canister_id": "kzht6-tiaaa-aaaan-qauuq-cai",
		"pool_id": "jvqdj-yiaaa-aaaan-qau6q-cai",
		"icpswap": "https://app.icpswap.com/swap/?input=5xnja-6aaaa-aaaan-qad4a-cai&output=kzht6-tiaaa-aaaan-qauuq-cai",
		"sonic": "",
		"total_supply": 5_000_000
	}
};


async function checkPrice(_token, callback){
	let _tokenName = _token.toLowerCase().trim()
	try{
		let _tokenInfo = Tokens[_tokenName];
		console.log('_tokenInfo:',_tokenInfo);
		let _pool_canister = _tokenInfo['pool_id'];
		console.log('_pool_canister:',_pool_canister);
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		})
		axios.defaults.httpsAgent = httpsAgent;
		const agent = new HttpAgent({
			host: 'https://boundary.ic0.app',
		});
		const api = Actor.createActor(idlFactory, { agent, canisterId: _pool_canister });
		let poolInfo = await api.infoWithNoBalance();
		let priceRes = await axios.get("http://ic0-proxy.canister.app/api/get_icp_rate");
		let icpPrice = priceRes.data.price;
		let price = Number(poolInfo.sqrtRatioX96) ** 2 / 2 ** 192;

		let msg = "<strong>"+_tokenInfo['name']+" Price</strong>\n\n" +
			"1 "+_tokenInfo['symbol']+" = <strong>"+(1/price).toFixed(8)+"</strong> WICP (<strong>$"+((1/price).toFixed(8)*icpPrice).toFixed(8)+"</strong>) \n" +
			"1 WICP = <strong>"+numberWithCommas(price.toFixed(3))+"</strong> "+_tokenInfo['symbol']+"\n" +
			"Total Supply: <strong>"+numberWithCommas(_tokenInfo['total_supply'])+"</strong> "+_tokenInfo['symbol']+"\n" +
			"Market Cap: <strong>$"+numberWithCommas((_tokenInfo['total_supply']*1/price).toFixed(2))+"</strong>\n" +
			"ICP Price: <strong>"+icpPrice.toFixed(3)+"</strong> USDT\n\n" +
			"Swap on: "+(_tokenInfo['icpswap']?"<a href='"+_tokenInfo['icpswap']+"'>ICPSwap</a>":"") +
			(_tokenInfo['sonic']?" - <a href='"+_tokenInfo['sonic']+"'>Sonic</a>":"")+" | "+
			"Sponsored: canister.app";
		callback(msg);
	}catch (e) {
		callback("Token <strong>"+_tokenName+"</strong> not found!");
	}
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
async function runBot(){
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(access_token, {polling: true});

// Matches "/echo [whatever]"

bot.onText(/\/ip(.+)?/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const _token = match[1];
  if(!_token || _token == ""){
	  let response_msg = '<strong>Supported Tokens:</strong> \n';
	  for (const property in Tokens) {
		  response_msg += Tokens[property].symbol+'\n';
	  }
	  response_msg += "\nCheck price: `/ip token`\nSponsored: canister.app";
	  bot.sendMessage(chatId, response_msg, {parse_mode : "HTML", disable_web_page_preview: true});

  }else{
	  const resp = checkPrice(_token, (response_msg) => {
		  bot.sendMessage(chatId, response_msg, {parse_mode : "HTML", disable_web_page_preview: true});
	  }); // the captured "whatever"

  }

});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  //bot.sendMessage(chatId, "OK");
});
}

runBot();