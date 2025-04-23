const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// แสดงฟอร์ม + รายการสินค้า
router.get('/', (req, res) => {
  const sqlProducts = 'SELECT p.ProductID, p.ProductName, p.Description, p.Price, p.Stock, c.CategoryName FROM Products p LEFT JOIN Categories c ON p.CategoryID = c.CategoryID';
  const sqlCategories = 'SELECT * FROM Categories';

  connection.query(sqlCategories, (err, categories) => {
    if (err) return res.status(500).send('Error loading categories');

    connection.query(sqlProducts, (err, products) => {
      if (err) return res.status(500).send('Error loading products');
      res.render('product', { products, categories });
    });
  });
});


// เพิ่มสินค้า
router.post('/add', (req, res) => {
  const { ProductName, Description, Price, Stock, CategoryID } = req.body; // เพิ่ม CategoryID
  const sql = 'INSERT INTO Products (ProductName, Description, Price, Stock, CategoryID, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
  connection.query(sql, [ProductName, Description, Price, Stock, CategoryID], err => { // เพิ่ม CategoryID ลงใน query
    if (err) return res.status(500).send('Error adding product');
    res.redirect('/product');
  });
});

// ลบสินค้า
router.get('/delete/:id', (req, res) => {
  connection.query('DELETE FROM Products WHERE ProductID = ?', [req.params.id], err => {
    if (err) return res.status(500).send('Error deleting');
    res.redirect('/product');
  });
});

router.post('/update', (req, res) => {
  console.log('xx', req.body)
  const { ProductID, ProductName, Description, Price, Stock, CategoryID } = req.body;
  
  // แก้ไขคำสั่ง SQL ให้ถูกต้อง
  const sql = 'UPDATE Products SET ProductName = ?, Description = ?, Price = ?, Stock = ?, CategoryID = ?, UpdatedAt = NOW() WHERE ProductID = ?';
  
  // ปรับลำดับค่าที่จะส่งใน query
  connection.query(sql, [ProductName, Description, Price, Stock, CategoryID, ProductID], (err) => {
    if (err) return res.status(500).send('Error updating');
    res.redirect('/product');
  });
});


router.post('/category/add', (req, res) => {
  const { CategoryName } = req.body;
  const sql = 'INSERT INTO categories (categoryName) VALUES (?)';
  connection.query(sql, [CategoryName], err => {
    if (err) return res.status(500).send('เพิ่มหมวดหมู่ล้มเหลว');
    res.redirect('/product?created=1');
  });
});



module.exports = router;
