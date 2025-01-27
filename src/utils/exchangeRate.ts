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
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors specifically
      const statusCode = error.response?.status;
      const errorMessage =
        error.response?.data?.error || "Currency conversion failed";
      console.error(`AxiosError: ${errorMessage} (status: ${statusCode})`);
      // Throw a structured error with the status code and message
      const errorMsg = new Error(errorMessage);
      errorMsg.name = "AxiosErrorCurrency";
      throw errorMsg;
    } else {
      // Handle non-Axios errors (unlikely here but included for safety)
      console.error("Unexpected error:", error);
      throw new Error("Unexpected error occurred during currency conversion");
    }
  }
};
