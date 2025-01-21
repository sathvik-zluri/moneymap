import axios from "axios";

export const convertCurrency = async (
  date: string,
  currency: string,
  amount: number
) => {
  try {
    const response = await axios.get(
      `http://65.2.71.131:3000/api/v1/ratesininr/${date}/${currency}`
    );

    const exchangeRate = response.data.rate;
    const amountInr = exchangeRate * amount;

    return { amountInr };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to convert currency");
  }
};
