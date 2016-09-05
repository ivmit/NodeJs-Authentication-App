/**
 * Created by imitrach on 9/5/2016.
 * All the routes for the application
*/

module.exports = function(app, passport) {

    app.get('/', function(req,res){
        res.render('index.ejs');
    });

    app.get('/login', function(req, res){
       res.render('login.ejs', {message: req.flash('signupMessage')}); //flash any data if exists
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile,js', {
            user : req.user     //get the user from the current session and pass to template
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect();
    });


    //process signup form
    //app.post('/signup', do passport stuff)


};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');

}