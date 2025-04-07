/**
 * Custom error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma error handling
  if (err.code) {
    // Handle Prisma-specific errors
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(400).json({
          success: false,
          message: 'A resource with this unique identifier already exists',
          error: err.meta?.target || err.message,
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
          error: err.meta?.cause || err.message,
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Server Error',
          error: err.message,
        });
    }
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
}; 