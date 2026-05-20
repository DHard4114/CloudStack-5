function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.stack || err.message);
  if (err.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ success: false, error: 'Data sudah ada.' });
  if (err.code === 'ER_SIGNAL_EXCEPTION')
    return res.status(400).json({ success: false, error: err.sqlMessage });
  return res.status(500).json({ success: false, error: 'Kesalahan internal server.' });
}
module.exports = errorHandler;
