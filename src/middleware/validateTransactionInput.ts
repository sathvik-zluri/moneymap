import { Request, Response, NextFunction } from "express";
import { specialChars } from "../constants/specialChar";
import Joi from "joi";

// Create a regex that matches any of the special characters
const specialCharsRegex = new RegExp(`[${specialChars.join("")}]`);

export const validateTransactionInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    Date: Joi.date()
      .max("now") // Ensures the date is not greater than today
      .required()
      .messages({
        "date.base": "Date must be a valid date",
        "date.max": "Date cannot be in the future",
        "any.required": "Date is required",
      }),
    Description: Joi.string()
      .trim()
      .required()
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .pattern(specialCharsRegex, { invert: true }) // Ensure no special chars are present
      .messages({
        "string.base": "Description must be a string",
        "string.empty": "Description cannot be empty",
        "string.pattern.invert.base":
          "Invalid 'Description'. Contains special characters.",
        "any.required": "Description is required",
      }),
    Amount: Joi.number()
      .positive()
      .precision(2) // Ensures the number has 2 decimal places
      .max(999999999999999.99) // Limits the amount to 10 digits (including 2 decimals)
      .required()
      .messages({
        "number.base": "Amount must be a number",
        "number.positive": "Amount must be greater than 0",
        "number.precision": "Amount can have a maximum of 2 decimal places",
        "number.max": "Amount cannot exceed 999999999999999.99",
        "any.required": "Amount is required",
      }),
    Currency: Joi.string().trim().required().messages({
      "string.base": "Currency must be a string",
      "string.empty": "Currency cannot be empty",
      "any.required": "Currency is required",
    }),
  });

  //abortEarly: false will return all the validation errors found
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return; // Stop further execution if validation fails
  }

  req.body.Description = value.Description; // This is where the trimmed value is passed down

  next();
};
