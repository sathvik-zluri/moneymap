import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const getTransactionsValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot be greater than 100",
    }),
    sort: Joi.string().valid("asc", "desc").default("desc").messages({
      "string.base": "Sort must be a string",
      "any.only": 'Sort must be one of "asc" or "desc"',
    }),
  });

  const { error, value } = schema.validate(req.query, { abortEarly: false });

  if (error) {
    res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  // Assign the validated values to `req.query`
  req.query = value;

  next();
};
