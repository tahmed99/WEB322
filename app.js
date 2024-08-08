const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');

dotenv.config();

const app = express();


app.use(helmet()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));


app.set('view engine', 'ejs');


app.use('/user', userRoutes);


app.get('/', (req, res) => {
    res.redirect('/user/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
