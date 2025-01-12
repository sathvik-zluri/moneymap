import { app } from "./app";
import { connectDB } from "./data/database";

//Database connection
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});
