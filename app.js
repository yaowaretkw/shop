const express = require('express');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const connection = require('./config/db'); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.set('view engine', 'ejs');  

app.use(expressLayouts);  
app.set('layout', 'layout');  

const stockRoute = require('./routes/stockRoutes');
app.use('/stock', stockRoute);

const reportRoutes = require('./routes/reportRoutes');
app.use('/report', reportRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/product', productRoutes);

const saleRoute = require('./routes/saleRoutes');
app.use('/sale', saleRoute);

app.get('/', (req, res) => {
    res.render('index');  
});

const printRoute = require('./routes/print');
app.use('/api', printRoute);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
