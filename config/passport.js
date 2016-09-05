/**
 * Created by imitrach on 9/5/2016.
 */
var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../models/user');

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

};

