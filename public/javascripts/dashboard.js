$(document).ready(function () {

    //sidenav toggles
    $('.sidenav_exchange').on('click', function () {
        //snippets
        $('#accounts_snippet').css('display', 'none');
        $('#exchange_snippet').css('display', '');
        //toggle sidenav active
        $('.sidenav_accounts').removeClass('active');
        $('.sidenav_exchange').addClass('active');
    });
    $('.sidenav_accounts').on('click', function () {
        //snippets
        $('#accounts_snippet').css('display', '');
        $('#exchange_snippet').css('display', 'none');
        //toggle sidenav active
        $('.sidenav_accounts').addClass('active');
        $('.sidenav_exchange').removeClass('active');
    });


    //Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

});