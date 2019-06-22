module.exports = function (app, passport) {
    /* GET home page. */
    app.get('/', function (req, res, next) {
        res.render('index', {message: req.flash('message')});
    });

    // ============= SIGN UP ===============
    // =====================================
    //POST signup form
    app.post('/register', passport.authenticate('register', {
        successRedirect : '/dashboard',
        failureRedirect : '/?err=t',
        failureFlash : true
    }));


    // ============= SIGN IN ===============
    // =====================================
    //POST signin form
    app.post('/login', passport.authenticate('login', {
        successRedirect : '/dashboard',
        failureRedirect : '/?err=t',
        failureFlash : true
    }));


    // ============ LOGOUT ================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};