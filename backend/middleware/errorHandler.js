import logger from '../config/logger.js';
export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`);
  if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Resource not found' });
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message) });
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
};
export const notFound = (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
