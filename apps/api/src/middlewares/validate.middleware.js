const AppError = require("../lib/AppError.js");

// validate(schema) parses req[source] against a zod schema from validations/*
// and replaces it with the parsed (and coerced/trimmed) value.
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(", ");
    return next(new AppError(message, 422));
  }
  req[source] = result.data;
  return next();
};

module.exports = validate;
