class ApiError extends Error {
  constructor(statusCode, message = "An unexpected error occurred", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = Array.isArray(errors) ? errors : [errors]; 

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
