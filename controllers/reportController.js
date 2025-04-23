const pdfMake = require('pdfmake');
const pool = require('../config/db');

exports.generateDailyReport = async (req, res) => {
  const conn = await pool.getConnection();
  const result = await conn.query(`
    SELECT type, SUM(total) as total
    FROM transactions
    WHERE DATE(created_at) = CURDATE()
    GROUP BY type
  `);
  conn.release();

  const docDefinition = {
    content: [
      { text: 'Daily Report', style: 'header' },
      ...result.map(r => ({ text: `${r.type}: ${r.total}` }))
    ]
  };

  const PdfPrinter = require('pdfmake');
  const fonts = {
    Roboto: {
      normal: 'node_modules/pdfmake/fonts/Roboto-Regular.ttf',
      bold: 'node_modules/pdfmake/fonts/Roboto-Medium.ttf'
    }
  };

  const printer = new PdfPrinter(fonts);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader('Content-Type', 'application/pdf');
  pdfDoc.pipe(res);
  pdfDoc.end();
};
