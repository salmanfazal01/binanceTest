const binance = require('./exchanges/binance');

var running_bot_counter = 0;

function initialize_trade(trade) {
    var exchange = eval(trade.exchange);
    var symbol = trade.symbol;
    var keys = trade.keys;
    var initial_type = trade.initial_order.initial_type;
    var initial_order, advance_order;

    if(initial_type.length > 1) {
        initial_order = {
            order_type: initial_type,
            quantity: exchange.normalizeQuantity (symbol, trade.initial_order[initial_type].quantity),
            side: trade.initial_order[initial_type].side,
            trigger: exchange.normalizePrice(symbol, trade.initial_order[initial_type].trigger_price),
            price: exchange.normalizePrice(symbol, trade.initial_order[initial_type].price)
        }
    }

    if (trade.advance_order.active) {
        advance_order = true;
    }

    if(initial_order && !advance_order) {
        createInitialOrder (keys, exchange, symbol, initial_order, false)
    } else if (initial_order && advance_order) {
        createInitialOrder (keys, exchange, symbol, initial_order, advance_order);
    }
}

function createInitialOrder(keys, exchange, symbol, initial_order, advance_order) {
    var type = initial_order.order_type;
    if (type == "market") {
        exchange.marketOrder(
            [keys[0], keys[1]],
            symbol,
            initial_order.side,
            initial_order.quantity
        ).then((response) => {
            console.log(response);
            if( advance_order) {
                running_bot_counter += 1;
                createAdvanceOrder();
            }
        });
    } else if (type == "limit") {
        console.log(initial_order);
        exchange.limitOrder(
            [keys[0], keys[1]],
            symbol,
            initial_order.side,
            initial_order.quantity,
            initial_order.price,
            advance_order? true : false
        ).then(async (response) => {
            console.log(response);
            if( advance_order) {
                running_bot_counter += 1;
                await createAdvanceOrder();
            }
        });
    }
}

function createAdvanceOrder(){
    console.log("ADVANCE CREATED");
}

module.exports = {
    initialize_trade: initialize_trade
};