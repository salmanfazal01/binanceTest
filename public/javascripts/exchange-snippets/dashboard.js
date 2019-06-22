var user_accounts;


$(document).ready(function () {
    getAccounts();
});

function getAccounts() {
    $.ajax({
        url: '/getAccounts',
        method: 'GET',
        contentType: 'application/json',
        success: function (response) {
            if (response.length > 0) {
                var accountsList;
                for (var i=0; i<response.length; i++) {
                    accountsList += "<option value=" + response[i].id + ">" + response[i].name + "</option>";
                }
                $('select[id="accounts"]').append(accountsList); //adding response to dropdown
                user_accounts = response;

            } else {
                toastr.error("No account found");
            }

        }
    });
}

function submitOrder(symbol, type, quantity, price) {

    var trade = {
        exchange: 'binance',
        symbol: symbol,

        initial_order: {
            initial_type: type,
            market: {
                side: 'buy', //buy or sell
                quantity: quantity
            },
            limit: {
                side: 'buy', //buy or sell
                quantity: quantity,
                price: price
            }
        },

        advance_order: true
    };

    $.ajax({
        url: '/createBotOrder/' + $('#accounts').val(),
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(trade),
        success: function (response) {
            toastr.info(response);
        }
    });
}