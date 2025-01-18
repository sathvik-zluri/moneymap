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
    frequency: Joi.number().integer().min(1).optional().messages({
      "number.base": "Frequency must be a number",
      "number.integer": "Frequency must be an integer",
      "number.min": "Frequency must be at least 1",
    }),
    startDate: Joi.date().iso().optional().messages({
      "date.base": "StartDate must be a valid date",
      "date.format": "StartDate must be in ISO 8601 format",
    }),
    endDate: Joi.date().iso().optional().messages({
      "date.base": "EndDate must be a valid date",
      "date.format": "EndDate must be in ISO 8601 format",
    }),
  }).custom((value, helpers) => {
    // Ensure both startDate and endDate are provided together
    if (
      (value.startDate && !value.endDate) ||
      (!value.startDate && value.endDate)
    ) {
      return helpers.error("any.custom", {
        message: "Both startDate and endDate must be provided together",
      });
    }

    // Ensure startDate is before endDate
    if (
      value.startDate &&
      value.endDate &&
      new Date(value.startDate) > new Date(value.endDate)
    ) {
      return helpers.error("any.custom", {
        message: "StartDate must be before or equal to EndDate",
      });
    }

    return value;
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
