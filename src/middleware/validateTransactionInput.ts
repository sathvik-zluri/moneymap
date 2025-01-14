// import { Request, Response, NextFunction } from "express";
// import { Transctions } from "../entities/Transctions";
// import { connectDB } from "../data/database";

// export const validateTransactionInput = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { date, Description, Amount, Currency } = req.body;

//   try {
//     // Check for required fields
//     if (!date || !Description || !Amount || !Currency) {
//       res
//         .status(400)
//         .json({
//           message: "date, Description, Amount, and Currency are required",
//         });
//       return;
//     }

//     // Validate field types
//     if (isNaN(Date.parse(date))) {
//       res.status(400).json({ message: "Invalid date format" });
//       return;
//     }

//     if (typeof Description !== "string" || Description.trim() === "") {
//       res
//         .status(400)
//         .json({ message: "Description must be a non-empty string" });
//       return;
//     }

//     if (typeof Amount !== "number" || Amount <= 0 || !Number.isFinite(Amount)) {
//       res.status(400).json({ message: "Amount must be a positive number" });
//       return;
//     }

//     if (typeof Currency !== "string" || Currency.trim() === "") {
//       res.status(400).json({ message: "Currency must be a non-empty string" });
//       return;
//     }

//     // Initialize the database connection
//     const orm = await connectDB();

//     // Check if the ORM connection was successful
//     if (!orm) {
//       res.status(500).json({ message: "Database connection failed" });
//       return;
//     }

//     const em = orm.em.fork(); // Get the entity manager from the connected ORM

//     // Check for duplicate transactions (date and description match)
//     const existingTransaction = await em.findOne(Transctions, {
//       Date: new Date(date),
//       Description,
//       isDeleted: false, // Ensure we don't count soft-deleted records
//     });

//     if (existingTransaction) {
//       res
//         .status(409)
//         .json({
//           message:
//             "A transaction with the same date and description already exists",
//         });
//       return;
//     }

//     next(); // Validation passed, proceed to the next middleware or controller
//   } catch (error) {
//     console.error("Validation error:", error);
//     res.status(500).json({ message: "Server error during validation", error });
//     return;
//   }
// };

import { Request, Response, NextFunction } from "express";
import { Transctions } from "../entities/Transctions";
import { connectDB } from "../data/database";

// Utility function for field validation
const validateField = (
  field: any,
  type: string,
  required: boolean,
  minValue?: number
) => {
  if (required && (field === undefined || field === null))
    return "This field is required";
  if (type === "string" && (typeof field !== "string" || field.trim() === ""))
    return "Must be a non-empty string";
  if (type === "number" && (typeof field !== "number" || field <= (minValue || 0) || !Number.isFinite(field)))
    return "Must be a valid positive number";
  if (type === "date" && isNaN(Date.parse(field)))
    return "Invalid date format";
  return null;
};

export const validateTransactionInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { Date: rawDate, Description, Amount, Currency } = req.body;

  // Validate required fields with respective types
  const validationErrors = [
    { field: rawDate, type: "date", required: true },
    { field: Description, type: "string", required: true },
    { field: Amount, type: "number", required: true, minValue: 0 },
    { field: Currency, type: "string", required: true },
  ].map(({ field, type, required, minValue }) =>
    validateField(field, type, required, minValue)
  ).filter(Boolean);

  if (validationErrors.length > 0) {
     res.status(400).json({ message: validationErrors.join(", ") });
     return;
  }

  try {
    // Initialize the database connection
    const orm = await connectDB();

    if (!orm) {
       res.status(500).json({ message: "Database connection failed" });
       return;
    }

    const em = orm.em.fork(); // Get the entity manager from the connected ORM

    // Check for duplicate transactions (date and description match)
    const existingTransaction = await em.findOne(Transctions, {
      Date: new Date(rawDate),
      Description,
      isDeleted: false, // Ensure we don't count soft-deleted records
    });

    if (existingTransaction) {
       res.status(409).json({
        message: "A transaction with the same date and description already exists",
      });
      return;
    }

    next(); // Validation passed, proceed to the next middleware or controller
  } catch (error) {
    console.error("Validation error:", error);
     res.status(500).json({ message: "Server error during validation", error });
     return;
  }
};
