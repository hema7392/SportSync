// Centralized Error Handling Middleware for CampusFix

const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Handle Prisma unique constraint violations (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target || 'field';
    return res.status(409).json({
      message: `A record with this ${Array.isArray(fields) ? fields.join(', ') : fields} already exists.`,
      field: fields,
    });
  }

  // Handle Prisma foreign key constraint violations (P2003)
  if (err.code === 'P2003') {
    return res.status(400).json({
      message: 'Referenced entity cannot be deleted or does not exist.',
      detail: isProduction ? undefined : err.meta,
    });
  }

  // Handle Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'The requested resource was not found.',
    });
  }

  // Handle Bad JSON syntax in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload provided.' });
  }

  // Status code resolution
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // In test/dev, log to console
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} - ${err.message}`);
    if (!isProduction && err.stack) {
      console.error(err.stack);
    }
  }

  return res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
