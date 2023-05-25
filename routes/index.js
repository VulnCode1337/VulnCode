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
const mongoose = require('mongoose'); // used for explanation query


// function to dynamically add line numbers to the codeblock 
function addLineNumbers(codeblock) {
    if (!codeblock) return "";
    const lines = codeblock.split('\n');
    const numberedLines = lines.map((line, index) => `${index + 1}` + "    " + `${line}`);
    return numberedLines.join('\n');
};

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


// GET Home Page
router.get('/', (req, res) => {
    res.render('layout', { title: 'VulnCode - Home', content: 'home', jsError: null });
});


// GET Login Page
router.get('/login', (req, res) => {
    res.render('layout', {title: "VulnCode Login Page", content: 'login', jsError: null})
});


// POST Log in Admin
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/admin',
      failureRedirect: '/login',
      failureFlash: true,
    })(req, res, next);
  });


// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});


// GET Admin Page
router.get('/admin', ensureAuthenticated, (req, res) => {
    res.render('admin', { layout: 'layout', title: 'Admin Panel', myVulnList: myVulnList, jsError: null });
});


// Sanitize my input in the Admin panel before saving in DB
const sanitizeInput = [
    check('name').trim().escape(),
    check('codeblock').escape(),
    check('language').trim().escape(),
    check('explanation').escape(),
    check('hint').escape(),
    check('difficultyRating').toInt()
];


// POST a vuln to Mongo
router.post('/add-vulnerability', ensureAuthenticated, 
    sanitizeInput, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // handle errors and return a response with the errors
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, codeblock, 
        language, hint, explanation, 
        difficultyRating, vulnClass } = req.body;
      const vulnerability = new Vulnerability({ 
        name, codeblock, 
        language, hint, explanation, 
        difficultyRating, vulnClass }); // instantiate
      await vulnerability.save();
      res.render('admin', { layout: 'layout', title: 'Admin Panel', myVulnList: myVulnList, jsError: null }); // ???
    //   res.redirect('/admin');
    } catch (err) {
      console.error('Error in /add-vulnerability:', err.message);
      res.status(500).send('Server Error');
    }
  });
  

// GET select-difficulty 
router.get('/secure-code-practice', async (req, res) => {
  try {
    // render select difficulty
    res.render('select-difficulty', {
      title: 'VulnCode - Select Difficulty',
      layout: 'layout',
      myVulnList: myVulnList
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error from secure-code-practice route.');
  }
});


// Handling The Next Button on the secure code  page
router.post('/secure-code-practice/start', async (req, res) => {
    try {
        if (!req.session.seenVulnerabilities) {
            req.session.seenVulnerabilities = [];
        }
        let vulnerability;
        if (req.body.nextVuln) {
            const allVulnerabilities = await Vulnerability.find({ difficultyRating: req.session.difficultyLevel});
            const unseenVulnerabilities = allVulnerabilities.filter(v => 
                !req.session.seenVulnerabilities.includes(v._id.toString()));
            if (unseenVulnerabilities.length === 0) {
                req.session.seenVulnerabilities = [];
                vulnerability = allVulnerabilities[0];
            } else {
                vulnerability = unseenVulnerabilities[0];
                req.session.seenVulnerabilities.push(vulnerability._id);
            }
        } else {
            vulnerability = await Vulnerability.findOne({ _id: req.body.vulnerabilityId });
        }
        const sanitizedCodeblock = DOMPurify.sanitize(vulnerability.codeblock, 
            { ADD_TAGS: ['pre', 'code'] });
        const numberedCodeblock = addLineNumbers(sanitizedCodeblock);
        res.status(200).json({ ...vulnerability._doc, codeblock: numberedCodeblock });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the next vulnerability' });
    }
});
  

// Submit Answer
router.post('/submit-answer', async (req, res) => {
    try {
        const { vulnClass, vulnerabilityId } = req.body;
        const vulnerability = await Vulnerability.findById(vulnerabilityId);
  
        // ensure vulnerability is not null before trying to access
        if (!vulnerability) {
            return res.status(404).json({ error_msg: 'Vulnerability not found'});
        }

        // error handling - user didn't select a vuln class
        if (vulnClass === '' || vulnClass === 'Select a vulnerability class') {
            return res.json({
                error_msg: 'Please choose an answer.',
            });
        }
        // Vuln Game Server-Side Logic 
        let message = {};
        if (vulnerability.vulnClass === vulnClass) {
            message.success_msg = 'Correct!';
        } else {
            message.error_msg = 'Incorrect...';
        }
        // Send the response back to the client
        res.json(message);

    } catch (err) {
        console.error('Error in /submit-answer', err.message);
        res.status(500).json({ error_msg: 'Server Error' });
    }
});


// Sanitize input from admin form submission
router.post('/secure-code-practice', async (req, res) => {
    try {
        const { vulnClass } = req.body;
        const difficultyRating = parseInt(req.body.difficultyRating);
        console.log('selected difficulty rating', difficultyRating);
        
        // store selected difficulty rating as session variable key
        req.session.difficultyLevel = difficultyRating;
        
        const vulnerabilities = await Vulnerability.find({ difficultyRating });
    
        const sanitizedVulnerabilities = vulnerabilities.map(vulnerability => {
            const sanitizedCodeblock = DOMPurify.sanitize(vulnerability.codeblock, 
                { ADD_TAGS: ['pre', 'code'] });
            const numberedCodeblock = addLineNumbers(sanitizedCodeblock);

            return {
                ...vulnerability._doc,
                codeblock: numberedCodeblock,
            };
        });
        
        // Select random vulnerability from the array
        const randomIndex = Math.floor(Math.random() * sanitizedVulnerabilities.length);
        const selectedVulnerability = sanitizedVulnerabilities[randomIndex];
                
        res.render('layout', { title: 'VulnCode - Secure Code Practice', 
                            content: 'secure-code-practice',
                            vulnerability: selectedVulnerability, 
                            myVulnList: myVulnList,
                            jsError: null,
                            vulnClass: vulnClass });
        } catch (err) {
            console.error(err);
            if (err instanceof mongoose.Error) {
                res.status(500).send('Database error');
            } else {
                res.status(500).send('Server error');
            }
        }             
});


// Retrieve Explanation. Event: click
router.get('/explanation/:vulnerabilityId', async (req, res) => {
    try {
        const vulnerabilityId = req.params.vulnerabilityId;
        // check if vulnId is a valid objectId
        if (!mongoose.Types.ObjectId.isValid(vulnerabilityId)) {
            return res.status(400).send('Invalid VulnerabilityId');
        }
        const vulnerability = await Vulnerability.findById(vulnerabilityId);
        const sanitizedExplanation = `<pre>${DOMPurify.sanitize(vulnerability.explanation)}</pre>`;
        res.send(sanitizedExplanation);
    } catch (err) {
        console.error('Error in /explanation/:vulnerabilityId', err.message);
        res.status(500).send('Server Error');
    }
});


// Retrieve Hint. Event: Click
router.get('/hint/:vulnerabilityId', async (req, res) => {
    try {
        const vulnerabilityId = req.params.vulnerabilityId;
        // check if vulnId is a valid objectId
        if (!mongoose.Types.ObjectId.isValid(vulnerabilityId)) {
            return res.status(400).send('Invalid VulnerabilityId');
        }
        const vulnerability = await Vulnerability.findById(vulnerabilityId);
        const sanitizedHint = `<pre>${DOMPurify.sanitize(vulnerability.hint)}</pre>`;
        res.send(sanitizedHint);
    }   catch (err) {
        console.error('Error in /hint/:vulnerabilityId', err.message);
        res.status(500).send('Server Error');
    }
});

// final 
module.exports = router;