const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const CurrencyService = require('../services/currency.service');

// GET /api/currency/convert?from=INR&to=USD&amount=500
router.get('/convert', authenticate, async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, message: 'Missing from, to or amount parameters' });
    }

    const result = await CurrencyService.convert(Number(amount), from, to);
    return res.json(result);
  } catch (error) {
    console.error('❌ Currency conversion route error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
