const express = require('express');
const db = require('./database.js');
const routes = require('./routes'); 
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');
const flash = require('connect-flash');

require('./config/passport')(passport); // Passport configuration


// configure multipart form handling with no file uploads
const app = express();
const upload = multer();

// setup public dir for additional files
app.use(express.static('public'));


app.use(session({
  secret: '!@#$1234',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// setup flash for auth related messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // passport error messages
    next();
});

app.use(upload.none()); // ensure no file uploads

app.use('/', routes);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// connect to MongoDB
db.connectToMongo()
    .then(() => {
        // start the server
        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err)
    });
