const crypto = require('crypto');
function generateSecurePin() {
  return String(crypto.randomInt(100000, 999999));
}
module.exports = { generateSecurePin };
