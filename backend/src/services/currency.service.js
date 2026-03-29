const axios = require('axios');

/**
 * currency.service.js — Currency Conversion Service
 * Gets live exchange rates from public API or using config key.
 */
class CurrencyService {
  /**
   * Fetches latest base exchange rate for a given currency code.
   * @param {string} from - Source currency code.
   * @param {string} to - Target currency code.
   * @returns {number} - Exchange rate.
   */
  static async getExchangeRate(from = 'USD', to = 'USD') {
    try {
      if (from === to) return 1.0;

      // API: Free public latest rates for USD
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
      const rates = response.data.rates;

      if (!rates[to]) {
        throw new Error(`Currency ${to} not found in exchange rates for ${from}.`);
      }

      return rates[to];
    } catch (error) {
      console.error('❌ ExchangeRate error:', error.message);
      // Fallback: 1.0 rate
      return 1.0;
    }
  }

  /**
   * Converts a value from one currency to another.
   * @param {number} amount - Amount in source currency.
   * @param {string} from - Source currency code (e.g. INR).
   * @param {string} to - Target base currency (e.g. USD).
   * @returns {Object} - result with rate and converted amount.
   */
  static async convert(amount, from, to = 'USD') {
    const rate = await this.getExchangeRate(from, to);
    const convertedAmount = amount * rate;
    return {
      success: true,
      from,
      to,
      amount,
      rate,
      convertedAmount: parseFloat(convertedAmount.toFixed(2))
    };
  }
}

module.exports = CurrencyService;
