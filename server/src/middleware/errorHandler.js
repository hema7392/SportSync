function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // Prisma unique constraint violation (code P2002)
  if (err.code === 'P2002') {
    const targets = err.meta?.target ? ` (${err.meta.target.join(', ')})` : '';
    return res.status(409).json({
      message: `A record with this identifier already exists${targets}.`,
    });
  }

  // Prisma record not found (code P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'The requested resource was not found.',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected server error occurred.';

  return res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
