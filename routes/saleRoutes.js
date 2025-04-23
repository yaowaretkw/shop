const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // สมมติว่าดึงข้อมูลจากฐานข้อมูล
  const products = [
    { ProductID: 1, ProductName: 'สินค้า A', Price: 100 },
    { ProductID: 2, ProductName: 'สินค้า B', Price: 150 },
    { ProductID: 3, ProductName: 'สินค้า C', Price: 200 },
  ];
  res.render('sale', { products });
});

router.post('/preview', (req, res) => {
  const selectedIds = req.body.items || [];
  const items = selectedIds.map(id => ({
    id,
    name: req.body['name_' + id],
    price: parseFloat(req.body['price_' + id]),
    qty: parseInt(req.body['qty_' + id])
  }));
  const total = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  res.render('sale_preview', { items, total });
});

module.exports = router;
