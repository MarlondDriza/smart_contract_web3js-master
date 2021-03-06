let abi = [{"constant": true,"inputs": [],"name": "getBalance","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getBettingStatus","outputs": [{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getDeveloperAddress","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "value","type": "uint256"}],"name": "findWinners","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "getMaxContenders","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "getBettingStastics","outputs": [{"name": "","type": "uint256[20]"}],"payable": true,"stateMutability": "payable","type": "function"},{"constant": true,"inputs": [],"name": "getBettingPrice","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getDeveloperFee","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getLotteryMoney","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_contenders","type": "uint256"},{"name": "_bettingprice","type": "uint256"}],"name": "setBettingCondition","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "state","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "guess","type": "uint256"}],"name": "addguess","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": false,"inputs": [],"name": "finish","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "value","type": "uint256"}],"name": "setStatusPrice","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": false,"name": "winner","type": "address"},{"indexed": false,"name": "money","type": "uint256"},{"indexed": false,"name": "guess","type": "uint256"},{"indexed": false,"name": "gameindex","type": "uint256"},{"indexed": false,"name": "lotterynumber","type": "uint256"},{"indexed": false,"name": "timestamp","type": "uint256"}],"name": "SentPrizeToWinner","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "balance","type": "uint256"}],"name": "SentDeveloperFee","type": "event"}]
let guess1000Contract = web3.eth.contract(abi);
let contractInstance = guess1000Contract.at('0x5a96d6a948aaa5019a1224c46a0d458f3276602a');
console.log('contractInstance',contractInstance);

/**
 * ?????????????????? ?????????0???????????????????????? SentPrizeToWinne SentDeveloperFee
 */
// let eventSentPrizeToWinner=contractInstance.SentPrizeToWinner(null,{fromBlock:0,toBlock:'latest'}); //????????????,??????getTransactionReceipt??????
let eventSentDeveloperFee=contractInstance.SentDeveloperFee(null,{fromBlock:0,toBlock:'latest'});


/**
 * ??????????????????????????????
 */
let contractFunctions=['state','getBalance','getMaxContenders','getLotteryMoney','getDeveloperFee','getBettingPrice']
setInterval(()=>{
   for(let contractFunction of contractFunctions) {
    contractInstance[contractFunction].call((e,result)=>{
        document.getElementById(contractFunction).innerText=result.c[0]+""
    })
    contractInstance['getDeveloperAddress'].call((e,result)=>{
        document.getElementById('getDeveloperAddress').innerText=result
    })
    contractInstance['getBettingStatus'].call((e,result)=>{
        document.getElementById('getBettingStatus').innerText=JSON.stringify(result,null,3)
    })
   }
}, 1000);



/**
 * @description ??????????????????
 * @param {string} contractFunction ????????????
 * @param {args} args ?????? 
 */
function call(contractFunction,...args){
    return Rx.Observable.create((observer) => { // Observable ???????????????, observer?????????
	    contractInstance[contractFunction].call(...args,(e,result)=>{ // .call ???????????? ,ES6 ...args ????????????,??? console.log(...[1,2,3]) ?????? console.log(1,2,3)
            console.log('call',e,result);
            if(e) observer.error(e);    // ????????? e (error) ????????? observer.error ??????
            else observer.next(result); // ????????? result ??? observer.next ????????? Observable ??????
            observer.complete();
        })
	})
}

/**
 * @description ????????????
 * @param {string} contractFunction ????????????
 * @param {args} args ?????? 
 */
function send(contractFunction,...args){
    return Rx.Observable.create((observer) => {
	    contractInstance[contractFunction](...args,(e,txid)=>{  // ????????????
            console.log('send',e,txid);
            if(e) observer.error(e);
            else observer.next(txid);
            observer.complete();
        })
	})
}

/**
 * @description ????????????logs
 * @param {string} txid 
 */
function getReceipt(txid){
    console.log(txid)
    return Rx.Observable.create((observer) => {
	    web3.eth.getTransactionReceipt(txid,(e,result)=>{
            // console.log('receipt',e,result);
            if(e) observer.error(e);
            else observer.next(result);
            observer.complete();
        })
	})
}

function decodeSentPrizeToWinner(data) {
    let winner = "0x" + data.substr(2+24,40)
    let money = parseInt(data.substr(2+64,64), 16) + ""
    let guess = parseInt(data.substr(2+64*2,64), 16) + ""
    let gameindex = parseInt(data.substr(2+64*3,64), 16) + ""
    let lotterynumber = parseInt(data.substr(2+64*4,64), 16) + ""
    let timestamp = parseInt(data.substr(2+64*5,64), 16) + ""
    let SentPrizeToWinner = {winner:winner,money:money,guess:guess,gameindex:gameindex,lotterynumber:lotterynumber,timestamp:timestamp }
    return SentPrizeToWinner
}

function decodeSentDeveloperFee(data) {
    let amount = parseInt(data.substr(2,64), 16) + ""
    let balance = parseInt(data.substr(2+64,64), 16) + ""
    let SentDeveloperFee = {amount:amount,balance:balance};
    return SentDeveloperFee;
}

Rx.Observable.fromEvent($('#getBettingStasticsBtn'),'click')        // fromEvent ??????????????????
.mergeMap(()=>{                                                     // mergeMap ?????????????????? ???????????? ??????Observable ?????????mergeMap, ?????????????????? ?????? map ??????
    let ether=parseFloat(document.getElementById('ether').value);   // ??? ether ???
    return call('getBettingStastics',{value:web3.toWei(ether)})     // ????????????
}).mergeMap((result)=>{
    $('#getBettingStasticsResult').html(JSON.stringify(result))     // ???????????????????????? getBettingStasticsResult
    let ether=parseFloat(document.getElementById('ether').value);   // ??? ether ???
    return send('getBettingStastics',{value:web3.toWei(ether)})     // ???????????? getBettingStastics ?????? (?????? MetaMask ??????)
}).retry()                                                          // ???????????????????????? ????????????Observable ??????Rx.Observable.fromEvent ??????
.subscribe({                                                        // ????????? Observable(?????????????????????????????????)
    next:({result})=>{                                              // ??????????????????????????????result?????????
        $('#getBettingStasticsTxid').html(result)                   // ??????Txid
    },error:(error)=>{                                              // ????????????error ?????????
        // noting
    },complete:()=>{                                                // Observable ??????
        // noting
    }
});

Rx.Observable.fromEvent($('#addguessBtn'),'click')
.mergeMap((result)=>{                                                   // ????????????????????????,?????????call??????
    let ether=parseFloat(document.getElementById('ether').value);       // ??? ether ???
    let guess=parseInt(document.getElementById('addguessValue').value); // ??? guess ???
    return send('addguess',guess,{value:web3.toWei(ether)})             // ???????????? (?????? MetaMask ??????)
}).retry()
.subscribe({
    next:(txid)=>{
        $('#addguessTxid').html(txid)                                   // ??????Txid
    }
});

Rx.Observable.fromEvent($('#findWinnersBtn'),'click')
.mergeMap(()=>{
    let value=parseInt(document.getElementById('findWinnersValue').value);  // ??? findWinners ???
    return call('findWinners',value)                                        // ????????????
})
.subscribe((result)=>{
    $('#findWinnersResult').html(JSON.stringify(result))                    // ???????????????????????? findWinnersResult
})

//===
// ???????????????,????????? gas ,???????????????, ??? ????????????call ??????????????????
//===
// .mergeMap((result)=>{
//     $('#findWinnersResult').html(JSON.stringify(result))                    // ???????????????????????? findWinnersResult
//     let value=parseInt(document.getElementById('findWinnersValue').value);  // ??? findWinners ???
//     return send('findWinners',value)                                        // ???????????? findWinners?????? (?????? MetaMask ??????)
// }).retry().subscribe({
//     next:(txid)=>{
//         $('#findWinnersTxid').html(txid)
//     }
// });

Rx.Observable.fromEvent($('#finishBtn'),'click')
.mergeMap(()=>{
    return send('finish')                                                       // ?????? finish ??????
}).retry().mergeMap((txid)=>{
    console.log(txid)
    $('#finishTxid').html('')
    return Rx.Observable.interval(1000).mergeMap((d)=>{
        $('#finishTxid').append('.')                                            // result:...(??????
        return getReceipt(txid)
    }).filter(data=>data!=null)                                                 // ?????????????????? null ??????
    .first()                                                                    // ??????????????? ?????? interval ???????????? ????????????
}).map(data=>{
    JSON.parse(JSON.stringify(data))
    let result1=''
    let result2=''
    for(let log of data.logs){
        if(log.topics[0]==="0x16772b6ac3e9823e1f39326dbe356dac767fad821f4a2af003066838235e1bbd"){
            let SentPrizeToWinner=decodeSentPrizeToWinner(log.data)
            result1 += `,??????????????????${SentPrizeToWinner.guess},?????????${SentPrizeToWinner.lotterynumber},?????????${SentPrizeToWinner.money},????????????${SentPrizeToWinner.timestamp},?????????${SentPrizeToWinner.winner}\n`;
        }else if(log.topics[0]==="0xf758ff59202247fe26bd4bd951f620cf543dc36b500de667d055cb5816def873"){
            let SentDeveloperFee = decodeSentDeveloperFee(log.data)
            result2 = `???????????????${SentDeveloperFee.amount},?????????${SentDeveloperFee.balance}`
        }
    }
    return result1 ? result2 + result1  : "????????????"
}).subscribe({
    next:(data)=>{
        $('#finishResult').html(data)                                             // ??????finishResult
    }
});

Rx.Observable.fromEvent($('#setBettingConditionBtn'),'click')
.mergeMap(()=>{
    let _contenders=parseInt(document.getElementById('_contenders').value);     // ?????? _contenders
    let _bettingprice=parseInt(document.getElementById('_bettingprice').value); // ?????? _bettingprice
    return send('setBettingCondition',_contenders,_bettingprice)                // ?????? setBettingCondition ?????? (?????? MetaMask ??????)
}).retry().subscribe({
    next:(result)=>{
        $('#setBettingConditionTxid').html(txid)
    }
});

Rx.Observable.fromEvent($('#setStatusPriceBtn'),'click')
.mergeMap(()=>{
    let value=parseInt(document.getElementById('setStatusPriceValue').value);   // ?????? value
    return send('setStatusPrice',value)                                         // ?????? setStatusPrice ?????? (?????? MetaMask ??????)
}).retry().subscribe({
    next:(txid)=>{
        $('#setStatusPriceTxid').html(txid)                                     // ??????Txid
    }
})


let eventHistory = []                               // ??????????????????history ????????????,???????????????????????? 
Rx.Observable.fromEvent($('#history'),'click')
.first()                                            // ???????????????????????????
.mergeMap(()=>{
    return Rx.Observable.create((observer) => {
        /**
         * ??????????????????
         */
        eventSentDeveloperFee.watch((e,r)=>{
            if(e){observer.error('error',e);return}
            result = JSON.parse(JSON.stringify(r)); 
            observer.next(result);
        })
    })
})
.distinct(data=>data.transactionHash)               // ???transactionHash?????????,??????????????????
.mergeMap((data,a)=>{
    return getReceipt(data.transactionHash)
}).map((data)=>{
    eventHistory.push(data);                        // ??????????????????history ????????????,???????????????????????? 
    eventHistory = eventHistory.sort((x,y)=>{return x.blockNumber-y.blockNumber});
    return eventHistory;
})
.subscribe({
    next:(data)=>{
        // ?????????????????????
        console.log("=============")
        let tableContext = "";
        let index=0;
        for(let item of data){
            let SentPrizeToWinnerRow='<td colspan="6"></td></tr>'
            let SentDeveloperFeeRow="";
            
            for(let log of item.logs){
                if(log.topics[0]==="0x16772b6ac3e9823e1f39326dbe356dac767fad821f4a2af003066838235e1bbd"){
                    let SentPrizeToWinner=decodeSentPrizeToWinner(log.data)
                    if(SentPrizeToWinnerRow === '<td colspan="6"></td></tr>'){ 
                        SentPrizeToWinnerRow = `<td>${SentPrizeToWinner.guess}</td><td>${SentPrizeToWinner.lotterynumber}</td><td>${SentPrizeToWinner.money}</td><td>${SentPrizeToWinner.timestamp}</td><td>${SentPrizeToWinner.winner}</td></r>`;
                    }else{
                        SentPrizeToWinnerRow += `<tr><td>${SentPrizeToWinner.guess}</td><td>${SentPrizeToWinner.lotterynumber}</td><td>${SentPrizeToWinner.money}</td><td>${SentPrizeToWinner.timestamp}</td><td>${SentPrizeToWinner.winner}</td></tr>`
                    }
                }else if(log.topics[0]==="0xf758ff59202247fe26bd4bd951f620cf543dc36b500de667d055cb5816def873"){
                    let SentDeveloperFee = decodeSentDeveloperFee(log.data)
                    SentDeveloperFeeRow= `<tr><td rowspan="${item.logs.length -1 }">${++index}</td><td rowspan="${item.logs.length -1 }">${SentDeveloperFee.amount}</td><td rowspan="${item.logs.length -1 }">${SentDeveloperFee.balance}</td>`
                }
            }
            tableContext += SentDeveloperFeeRow + SentPrizeToWinnerRow;
        }
        $('#event').html(tableContext)
    }
})