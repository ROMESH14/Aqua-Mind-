function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'EREQUEST') {
    return res.status(400).json({ message: 'Database error', detail: err.message });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
