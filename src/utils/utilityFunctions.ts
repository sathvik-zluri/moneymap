import { isValid } from "date-fns";

/**
 * Utility function to parse a date in dd-mm-yyyy format to a Date object.
 */
export const parseDate = (rawDate: string | null): Date | null => {
  if (!rawDate) return null;
  const parsedDate = rawDate.split("-").reverse().join("-");
  const dateObject = new Date(parsedDate);
  return isValid(dateObject) ? dateObject : null;
};

/**
 * Utility function to create a unique key for duplicate detection.
 */
export const createUniqueKey = (date: string, description: string): string => {
  return `${date}-${description}`;
};
