function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'EREQUEST') {
    return res.status(400).json({ message: 'Database error', detail: err.message });
  }

  if (err.name === 'AggregateError' && err.errors?.length) {
    const first = err.errors[0];
    if (first.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'Cannot connect to MySQL. Start MySQL in XAMPP/phpMyAdmin, then restart the backend.',
      });
    }
    return res.status(503).json({
      message: first.message || 'Database connection failed',
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      message: err.message || 'Cannot connect to MySQL. Start MySQL in XAMPP/phpMyAdmin, then restart the backend.',
    });
  }

  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      message: 'MySQL login failed. Check DB_USER and DB_PASSWORD in backend/.env.',
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
