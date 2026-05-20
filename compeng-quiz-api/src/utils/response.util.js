const ok         = (res, data = null, message = 'OK', code = 200) =>
  res.status(code).json({ success: true, message, data });
const created    = (res, data, message) => ok(res, data, message, 201);
const badRequest = (res, message) => res.status(400).json({ success: false, error: message });
const unauthorized = (res, message) => res.status(401).json({ success: false, error: message });
const forbidden  = (res, message) => res.status(403).json({ success: false, error: message });
const notFound   = (res, message) => res.status(404).json({ success: false, error: message });
const conflict   = (res, message) => res.status(409).json({ success: false, error: message });
const serverError = (res, message) => res.status(500).json({ success: false, error: message });

module.exports = { ok, created, badRequest, unauthorized, forbidden,
                   notFound, conflict, serverError };
