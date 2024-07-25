const express = require('express');
const app = express();
const data = require('./data');

app.set('view engine', 'ejs');

app.use(express.static('public')); 


app.get('/', (req, res) => {
  res.render('index');
});


app.get('/users', (req, res) => {
  res.render('users', { users: data.users });
});


app.get('/products', (req, res) => {
  res.render('products', { products: data.products });
});


app.get('/products/high', (req, res) => {
  const highProducts = data.products.filter(product => product.PID > 3);
  res.render('highProducts', { products: highProducts });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
