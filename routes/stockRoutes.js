// routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const connection = require('../config/db');  // ใช้การเชื่อมต่อจาก db.js

// แสดงฟอร์มการรับสินค้าเข้า (GET) และ แสดงรายการสินค้า (POST)
router.get('/in', (req, res) => {
  // คุณสามารถดึงข้อมูลจากฐานข้อมูลและส่งข้อมูลไปยังหน้าจอได้
  const query = 'SELECT * FROM stock';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
      res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
      return;
    }

    // ส่งข้อมูลไปที่หน้าจอ stock_in.ejs
    res.render('stock_in', { stocks: results });
  });
});

// เพิ่มข้อมูลสินค้าเข้า (POST)
router.post('/in', (req, res) => {
  const { product_name, quantity } = req.body;

  const query = 'INSERT INTO stock (product_name, quantity, type) VALUES (?, ?, ?)';

  connection.query(query, [product_name, quantity, 'in'], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err);
      res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      return;
    }
    res.redirect('/stock/in');  // เปลี่ยนเส้นทางกลับไปยังหน้าเดียวกัน
  });
});

// แก้ไขข้อมูล (POST)
router.post('/in/edit/:id', (req, res) => {
  const { id } = req.params;
  const { product_name, quantity } = req.body;

  const query = 'UPDATE stock SET product_name = ?, quantity = ? WHERE id = ?';

  connection.query(query, [product_name, quantity, id], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัพเดตข้อมูล:', err);
      res.status(500).send('เกิดข้อผิดพลาดในการอัพเดตข้อมูล');
      return;
    }
    res.redirect('/stock/in');  // เปลี่ยนเส้นทางกลับไปยังหน้าเดียวกัน
  });
});

// ลบข้อมูล (GET)
router.get('/in/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM stock WHERE id = ?';

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', err);
      res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูล');
      return;
    }
    res.redirect('/stock/in');  // เปลี่ยนเส้นทางกลับไปยังหน้าเดียวกัน
  });
});

// แสดงหน้าเบิกสินค้าออก
router.get('/stock_out', (req, res) => {
  const sqlProducts = 'SELECT p.ProductID, p.ProductName, p.Description, p.Price, p.Stock, c.CategoryName FROM Products p LEFT JOIN Categories c ON p.CategoryID = c.CategoryID';
  const sqlCategories = 'SELECT * FROM Categories';

  connection.query(sqlCategories, (err, categories) => {
    if (err) return res.status(500).send('Error loading categories');

    connection.query(sqlProducts, (err, products) => {
      if (err) return res.status(500).send('Error loading products');

      res.render('stock_out', { products, categories });
    });
  });
});


router.get('/stock_out', (req, res) => {
  const sqlProducts = 'SELECT p.ProductID, p.ProductName, p.Description, p.Price, p.Stock, c.CategoryName FROM Products p LEFT JOIN Categories c ON p.CategoryID = c.CategoryID';
  const sqlCategories = 'SELECT * FROM Categories';

  connection.query(sqlCategories, (err, categories) => {
    if (err) return res.status(500).send('Error loading categories');

    connection.query(sqlProducts, (err, products) => {
      if (err) return res.status(500).send('Error loading products');
      console.log('product', { products, categories })

      res.render('product', { products, categories });
    });
  });
});

//อัพเดตสต็อก
router.post('/updateStock', (req, res) => {
  const items = req.body;
  const customerId = 1;
  const saleDate = new Date();
  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  connection.getConnection((err, connection) => {
    if (err) return res.status(500).json({ success: false, message: 'Connection error' });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ success: false, message: 'Transaction error' });
      }

      const tasks = items.map((item) => {
        return new Promise((resolve, reject) => {
          const sql = 'UPDATE Products SET stock = stock - ? WHERE ProductID = ? AND stock >= ?';
          connection.query(sql, [item.qty, item.productId, item.qty], (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) return reject(new Error('Stock not enough'));
            resolve();
          });
        });
      });

      console.log(tasks)
      Promise.all(tasks)
        .then(() => {
          const insertSale = 'INSERT INTO Sales (CustomerID, SaleDate, TotalAmount, PaymentStatus) VALUES (?, ?, ?, ?)';
          connection.query(insertSale, [customerId, saleDate, totalAmount, 'Paid'], (err, result) => {
            if (err) return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, message: 'Insert Sale failed' });
            });

            const saleId = result.insertId;
            console.log(saleId)
            const details = items.map(i => [saleId, i.productId, i.qty, i.price, i.qty * i.price]);
            const insertDetails = 'INSERT INTO SaleDetails (SaleID, ProductID, Quantity, Price, Total) VALUES ?';
            connection.query(insertDetails, [details], (err) => {
              if (err) return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: 'Insert Details failed' });
              });

              connection.commit((err) => {
                if (err) return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ success: false, message: 'Commit failed' });
                });

                connection.release();
                res.json({ success: true });
              });
            });
          });
        })
        .catch((err) => {
          connection.rollback(() => {
            connection.release();
            res.status(400).json({ success: false, message: err.message });
          });
        });
    });
  });
});

module.exports = router;
