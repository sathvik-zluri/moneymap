import { Request, Response, NextFunction } from "express";
import { specialChars } from "../constants/specialChar";
import Joi from "joi";

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
      .required()
      .custom((value, helpers) => {
        const trimmedValue = value.trim().replace(/\s+/g, " "); // Remove unwanted spaces

        // Remove invisible characters
        for (const char of specialChars) {
          if (trimmedValue.includes(char)) {
            return helpers.error("string.pattern.base", {
              message: `Invalid 'Description'. Contains forbidden character: '${char}'`,
            });
          }
        }
        return trimmedValue;
      })
      .messages({
        "string.base": "Description must be a string",
        "string.empty": "Description cannot be empty",
        "string.pattern.base":
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

  req.body = value;

  next();
};
