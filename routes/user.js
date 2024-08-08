const express = require('express');
const router = express.Router();


const users = {
    'user@example.com': { name: 'John Doe', email: 'user@example.com', address: '123 Main St', pincode: '123456' },
    'tareq@example.com': { name: 'Tareq Ahmed', email: 'tareq@example.com', address: '123 Dundus St', pincode: '023456' }


};


function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/user/login');
    }
}


router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { email } = req.body;
    if (users[email]) {
        req.session.isAuthenticated = true;
        req.session.user = users[email];
        res.redirect('/user/profile');
    } else {
        res.redirect('/user/login');
    }
});


router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});


router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/user/profile');
        }
        res.redirect('/user/login');
    });
});

module.exports = router;
