/**
 * Created by imitrach on 9/5/2016.
 */
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStragey = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var User            = require('../models/user');

var configAuth = require('./auth');

module.exports = function(passport){

    //passport needs to serialzie and deserialize user out of a session
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
       User.findById(id, function(err, user){
           done(err, user);
       });
    });



    //LOCAL SIGNUP==================================

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {


        //async
        process.nextTick(function(){

            //Check to see if the user exists when login
            User.findOne({'local.email' : email}, function(err, user) {

                if(err) return done(err);

                if(user) {
                    //return if there is an user with that email adress;
                    return done(null, false, req.flash('signupMessage', 'That email is already in use'))
                } else {

                    //if there is no user with that email, create it
                    var newUser = new User();

                    //set credentials;
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);

                    //save the user
                    newUser.save(function(err) {
                        if(err) throw err;
                        return done(null, newUser);
                    });

                }

            });
        });
    }));



    passport.use('local-login', new LocalStrategy({

        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {

        //check if the user exists. If it exists login else throw flash message
        User.findOne({'local.email' : email}, function(err, user){

            //return the error before anything else;
            if(err) return done(err);

            //if no user is found, return the message
            if(!user) return done(null, false, req.flash('loginMessage', "No user found"));

            //if the user is found but password is wrong
            if(!user.validPassword(password)) return done(null, false, req.flash('loginMessage', "Oops! Wrong password!"))

            return done(null, user);

        });
    }));


//FACEBOOK=========================
    passport.use(new FacebookStragey({

        //configure
        clientId    : configAuth.facebookAuth.appID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackUrl : configAuth.facebookAuth.callbackURL

    },
    //facebook will send back the token and profile
     function(token, refreshToken, profile, done) {

         //async
         process.nextTick(function(){


             //find the user in db based on fb id
             User.findOne({'facebook.id' : profile.id}, function(err, user){

                 if(err) return done(err);

                 if(user) {
                     //case user found
                     return done(null, user)
                 } else {
                     //case user not found
                     var newUser    = new User();

                     //set fb info in user model
                     newUser.facebook.id    = profile.id; //set user fb id
                     newUser.facebook.token = token; // save token provided by fb
                     newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; //check passport user profile to see how names are returned
                     newUser.facebook.email = profile.emails[0].value; //facebook can return multiple emails so we'll take the first


                     //save our user to the database
                     newUser.save(function(err){
                         if (err) throw err;

                         return done(null, newUser);

                     });
                 }
             });

         });

     }));

    /*passport.use(new TwitterStrategy({
        consumerKey   : configAuth.twitterkAuth.consumerKey,
        consumerSecret: configAuth.twitterkAuth.consumerSecret,
        callbackUrl   : configAuth.twitterkAuth.callbackURL
    },
    function(token, tokenSecret, profile, done) {

        //make code async
        //User.findOne won't fire until we have all our data from tw

        process.nextTick(function(){
            User.findOne({'twitter.id' : profile.id }, function(err, user){

            })
        })

    })*/




};

