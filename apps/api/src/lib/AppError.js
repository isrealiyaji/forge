// Services throw this for expected failures (bad credentials, not found, conflict);
// the error handler middleware maps it straight to an HTTP response.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
