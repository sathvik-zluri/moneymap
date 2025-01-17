import { app } from "./app";
import { connectDB } from "./data/database";

app.listen(process.env.PORT, async () => {
  const orm = await connectDB();
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});
