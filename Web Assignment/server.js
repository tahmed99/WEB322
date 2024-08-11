/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: TAREQ AHMED Student ID: 123067233 Date: 11/08/2024
*  Published URL: ___________________________________________________________
********************************************************************************/

const express = require('express');
const thea2_legoData = require('./modules/legoSets');
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Configure client sessions middleware
app.use(clientSessions({
    cookieName: "session", // cookie name dictates the key name added to the request object
    secret: "assignment6_web322", // should be a long unguessable string
    duration: 24 * 60 * 60 * 1000, // duration of the session in milliseconds (24 hours)
    activeDuration: 1000 * 60 * 5 // the session will be extended by this many ms each request (5 minutes)
}));

// Middleware to make session data available to all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Middleware to ensure the user is logged in
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

// Initialize lego and auth data
thea2_legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize data: ", err);
    });

// Home route
app.get('/', (req, res) => {
    res.render('home', { page: '/' });
});

// About route
app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

// Get all Lego sets
app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;
    if (theme) {
        thea2_legoData.getSetsByTheme(theme).then(sets => {
            res.render('sets', { sets: sets, page: '/lego/sets' });
        }).catch(err => {
            res.status(404).render('404', { message: "No sets found for this theme" });
        });
    } else {
        thea2_legoData.getAllSets().then(sets => {
            res.render('sets', { sets: sets, page: '/lego/sets' });
        }).catch(err => {
            res.status(500).render('404', { message: "Failed to retrieve sets" });
        });
    }
});

// Get a specific Lego set by set number
app.get('/lego/set/:num', (req, res) => {
    const setNum = req.params.num;
    thea2_legoData.getSetByNum(setNum).then(set => {
        res.render('set', { set: set, page: '' });
    }).catch(err => {
        res.status(404).render('404', { message: "Set not found" });
    });
});

// Add a new Lego set
app.get('/lego/addSet', ensureLogin, (req, res) => {
    thea2_legoData.getAllThemes().then(themes => {
        res.render('addSet', { themes: themes });
    }).catch(err => {
        res.status(500).render('500', { message: err.message });
    });
});

app.post('/lego/addSet', ensureLogin, (req, res) => {
    thea2_legoData.addSet(req.body).then(() => {
        res.redirect('/lego/sets');
    }).catch(err => {
        res.status(500).render('500', { message: err.message });
    });
});

// Edit an existing Lego set
app.get('/lego/editSet/:num', ensureLogin, (req, res) => {
    const setNum = req.params.num;
    Promise.all([thea2_legoData.getSetByNum(setNum), thea2_legoData.getAllThemes()])
        .then(([set, themes]) => {
            res.render('editSet', { set: set, themes: themes });
        }).catch(err => {
            res.status(404).render('404', { message: err.message });
        });
});

app.post('/lego/editSet', ensureLogin, (req, res) => {
    const setNum = req.body.set_num;
    thea2_legoData.editSet(setNum, req.body).then(() => {
        res.redirect('/lego/sets');
    }).catch(err => {
        res.status(500).render('500', { message: err.message });
    });
});

// Delete a Lego set
app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
    const setNum = req.params.num;
    thea2_legoData.deleteSet(setNum).then(() => {
        res.redirect('/lego/sets');
    }).catch(err => {
        res.status(500).render('500', { message: err.message });
    });
});

// GET /login
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: undefined, userName: "" });
});


// POST /login
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});


// GET /register
app.get('/register', (req, res) => {
    res.render('register', { errorMessage: undefined, successMessage: undefined, userName: "", email: "" });
});

// POST /register
app.post('/register', (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render('register', { successMessage: "User created", errorMessage: undefined, userName: "", email: "" });
    }).catch((err) => {
        res.render('register', { errorMessage: err, successMessage: undefined, userName: req.body.userName, email: req.body.email });
    });
});

// GET /logout
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

// GET /userHistory
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { user: req.session.user });
});
