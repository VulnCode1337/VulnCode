// import necessary modules
// list of custom objects
const express = require('express');
const bodyParser = require('body-parser');
const Vulnerability = require('../models/vulnerability'); // the full vuln and codeblock object
const passport = require('passport');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const myVulnList = require('../listData'); // list of vuln classes listData.js


// configure middleware
router.use(bodyParser.urlencoded({ extended: false}));
router.use(bodyParser.json());

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
// ===================== ROUTES ==========================================


// Home Page
router.get('/', (req, res) => {
    res.render('layout', { title: 'VulnCodeServer - Home', content: 'home' });
});


// login page
router.get('/login', (req, res) => {
    res.render('layout', {title: "VulnCodeServer Login Page", content: 'login'})
});


// logout page
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});


// Admin Page
router.get('/admin', ensureAuthenticated, (req, res) => {
    res.render('admin', { layout: 'layout', title: 'Admin Panel', myVulnList: myVulnList });
});


// Sanitize my input in the Admin panel before saving in DB
const sanitizeInput = [
    check('name').trim().escape(),
    check('codeblock').escape(),
    check('language').trim().escape(),
    check('explanation').trim().escape(),
    check('difficultyRating').toInt()
];


router.post('/add-vulnerability', ensureAuthenticated, sanitizeInput, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // handle errors and return a response with the errors
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, codeblock, language, explanation, difficultyRating, vulnClass } = req.body;
      console.log('Selected List Item:', vulnClass); // Log the selected list item value
      const vulnerability = new Vulnerability({ name, codeblock, language, explanation, difficultyRating }); // instantiate
      await vulnerability.save();
      res.redirect('/secure-code-practice');
    } catch (err) {
      console.error('Error in /add-vulnerability:', err.message);
      res.status(500).send('Server Error');
    }
  });
  
  

// Ask user to choose difficulty rating
router.get('/secure-code-practice', async (req, res) => {
    try {
        res.render('select-difficulty', { title: 'VulnCodeServer - Select Difficulty' });
    }   catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// sanitize input from admin form submission
router.post('/secure-code-practice', async (req, res) => {
    try {
        const { vulnClass } = req.body;
        const difficultyRating = parseInt(req.body.difficultyRating);
        const vulnerabilities = await Vulnerability.find({ difficultyRating });

        const sanitizedVulnerabilities = vulnerabilities.map(vulnerability => {
            const sanitizedCodeblock = DOMPurify.sanitize(vulnerability.codeblock, { ADD_TAGS: ['pre', 'code'] });

            return {
                ...vulnerability._doc,
                codeblock: sanitizedCodeblock,
            };
        });
        res.render('layout', { title: 'VulnCode - Secure Code Practice', content: 'secure-code-practice', vulnerabilities: sanitizedVulnerabilities, myVulnList: myVulnList, vulnClass: vulnClass });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// route for rendering the login page
router.get('/login', (req, res) => {
    res.render('login', { layout: 'layout', title: 'Login'})
})

// route for logging in
router.post('/login', (req, res, next) => {
    console.log('login attempt:', req.body);
    passport.authenticate('local', {
      successRedirect: '/admin',
      failureRedirect: '/login',
      failureFlash: true,
    })(req, res, next);
  });

// final 
module.exports = router;
