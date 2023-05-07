const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) =>  {
        try {
            const user = await User.findOne({ username: email }); // Change this line

            if (!user) {
                console.log('Email not registered:', email);
                return done(null, false, { message: 'Email is not registered.'});
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log('Incorrect password:', email);
                return done(null, false, { message: 'Incorrect password'});
            }

            console.log('Successful login:', email);
            return done(null, user);
        } catch(err) {
            console.error(err);
            done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error(err);
            done(err);
        }
    });
};
