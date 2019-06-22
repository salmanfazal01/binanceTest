var exchangeSymbols;
var user_accounts;
var user_balances;
var open_bots, open_orders;
var row_id;
var symbol_prices, symbol_price, orderbook, balance_base, balance_quote, exchange;

$(document).ready(function () {

    //initialize datatable
    $('#open_bots_table').DataTable({
        searching: false, paging:false, info: false,
        "scrollY": "40vh",
        "scrollCollapse": true,
    });
    $('#open_orders_table').DataTable({
        searching: false, paging:false, info: false,
        "scrollY": "40vh",
        "scrollCollapse": true,
    });
    $('.dataTables_length').addClass('bs-select');

    setAccountsDropdown(); //initializes everything


    var tp_switch, sl_switch;

    //when different symbol selected
    $('#symbol').change(function () {
        for (var i = 0; i < exchangeSymbols.length; i++) {
            if(exchangeSymbols[i]["symbol"] == $('#symbol').val()){
                localStorage.setItem("symbol", $('#symbol').val());
                localStorage.setItem("quote", exchangeSymbols[i]["quoteAsset"]);
                localStorage.setItem("base", exchangeSymbols[i]["baseAsset"]);

                refresh_fields();
            }
        }
    });

    //when initial slider is moved
    $('#initial_market_buy_slider').on( 'input', function () {
        var total = parseFloat(balance_quote) * (parseFloat($('#initial_market_buy_slider').val())/100);
        $("#initial_market_buy_quantity").val((total / symbol_price).toFixed(8));
        $("#initial_market_buy_total").val(total.toFixed(8));
    });
    $('#initial_market_sell_slider').on( 'input', function () {
        var total = parseFloat(balance_base) * (parseFloat($('#initial_market_sell_slider').val())/100);
        $("#initial_market_sell_quantity").val(total.toFixed(8));
        $("#initial_market_sell_total").val((total * symbol_price).toFixed(8));
    });
    $('#initial_limit_buy_slider').on( 'input', function () {
        var total = parseFloat(balance_quote) * (parseFloat($('#initial_limit_buy_slider').val())/100);
        $("#initial_limit_buy_quantity").val((total / parseFloat($('#initial_limit_buy_price').val())).toFixed(8));
        $("#initial_limit_buy_total").val(total.toFixed(8));
    });
    $('#initial_limit_sell_slider').on( 'input', function () {
        var total = parseFloat(balance_base) * (parseFloat($('#initial_limit_sell_slider').val())/100);
        $("#initial_limit_sell_quantity").val(total.toFixed(8));
        $("#initial_limit_sell_total").val((total * parseFloat($('#initial_limit_sell_price').val())).toFixed(8));
    });
    $('#initial_stop_buy_slider').on( 'input', function () {
        var total = parseFloat(balance_quote) * (parseFloat($('#initial_stop_buy_slider').val())/100);
        $("#initial_stop_buy_quantity").val((total / parseFloat($('#initial_stop_buy_price').val())).toFixed(8));
        $("#initial_stop_buy_total").val(total.toFixed(8));
    });
    $('#initial_stop_sell_slider').on( 'input', function () {
        var total = parseFloat(balance_base) * (parseFloat($('#initial_stop_sell_slider').val())/100);
        $("#initial_stop_sell_quantity").val(total.toFixed(8));
        $("#initial_stop_sell_total").val((total * parseFloat($('#initial_stop_sell_price').val())).toFixed(8));
    });

    //when initial quantity is altered
    $('#initial_market_buy_quantity').on('keyup', function () {
        $("#initial_market_buy_total").val(parseFloat($('#initial_market_buy_quantity').val() * symbol_price).toFixed(8));
        $("#initial_market_buy_slider").val(($('#initial_market_buy_total').val() / parseFloat(balance_quote)) * 100);
    });
    $('#initial_market_sell_quantity').on('keyup', function () {
        $("#initial_market_sell_total").val(parseFloat($('#initial_market_sell_quantity').val() * symbol_price).toFixed(8));
        $("#initial_market_sell_slider").val(($('#initial_market_sell_quantity').val() / parseFloat(balance_base)) * 100);
    });
    $('#initial_limit_buy_quantity').on('keyup', function () {
        $("#initial_limit_buy_total").val(parseFloat($('#initial_limit_buy_quantity').val() * $('#initial_limit_buy_price').val()).toFixed(8));
        $("#initial_limit_buy_slider").val(($('#initial_limit_buy_total').val() / parseFloat(balance_quote)) * 100);
    });
    $('#initial_limit_sell_quantity').on('keyup', function () {
        $("#initial_limit_sell_total").val(parseFloat($('#initial_limit_sell_quantity').val() * $('#initial_limit_sell_price').val()).toFixed(8));
        $("#initial_limit_sell_slider").val(($('#initial_limit_sell_quantity').val() / parseFloat(balance_base)) * 100);
    });
    $('#initial_stop_buy_quantity').on('keyup', function () {
        $("#initial_stop_buy_total").val(parseFloat($('#initial_stop_buy_quantity').val() * $('#initial_stop_buy_price').val()).toFixed(8));
        $("#initial_stop_buy_slider").val(($('#initial_stop_buy_total').val() / parseFloat(balance_quote)) * 100);
    });
    $('#initial_stop_sell_quantity').on('keyup', function () {
        $("#initial_stop_sell_total").val(parseFloat($('#initial_stop_sell_quantity').val() * $('#initial_stop_sell_price').val()).toFixed(8));
        $("#initial_stop_sell_slider").val(($('#initial_stop_sell_quantity').val() / parseFloat(balance_base)) * 100);
    });

    //when initial total is altered
    $('#initial_market_buy_total').on('keyup', function () {
        $("#initial_market_buy_slider").val((($('#initial_market_buy_total').val() / parseFloat(balance_quote)) * 100).toFixed(0));
        $("#initial_market_buy_quantity").val(($('#initial_market_buy_total').val()/parseFloat(symbol_price)).toFixed(8));
    });
    $('#initial_market_sell_total').on('keyup', function () {
        $("#initial_market_sell_quantity").val(($('#initial_market_sell_total').val() / parseFloat(symbol_price)).toFixed(8));
        $("#initial_market_sell_slider").val((($('#initial_market_sell_quantity').val() / parseFloat(balance_base)) * 100).toFixed(0));
    });
    $('#initial_limit_buy_total').on('keyup', function () {
        $("#initial_limit_buy_slider").val(($('#initial_limit_buy_total').val() / balance_quote) * 100);
        $("#initial_limit_buy_quantity").val(($('#initial_limit_buy_total').val()/$('#initial_limit_buy_price').val()).toFixed(8));
    });
    $('#initial_limit_sell_total').on('keyup', function () {
        $("#initial_limit_sell_quantity").val(($('#initial_limit_sell_total').val() / $('#initial_limit_sell_price').val()).toFixed(8));
        $("#initial_limit_sell_slider").val(($('#initial_limit_sell_quantity').val() / balance_base ) * 100);
    });
    $('#initial_stop_buy_total').on('keyup', function () {
        $("#initial_stop_buy_slider").val(($('#initial_stop_buy_total').val() / balance_quote) * 100);
        $("#initial_stop_buy_quantity").val(($('#initial_stop_buy_total').val()/$('#initial_stop_buy_price').val()).toFixed(8));
    });
    $('#initial_stop_sell_total').on('keyup', function () {
        $("#initial_stop_sell_quantity").val(($('#initial_stop_sell_total').val() / $('#initial_stop_sell_price').val()).toFixed(8));
        $("#initial_stop_sell_slider").val(($('#initial_stop_sell_quantity').val() / balance_base ) * 100);
    });

    //when initial price is altered
    $('#initial_limit_buy_price').on('keyup', function () {
        $("#initial_limit_buy_total").val(parseFloat($('#initial_limit_buy_quantity').val() * $('#initial_limit_buy_price').val()).toFixed(8));
        $("#initial_limit_buy_slider").val(($('#initial_limit_buy_total').val() / parseFloat(balance_quote)) * 100);
    });
    $('#initial_limit_sell_price').on('keyup', function () {
        $("#initial_limit_sell_total").val(parseFloat($('#initial_limit_sell_quantity').val() * $('#initial_limit_sell_price').val()).toFixed(8));
        $("#initial_limit_sell_slider").val(($('#initial_limit_sell_quantity').val() / parseFloat(balance_base)) * 100);
    });
    $('#initial_stop_buy_price').on('keyup', function () {
        $("#initial_stop_buy_total").val(parseFloat($('#initial_stop_buy_quantity').val() * $('#initial_stop_buy_price').val()).toFixed(8));
        $("#initial_stop_buy_slider").val(($('#initial_stop_buy_total').val() / parseFloat(balance_quote)) * 100);
    });
    $('#initial_stop_sell_price').on('keyup', function () {
        $("#initial_stop_sell_total").val(parseFloat($('#initial_stop_sell_quantity').val() * $('#initial_stop_sell_price').val()).toFixed(8));
        $("#initial_stop_sell_slider").val(($('#initial_stop_sell_quantity').val() / parseFloat(balance_base)) * 100);
    });

    //when different account is selected
    $('#accounts').change(function () {
        for (var i = 0; i < exchangeSymbols.length; i++) {
            if(exchangeSymbols[i]["symbol"] == $('#symbol').val()){
                setFormSymbols(exchangeSymbols[i]["baseAsset"], exchangeSymbols[i]["quoteAsset"])
            }
        }
        loadTradingviewChart($('#symbol').val());
    });

    //when tp/sl is enabled or disabled
    $('#enable_take_profit').click(function () {
        $('.tp-overlay').hide();
        $('#take_profit_fieldset').removeAttr('disabled');
        $('#take_profit_switch input:checkbox').prop('checked', true);
        $('.initial_buy_checkbox').show();
        $('.initial_market_sell_btn').prop('disabled', true);


    });
    $('#enable_stoploss').click(function () {
        $('.sl-overlay').hide();
        $('.stoploss-card form .program-btn').show();
        $('#stoploss_fieldset').removeAttr('disabled');
        $('#stoploss_switch input:checkbox').prop('checked', true);
        $('.initial_buy_checkbox').show();
        $('.initial_market_sell_btn').prop('disabled', true);
    });
    $('#add_advance_order_btn').click(function () {
        $('.tp-overlay').hide();
        $('#take_profit_fieldset').removeAttr('disabled');
        $('#take_profit_switch input:checkbox').prop('checked', true);

        $('.sl-overlay').hide();
        $('.stoploss-card form .program-btn').show();
        $('#stoploss_fieldset').removeAttr('disabled');
        $('#stoploss_switch input:checkbox').prop('checked', true);
    });

    $('.switch input[type="checkbox"]').on('change', function() {
        tp_switch = $('#take_profit_switch input:checkbox:checked').val();
        sl_switch = $('#stoploss_switch input:checkbox:checked').val();

        if(tp_switch != "on") {
            $('.tp-overlay').show();
            $('#take_profit_fieldset').attr('disabled', true);
        }
        if (sl_switch != "on") {
            $('.stoploss-card form .program-btn').hide();
            $('.sl-overlay').show();
            $('#stoploss_fieldset').attr('disabled', true);
        }

        if(tp_switch == "on" || sl_switch == "on") {
            $('.initial_buy_checkbox').show();
        } else {
            $('.initial_buy_checkbox').hide();
            $('.initial_market_sell_btn').removeAttr('disabled');
        }
    });

});


// ------------------- FRONT END FUNCTIONS -----------------------
//load tradingview chart
function loadTradingviewChart(symbol) {

    new TradingView.widget({
        "autosize": true,
        "symbol": "BINANCE:" + symbol,
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "Dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "rgba(22,27,46,0)",
        "enable_publishing": false,
        "allow_symbol_change": false,
        "hide_side_toolbar": false,
        "container_id": "tradingview_5ba24"
    });
}

//Set form field symbols
function setFormSymbols(base, quote) {
    //initials
    $('#initial_market_buy_price_symbol').text(quote);
    $('#initial_market_buy_quantity_symbol').text(base);
    $('#initial_market_sell_price_symbol').text(quote);
    $('#initial_market_sell_quantity_symbol').text(base);

    $('#initial_limit_buy_price_symbol').text(quote);
    $('#initial_limit_buy_quantity_symbol').text(base);
    $('#initial_limit_buy_total_symbol').text(quote);
    $('#initial_limit_sell_price_symbol').text(quote);
    $('#initial_limit_sell_quantity_symbol').text(base);
    $('#initial_limit_sell_total_symbol').text(quote);

    $('#initial_stop_buy_trigger_symbol').text(quote);
    $('#initial_stop_buy_price_symbol').text(quote);
    $('#initial_stop_buy_quantity_symbol').text(base);
    $('#initial_stop_buy_total_symbol').text(quote);
    $('#initial_stop_sell_trigger_symbol').text(quote);
    $('#initial_stop_sell_price_symbol').text(quote);
    $('#initial_stop_sell_quantity_symbol').text(base);
    $('#initial_stop_sell_total_symbol').text(quote);

    //advance
    $('#take_profit_price_symbol').text(quote);
    $('#stoploss_price_symbol').text(quote);

    //balances
    $('.exchange_balance_quote_symbol').text(" " + quote);
    $('.exchange_balance_base_symbol').text(" " + base);

}

//Fill open bots table
function fill_bots_table() {
    $('#open_bots_table').DataTable().clear().draw();

    $.ajax({
        url: '/getOpenBots',
        method: 'GET',
        contentType: 'application/json',
        success: function (response) {
            if(typeof response != "object" || response.length <= 0) {
                console.log('There are no open advance orders');
            } else {
                open_bots = response;
                for (var i=0; i<response.length; i++) {
                    if(response[i].active == true) {
                        var account_name = "";
                        for(var j=0; j<user_accounts.length; j++) {
                            if(response[i].account_id == user_accounts[j].id) {
                                account_name = user_accounts[j].name;
                            }
                        }

                        var dataset = ([
                            response[i].id,
                            "<span class='blue-text'>" +response[i].symbol + "<br> <small>" + account_name +"</small></span>",
                            new Date(response[i].start_time).toLocaleString(),
                            response[i].quantity,
                            "<span data-toggle='tooltip' title='Live: " + response[i].livePrice +" \nStart: " + response[i].startPrice + " \nSL Price: " + response[i].slPrice.toFixed(8) +" \nSL Type: " + response[i].slType +" \nSL Trailing: " + response[i].slTrailing +" \nSL Timeout: " + response[i].timeout +" \nTP Price: " + response[i].tpPrice.toFixed(8) +" \nTP Type: " + response[i].tpType +" \nTP Deviation: " + response[i].tpDeviation +" '>" +

                            "SL: " + response[i].slPrice.toFixed(8) + " - " + response[i].slType + "<br>TP: " + response[i].tpPrice.toFixed(8) + " - " + response[i].tpType + "</span>",
                            (((response[i].livePrice-response[i].startPrice)/response[i].startPrice)*100).toFixed(2) + "%",
                            '<div class="row p-0 justify-content-lg-center">' +
                            '<button type="button" class="btn btn-outline-info btn-sm m-0 mr-2 px-20px" title="Market Close" onclick="marketCloseBotClicked(this)"><i class="fas fa-times"></i></button>' +
                            '<button type="button" class="btn btn-outline-success btn-sm m-0 mr-2 px-15px" title="Edit"  onclick="editBotClicked(this)"><i class="fas fa-edit"></i></button>' +
                            '<button type="button" class="btn btn-outline-danger btn-sm m-0 px-15px" title="Delete" onclick="deleteBotClicked(this)"><i class="fas fa-trash-alt"></i></button></div>'
                        ]);
                        $('#open_bots_table').DataTable().row.add(dataset).draw();
                    }
                    $('#open_bots_table td:nth-child(1)').addClass('bot_row_id');
                }
            }
        }
    });

}

//Fill open bots table
function fill_open_orders_table() {
    $('#open_orders_table').DataTable().clear().draw();

    $.ajax({
        url: '/getOpenOrders/' + $('#accounts').val(),
        method: 'GET',
        contentType: 'application/json',
        success: async function (response) {
            console.log(typeof response);
            if(typeof response == "object" && response.length > 0) {
                console.log(response);
                open_orders = response;

                for (var i=0; i<response.length; i++) {

                    var dataset = ([
                        response[i].orderId,
                        new Date(response[i].time).toLocaleString(),
                        "<span class='blue-text'>" + response[i].symbol + "</span>",
                        response[i].type,
                        response[i].side,
                        response[i].price,
                        response[i].origQty,
                        response[i].executedQty,
                        '<div class="row p-0 justify-content-lg-center">' +
                        '<button type="button" class="btn btn-outline-danger btn-sm m-0 px-15px" title="Cancel">Cancel</button></div>'
                    ]);
                    console.log(dataset);
                    $('#open_orders_table').DataTable().row.add(dataset).draw();
                    $('#open_orders_table td:nth-child(1)').addClass('bot_row_id');
                }
            }
        }
    });

}

//Reset form inputs
function reset_all_forms() {
    $('#market_order_buy_form').trigger("reset");
    $('#market_order_sell_form').trigger("reset");
    $('#limit_order_buy_form').trigger("reset");
    $('#limit_order_sell_form').trigger("reset");
    $('#stop_order_buy_form').trigger("reset");
    $('#stop_order_sell_form').trigger("reset");
    $('#take_profit_form').trigger("reset");
    $('#stoploss_form').trigger("reset");

    $('.program-btn').show();
    $('.edit-bot-btn').hide();
    $('.cancel-edit-bot-btn').hide();
    $('.initial_buy_checkbox').hide();

    $('.initial-overlay').hide();
    $('.tp-overlay').show();
    $('.sl-overlay').show();

}

//Edit bot button clicked
function editBotClicked(id){
    row_id = get_row_id(id);

    for (var i in open_bots) {
        if (open_bots[i].id == row_id) {

            console.log(open_bots[i]);

            $('.initial-overlay').show();

            //TAKE PROFITS
            if(open_bots[i].tpPrice > 0) {
                $('#take_profit_switch input:checkbox').prop('checked', true);
                $('.tp-overlay').hide();
            } else {
                $('#take_profit_switch input:checkbox').prop('checked', false);
                $('.tp-overlay').show();
            }
            if(open_bots[i].tpPercentage > 0) {
                $("#tp_radio_price").prop("checked", false);
                $("#tp_radio_percentage").prop("checked", true);
            } else {
                $("#tp_radio_percentage").prop("checked", false);
                $("#tp_radio_price").prop("checked", true);
            }
            if(open_bots[i].tpType == "market") {
                $("#tp_type_market").prop("checked", true);
            } else {
                $("#tp_type_limit").prop("checked", true);
            }
            $('#take_profit_price').val(open_bots[i].tpPrice);
            $('#take_profit_percentage').val(open_bots[i].tpPercentage);
            $('#take_profit_deviation').val(open_bots[i].tpDeviation * -1);

            //STOPLOSSES
            if(open_bots[i].slPrice > 0) {
                $('#stoploss_switch input:checkbox').prop('checked', true);
                $('.sl-overlay').hide();
            } else {
                $('#stoploss_switch input:checkbox').prop('checked', false);
                $('.sl-overlay').show();
            }
            if(open_bots[i].slPercentage > 0) {
                $("#sl_radio_price").prop("checked", false);
                $("#sl_radio_percentage").prop("checked", true);
            } else {
                $("#sl_radio_percentage").prop("checked", false);
                $("#sl_radio_price").prop("checked", true);
            }
            if(open_bots[i].slType == "market") {
                $("#sl_type_market").prop("checked", true);
            } else {
                $("#sl_type_limit").prop("checked", true);
            }
            $('#stoploss_price').val(open_bots[i].slPrice);
            $('#stoploss_percentage').val(open_bots[i].slPercentage);
            if(open_bots[i].slTrailing == true) {
                $('#stoploss_trailing').prop("checked", true);
            } else {
                $('#stoploss_trailing').prop("checked", false);
            }
            $('#stoploss_timeout').val(open_bots[i].timeout);


            $('.program-btn').hide();
            $('.edit-bot-btn').show();
            $('.cancel-edit-bot-btn').show();
        }
    }
}

//Delete bot clicked
function deleteBotClicked(id){
    row_id = get_row_id(id);

    for (var i in open_bots) {
        if (open_bots[i].id == row_id) {
            $('#delete_bot_modal').modal('toggle');
        }
    }
}

//Market close bot clicked
function marketCloseBotClicked(id) {
    row_id = get_row_id(id);

    for (var i in open_bots) {
        if (open_bots[i].id == row_id) {
            $('#market_close_bot_modal').modal('toggle');
        }
    }
}

//Initial buy button clicked
function initialBuyClicked(type) {

    $('#initial_confirm_modal .modal-dialog').removeClass('modal-danger modal-sm text-center');
    $('#initial_confirm_modal .modal-dialog').addClass('modal-info modal-md');

    $('.initial_modal_initial_section').removeClass('col-lg-12');
    $('.initial_modal_initial_section').addClass('col-lg-6');

    $('.initial_modal_advance_section').show();

    $('.initial_modal_buy_buttons').show();
    $('.initial_modal_sell_buttons').hide();

    var tp_switch = $('#take_profit_switch input:checkbox:checked').val();
    var sl_switch = $('#stoploss_switch input:checkbox:checked').val();

    if(tp_switch != "on" && sl_switch != "on") {
        $('#initial_modal_add_advance_btn').show();
        $('#initial_modal_advance_fields').hide();
    } else {
        $('#initial_modal_add_advance_btn').hide();
        $('#initial_modal_advance_fields').show();
    }

    $('#initial_modal_symbol').text($('#symbol').val());
    $('#initial_modal_type').text(capitalizeFirstLetter(type));
    $('#initial_modal_side').text("buy");

    if(type == "market") {
        $('#initial_modal_price').text($('#initial_market_buy_price').val());
        $('#initial_modal_quantity').text($('#initial_market_buy_quantity').val());
        $('#initial_modal_trigger').text('-');
        $('#initial_modal_total').text($('#initial_market_buy_total').val());
    } else if (type == "limit") {
        $('#initial_modal_price').text($('#initial_limit_buy_price').val());
        $('#initial_modal_quantity').text($('#initial_limit_buy_quantity').val());
        $('#initial_modal_trigger').text('-');
        $('#initial_modal_total').text($('#initial_limit_buy_total').val());
    } else if (type == "stop") {
        $('#initial_modal_price').text($('#initial_stop_buy_price').val());
        $('#initial_modal_quantity').text($('#initial_stop_buy_quantity').val());
        $('#initial_modal_trigger').text($('#initial_stop_buy_trigger').val());
        $('#initial_modal_total').text($('#initial_stop_buy_total').val());
    }

    $('#initial_confirm_modal').modal('toggle');

}

//Initial sell button clicked
function initialSellClicked(type) {

    $('#initial_confirm_modal .modal-dialog').removeClass('modal-info modal-md');
    $('#initial_confirm_modal .modal-dialog').addClass('modal-danger modal-sm text-center');

    $('.initial_modal_initial_section').removeClass('col-lg-6');
    $('.initial_modal_initial_section').addClass('col-lg-12');

    $('.initial_modal_advance_section').hide();

    $('.initial_modal_buy_buttons').hide();
    $('.initial_modal_sell_buttons').show();

    $('#initial_modal_symbol').text($('#symbol').val());
    $('#initial_modal_type').text(capitalizeFirstLetter(type));
    $('#initial_modal_side').text("sell");

    if(type == "market") {
        $('#initial_modal_price').text($('#initial_market_sell_price').val());
        $('#initial_modal_quantity').text($('#initial_market_sell_quantity').val());
        $('#initial_modal_trigger').text('-');
        $('#initial_modal_total').text($('#initial_market_sell_total').val());
    } else if (type == "limit") {
        $('#initial_modal_price').text($('#initial_limit_sell_price').val());
        $('#initial_modal_quantity').text($('#initial_limit_sell_quantity').val());
        $('#initial_modal_trigger').text('-');
        $('#initial_modal_total').text($('#initial_limit_sell_total').val());
    } else if (type == "stop") {
        $('#initial_modal_price').text($('#initial_stop_sell_price').val());
        $('#initial_modal_quantity').text($('#initial_stop_sell_quantity').val());
        $('#initial_modal_trigger').text($('#initial_stop_sell_trigger').val());
        $('#initial_modal_total').text($('#initial_stop_sell_total').val());
    }

    $('#initial_confirm_modal').modal('toggle');
}

//Calculate account total balance
function calculateAccountBalance() {
    //
}


// ---------------------- API FUNCTIONS --------------------------
//Add accounts to accounts dropdown
function setAccountsDropdown() {
    $.ajax({
        url: '/getAccounts',
        method: 'GET',
        contentType: 'application/json',
        success: async function (response) {
            if (response.length > 0) {
                var accountsList;
                for (var i=0; i<response.length; i++) {
                    accountsList += "<option value=" + response[i].id + ">" + response[i].name + "</option>";
                }
                await $('select[id="accounts"]').append(accountsList); //adding response to dropdown
                user_accounts = response;

                await initialize();

            } else {
                toastr.error("No account found");
                $('.program-btn').attr('disabled', 'disabled');
            }

        }
    });
}

//Add symbols to symbols dropdown
function setSymbolsDropdown(exchange) {
    $('#symbol').empty();
    $.ajax({
        url: '/getSymbols/' + exchange,
        method: 'GET',
        contentType: 'application/json',
        success: function (response) {
            exchangeSymbols = response["symbols"];
            var symbolsList = "";
            for (var i = 0; i < response["symbols"].length; i++) {
                symbolsList += "<option value=" + response["symbols"][i]["symbol"] + ">" + response["symbols"][i]["symbol"] + "</option>";
            }
            $('select[id="symbol"]').append(symbolsList); //adding response to dropdown

            if(localStorage.getItem("symbol")) {
                $('select[id="symbol"]').val(localStorage.getItem("symbol"));
            }

            getSymbolPrice(exchange, $('#symbol').val());
            getSymbolOrderbook(exchange, $('#symbol').val());
        }
    });
}

//Get prices of all symbols
function getSymbolPrice(exchange, symbol) {
    if(exchange && symbol) {
        $.ajax({
            url: '/getSymbolPrice/' + exchange + '/' + symbol,
            method: 'GET',
            contentType: 'application/json',
            success: async function (response) {
                symbol_price = parseFloat(response.price);
            },
            error: async function (response) {
                //pass
            }
        });
    }
}

//Get symbol orderbook
function getSymbolOrderbook(exchange, symbol) {
    if(exchange && symbol) {
        $.ajax({
            url: '/getSymbolOrderbook/' + exchange + '/' + symbol,
            method: 'GET',
            contentType: 'application/json',
            success: function (response) {
                orderbook = response;

                $('#orderbook_bids > tbody').html("");
                $('#orderbook_asks > tbody').html("");

                for(var i=0; i < 19; i++) {
                    $('#orderbook_bids tr:first').after('<tr><td>' + response.bids[i][0] +'</td><td>' + response.bids[i][1] +'</td><td>' + (response.bids[i][0] * response.bids[i][1]).toFixed(5) +'</td></tr>');
                    $('#orderbook_asks tr:last').after('<tr><td>' + response.asks[i][0] +'</td><td>' + response.asks[i][1] +'</td><td>' + (response.asks[i][0] * response.asks[i][1]).toFixed(5) +'</td></tr>');
                }
                $(".orderbook-table-sells").scrollTop($(".orderbook-table-sells")[0].scrollHeight);

            },
            error: async function (response) {
                alert(response);
            }
        });
    }
}


// --------------------- USERS FUNCTIONS -------------------------
//Get all balances of an account
function getAccountBalances() {
    $.ajax({
        url: '/getAccountBalances/' + $('#accounts').val(),
        method: 'GET',
        contentType: 'application/json',
        success: async function (response) {
            user_balances = response;

            if (localStorage.getItem("quote")) {
                await setAccountBalances(localStorage.getItem("base"), localStorage.getItem("quote"));
                await setFormSymbols(localStorage.getItem("base"), localStorage.getItem("quote"));
            }
        }
    });
}

//Set balance of a pair to fields
function setAccountBalances(base, quote) {
    if(base && quote) {
        for (var i in user_balances) {
            if(user_balances[i].asset == base) {
                balance_base = user_balances[i].free;
                $('.exchange_balance_base').text(user_balances[i].free + " ");
            }
            if(user_balances[i].asset == quote) {
                balance_quote = user_balances[i].free;
                $('.exchange_balance_quote').text(user_balances[i].free + " ");
            }
        }
    }
}

//Get open orders (not socket)
function cancelOpenOrder(orderId) {
    $.ajax({
        url: '/cancelOpenOrders/' + $('#accounts').val() + "/" + orderId,
        method: 'POST',
        contentType: 'application/json',
        success: async function (response) {
            console.log(response);
        }
    });
}

//Initialize and program a trade
function programTrade(type) {
    var tp_switch = $('#take_profit_switch input:checkbox:checked').val();
    var sl_switch = $('#stoploss_switch input:checkbox:checked').val();

    var initial_buy = {
        initial_type: $('ul#initial_order_tabs').find('li a.active').prop('type'), //type of initial order
        market: {
            side: 'buy', //buy or sell
            quantity: $('#initial_market_buy_quantity').val() //amount
        },
        limit: {
            side: 'buy', //buy or sell
            quantity: $('#initial_limit_buy_quantity').val(), //amount
            price: $('#initial_limit_buy_price').val() //buy or sell price
        },
        stop: {
            side: 'buy', //buy or sell
            quantity: $('#initial_stop_buy_quantity').val(), //amount
            trigger_price: $('#initial_stop_buy_trigger').val(), //trigger price
            price: $('#initial_stop_buy_price').val() //buy or sell price
        }
    }

    var initial_sell = {
        initial_type: $('ul#initial_order_tabs').find('li a.active').prop('type'), //type of initial order
        market: {
            side: 'sell', //buy or sell
            quantity: $('#initial_market_sell_quantity').val() //amount
        },
        limit: {
            side: 'sell', //buy or sell
            quantity: $('#initial_limit_sell_quantity').val(), //amount
            price: $('#initial_limit_sell_price').val() //buy or sell price
        },
        stop: {
            side: 'sell', //buy or sell
            quantity: $('#initial_stop_sell_quantity').val(), //amount
            trigger_price: $('#initial_stop_sell_trigger').val(), //trigger price
            price: $('#initial_stop_sell_price').val() //buy or sell price
        }
    }

    var trade = {
        exchange: 'binance', //what exchange
        symbol: $('#symbol').val(), //what symbol

        initial_order: type == "buy" ? initial_buy : initial_sell,

        advance_order: {
            active: (tp_switch == "on" || sl_switch == "on") ? true : false, //type of advance order
            tp_percentage: (tp_switch == "on" && document.getElementById('tp_radio_percentage').checked) ? parseFloat($('#take_profit_percentage').val()) : false, //tp %
            tp_type: (tp_switch == "on" && document.getElementById('tp_type_market').checked) ? "market": "limit", //market or limit
            tp_price: (tp_switch == "on" && document.getElementById('tp_radio_price').checked) ? parseFloat($('#take_profit_price').val()): false, //TP price
            tp_deviation: (tp_switch == "on" && parseFloat($('#take_profit_deviation').val()) < 0) ? parseFloat($('#take_profit_deviation').val() * -1) : false,
            tp_split: (tp_switch == "on" && parseFloat($('#tp_radio_split').val()) > 0) ? [] : [],

            sl_percentage: (sl_switch == "on" && document.getElementById('sl_radio_percentage').checked) ? parseFloat($('#stoploss_percentage').val()) * -1 : false, //% of SL
            sl_type: (sl_switch == "on" && document.getElementById('sl_type_market').checked) ? "market": "limit", //market or limit, //market of limit?
            sl_price: (sl_switch == "on" && document.getElementById('sl_radio_price').checked) ? parseFloat($('#stoploss_price').val()) : false, //price of SL
            sl_trailing: sl_switch == "on" && $('#stoploss_trailing:checked').val() == "on" ? true : false,
            sl_timeout: (sl_switch == "on" && parseFloat($('#stoploss_timeout').val()) > 0 ? parseFloat($('#stoploss_timeout').val()) : 0) //SL timeout
        }
    }

    console.log(trade);
    submit_bot_order(trade);

}

//Submit order
function submit_bot_order(trade) {
    $.ajax({
        url: '/createBotOrder/' + $('#accounts').val(),
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(trade),
        success: function (response) {
            toastr.info(response);
        }
    });
    setTimeout(refresh_fields, 2000);

}

//Edit a bot
function confirm_edit_bot() {
    var tp_switch = $('#take_profit_switch input:checkbox:checked').val();
    var sl_switch = $('#stoploss_switch input:checkbox:checked').val();
    var sl_price, tp_price, start_price;

    for(var i in open_bots) {
        if(open_bots[i].id == row_id) {
            start_price = open_bots[i].startPrice;
        }
    }

    if((tp_switch == "on" && document.getElementById('tp_radio_percentage').checked)) {
        tp_price = start_price * ((100 + parseFloat($('#take_profit_percentage').val())) / 100);
    } else if ((tp_switch == "on" && document.getElementById('tp_radio_price').checked)) {
        tp_price = parseFloat($('#take_profit_price').val());
    }

    if((sl_switch == "on" && document.getElementById('sl_radio_percentage').checked)) {
        sl_price = start_price * ((100 - parseFloat($('#stoploss_percentage').val())*-1) / 100);
    } else if ((sl_switch == "on" && document.getElementById('sl_radio_price').checked)) {
        sl_price = parseFloat($('#stoploss_price').val());
    }

    var data = {
        id: row_id,
        sl_price: sl_price,
        sl_trailing: sl_switch == "on" && $('#stoploss_trailing:checked').val() == "on" ? true : false,
        sl_type: (sl_switch == "on" && document.getElementById('sl_type_market').checked) ? "market": "limit",
        timeout: (sl_switch == "on" && parseFloat($('#stoploss_timeout').val()) > 0 ? parseFloat($('#stoploss_timeout').val()) : 0),
        tp_deviation: (tp_switch == "on" && parseFloat($('#take_profit_deviation').val()) < 0) ? parseFloat($('#take_profit_deviation').val() * -1) : false,
        tp_price: tp_price,
        tp_split: [],
        tp_type: (tp_switch == "on" && document.getElementById('tp_type_market').checked) ? "market": "limit",
    };

    $.ajax({
        url: '/edit_bot',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            toastr.success("Editing advance order ...");
            setTimeout(refresh_fields(), 1000);
        }
    });
}

//Delete a bot
function confirm_delete_bot() {

    $.ajax({
        url: '/delete_bot/' + row_id,
        method: 'DELETE',
        contentType: 'application/json',
        success: function (response) {
            if (response == true) {
                toastr.success("Deleting advance order ...");
                setTimeout(refresh_fields(), 3000);
            } else {
                toastr.error(response);
            }
        }
    });
}

//Market close a bot
function confirm_market_close_bot() {

    $.ajax({
        url: '/close_bot/' + row_id,
        method: 'POST',
        contentType: 'application/json',
        success: function (response) {
            if (response == true) {
                toastr.success("Market Selling ...");
                setTimeout(refresh_fields(), 3000);
            } else {
                toastr.error(response);
            }
        }
    });
}


// --------------------- OTHER FUNCTIONS -------------------------
function get_row_id(obj) {
    var $row = $(obj).closest("tr");
    var $text = $row.find(".bot_row_id").text();
    return ($text);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function initialize() {

    $('#mdb-preloader').fadeIn('slow')

    //Get selected exchange
    for(var i in user_accounts) {
        if(user_accounts[i].id == $('#accounts').val()) {
            exchange = user_accounts[i].exchange;
        }
    }

    //Load symbols list
    await setSymbolsDropdown(exchange);

    //Load chart and set the form symbols
    if (localStorage.getItem("quote")) {
        $('#symbol').val(localStorage.getItem("symbol"));
        await setFormSymbols(localStorage.getItem("base"), localStorage.getItem("quote"));
        await loadTradingviewChart(localStorage.getItem("symbol"));
    } else {
        $('#symbol').val("ETHBTC");
        await setFormSymbols("ETH", "BTC");
        await loadTradingviewChart("ETHBTC");

    }

    //get symbol prices
    await getSymbolPrice(exchange, $('#symbol').val());

    //get symbol orderbook
    await console.log(exchange + " " + $('#symbol').val());
    await getSymbolOrderbook(exchange, $('#symbol').val());

    //get account balances
    await getAccountBalances();

    //refresh all form fields
    reset_all_forms();

    //fill the tables
    await fill_bots_table();
    await fill_open_orders_table();

    await $('#mdb-preloader').fadeOut(2000);

}

async function refresh_fields() {

    $('#mdb-preloader').fadeIn('slow');

    //Get selected exchange
    for(var i in user_accounts) {
        if(user_accounts[i].id == $('#accounts').val()) {
            exchange = user_accounts[i].exchange;
        }
    }

    //Load chart and set the form symbols
    if (localStorage.getItem("quote")) {
        $('#symbol').val(localStorage.getItem("symbol"));
        await setFormSymbols(localStorage.getItem("base"), localStorage.getItem("quote"));
        await loadTradingviewChart(localStorage.getItem("symbol"));
    } else {
        $('#symbol').val("ETHBTC");
        await setFormSymbols("ETH", "BTC");
        //await loadTradingviewChart("ETHBTC");

    }

    //get symbol prices
    await getSymbolPrice(exchange, $('#symbol').val());

    //get symbol orderbook
    await getSymbolOrderbook(exchange, $('#symbol').val());

    //get account balances
    await getAccountBalances();

    //refresh all form fields
    await reset_all_forms();

    //fill the tables
    await fill_bots_table();
    await fill_open_orders_table();

    $('#mdb-preloader').fadeOut('slow');
}













