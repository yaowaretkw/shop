// routes/reportRoutes.js
const express = require('express');
const router = express.Router();

router.get('/pdf', (req, res) => {
  // logic generate PDF
  res.send('PDF report');
});

router.get('/excel', (req, res) => {
  // logic generate Excel
  res.send('Excel report');
});

module.exports = router;
