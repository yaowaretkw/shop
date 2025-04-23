// routes/print.js หรือที่คุณใช้เป็น backend
const express = require('express');
const router = express.Router();
const { printer: ThermalPrinter, types: PrinterTypes } = require('node-thermal-printer');

router.post('/print', async (req, res) => {
  const { items, total } = req.body; // รับข้อมูลรายการและยอดรวมมาจาก client

  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://192.168.1.87',
    width: 48,
    characterSet: 'CP874', // สำคัญถ้าพิมพ์ภาษาไทย
    removeSpecialCharacters: false,
    lineCharacter: "-",
  });

  try {
    printer.alignCenter();
    printer.println("ใบเสร็จร้านค้า");
    printer.drawLine();

    items.forEach(item => {
      printer.println(`${item.name} x${item.qty} - ${item.price}฿`);
    });

    printer.drawLine();
    printer.println(`รวมทั้งหมด: ${total} บาท`);
    printer.cut();

    await printer.execute();
    res.json({ success: true, message: "พิมพ์สำเร็จ" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "พิมพ์ไม่สำเร็จ", error: err.message });
  }
});

module.exports = router;
