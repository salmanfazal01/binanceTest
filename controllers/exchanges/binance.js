var request = require("request-promise");
const api = require('binance');
const api_node = require('binance-api-node').default;

var symbols_data = {}; // data including tick and step size.
symbolsData(); //initially load all binance data

// ------------------------ LOAD KEYS ------------------------------------
// Initialize Binance Secret and API keys
function loadKeys(keys) {
    const client = new api.BinanceRest({
        // key: "R5s8SH34CzINGQLDRRkAq6NnffsnCvOh011DjDVPsjORUEb4ZG23W8zvDi2xdRPR",
        key: keys[0],
        //secret: "Yc4rdtDn1DfOpsucZ2G860yKADW8cvcl4hUTC46naA77qPUxmTzTRBtnywWBrXsT",
        secret: keys[1],
        timeout: 15000, // request time out in milliseconds
        recvWindow: 10000, // Optional, defaults to 5000, increase if you're getting timestamp errors
        disableBeautification: false,
        handleDrift: true
    });

    return client;
}

// Initialize Binance Secret and API keys with binance-api-node library
function loadKeys2(keys) {
    //console.log(keys);
    const client = new api_node({
        //apiKey: "R5s8SH34CzINGQLDRRkAq6NnffsnCvOh011DjDVPsjORUEb4ZG23W8zvDi2xdRPR",
        apiKey: keys[0],
        //apiSecret: "Yc4rdtDn1DfOpsucZ2G860yKADW8cvcl4hUTC46naA77qPUxmTzTRBtnywWBrXsT",
        apiSecret: keys[1],
        getTime: api_node().time,
        useServerTime: true
    });
    return client;
}
// ------------------------ /LOAD KEYS ------------------------------------

// ---------------------------- BASIC ORDERS ------------------------------
//Market Order
async function marketOrder(keys, symbol, type, quantity) {
    var client = await loadKeys(keys); //load users keys
    quantity = await normalizeQuantity(symbol, quantity); //convert to correct decimals

    return client.newOrder({
        symbol: symbol,
        side: type, //BUY OR SELL
        type: 'MARKET',
        quantity: quantity,
        newOrderRespType: 'FULL'
    }).then(response => {
        var temp_count = 0.0, temp_price = 0.0, temp_quantity = 0.0, temp_commission = 0.0, temp_base;

        //Get the base asset
        for (var i = 0; i < symbols_data["symbols"].length; i++) {
            if (symbol == symbols_data["symbols"][i]["symbol"]) {
                temp_base = symbols_data["symbols"][i]["baseAsset"];
            }
        }

        //calculate all the commissions
        for (i = 0; i < response.fills.length; i++) {
            temp_price = temp_price + parseFloat(response.fills[i].price);
            temp_quantity = temp_quantity + parseFloat(response.fills[i].qty);
            if (response.fills[i].commissionAsset == temp_base) {
                temp_commission = temp_commission + parseFloat(response.fills[i].commission);
            }
            temp_count = i + 1;
        }
        temp_price = temp_price / temp_count;

        //return back the order results
        return ({order: response, price: temp_price, quantity: (temp_quantity - temp_commission)});

    }).catch(err => {
        console.log(err);
        return err;
    });

}

//Limit Order
async function limitOrder(keys, symbol, type, quantity, price, waitResult) {
    var client = await loadKeys(keys);
    var client2 = await loadKeys2(keys);

    //convert price and quantity to correct decimals
    var quantity = await normalizeQuantity(symbol, quantity);
    var price = await normalizePrice(symbol, price);

    return new Promise((resolve, reject) => {
        client.newOrder({
            symbol: symbol,
            side: type, //BUY OR SELL
            type: 'LIMIT',
            quantity: quantity,
            price: price,
            timeInForce: "GTC",
            newOrderRespType: 'FULL'
        }).then(async (response) => {
            console.log(response);
            if (!waitResult) {
                console.log(response);
                resolve({order: response, price: response.price, quantity: response.origQty}); //return back the order ID
            } else {
                var base;
                for (var i = 0; i < symbols_data["symbols"].length; i++) {
                    if (symbol == symbols_data["symbols"][i]["symbol"]) {
                        base = symbols_data["symbols"][i]["baseAsset"];
                        console.log(base);
                    }
                }

                const clean = await client2.ws.user(async msg => {
                    console.log("--- USER DATA LIMIT ---");
                    console.log(msg);
                    if (msg.orderId == response.orderId && msg.orderStatus == "FILLED") {
                        console.log("Order id: " + msg.orderId + "Status: " + msg.orderStatus);

                        var orderId = msg.orderId;
                        await client2.getOrder({
                            symbol: symbol,
                            orderId: orderId,
                            recvWindow: 1000000
                        }).then(async (result) => {
                            if (result.status == "FILLED") {
                                await client2.myTrades({
                                    symbol: symbol,
                                    recvWindow: 1000000
                                }).then(async result2 => {
                                    var commission = 0.0;
                                    for (var i=0; i<result2.length; i++) {
                                        if(result2[i].orderId === orderId && result2[i].commissionAsset == base) {
                                            console.log("************* LIMIT *****************");
                                            commission += parseFloat(result2[i].commission);
                                        }
                                    }
                                    console.log("Commission: " + commission);
                                    console.log("Quantity: " + result.executedQty);
                                    console.log("*************************************");
                                    try {
                                        await resolve({order: response, price: result.price, quantity: result.executedQty - commission}); //return back the order ID
                                    } finally {
                                        await clean();
                                    }
                                });
                            }
                        });
                    } else if (msg.orderId == response.orderId && msg.orderStatus == "CANCELED") {
                        try {
                            console.log("Order canceled");
                        } finally {
                            await clean();
                        }
                    }
                });
                //check for trade result
            }
        }).catch((err) => {
            console.log(err); //print error if any
            return (err);
        });
    });

}

// ---------------------------- /BASIC ORDERS ------------------------------


// ---------------------------- OTHER FUNCTIONS ------------------------------
//load all symbols data from binance API
async function symbolsData() {
    var url = 'https://api.binance.com/api/v1/exchangeInfo';

    await request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else if (!error && response.statusCode === 200) {
            symbols_data = body;
        } else {
            console.log(response);
        }
    });
}

//convert quantity to correct decimals
function normalizeQuantity(symbol, quantity) {
    quantity = parseFloat(quantity);
    var qty;
    for (var i = 0; i < symbols_data["symbols"].length; i++) {
        if (symbols_data["symbols"][i]["symbol"] == symbol) {
            var stepSize = Math.log10(1 / parseFloat(symbols_data["symbols"][i]["filters"][2]["stepSize"]));
            qty = Math.floor(quantity * 10 ** stepSize) / 10 ** stepSize;
        }
    }
    return qty;
}

//convert price to correct decimals
function normalizePrice(symbol, price) {
    price = parseFloat(price);
    var prc;
    for (var i = 0; i < symbols_data["symbols"].length; i++) {
        if (symbols_data["symbols"][i]["symbol"] == symbol) {
            var tickSize = Math.log10(1 / parseFloat(symbols_data["symbols"][i]["filters"][0]["tickSize"]));
            prc = Math.floor(price * 10 ** tickSize) / 10 ** tickSize;
        }
    }
    return prc;
}

//websocket
function trade_socket(keys) {
    var client = loadKeys2(keys);
    var socket = client.ws.trades.bind(client.ws);
    return socket;
}

module.exports = {
    marketOrder: marketOrder,
    limitOrder: limitOrder,
    normalizeQuantity: normalizeQuantity,
    normalizePrice: normalizePrice,
    trade_socket: trade_socket,
};

// ---------------------------- /OTHER FUNCTIONS ------------------------------