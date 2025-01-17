import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateTransactionId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "any.required": "ID is required",
      "number.base": "ID must be a valid number",
      "number.integer": "ID must be an integer",
      "number.positive": "ID must be a positive number",
    }),
  });
  const { id } = req.params;

  // Validate the 'id' using Joi schema
  const { error } = schema.validate({ id });

  if (error) {
    res.status(400).json({
      message: error.details[0].message,
      error: "Invalid ID",
    });
    return;
  }

  next(); // Proceed to the next middleware or controller if ID is valid
};
