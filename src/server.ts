import { app } from "./app";
import { connectDB } from "./data/database";
import { terminateIdleConnections } from "./utils/terminateConnections";

app.listen(process.env.PORT, async () => {
  const orm = await connectDB();
  console.log(`Server is working on http://localhost:${process.env.PORT}`);

  // Terminate idle connections every 5 minutes
  setInterval(async () => {
    try {
      await terminateIdleConnections(orm);
    } catch (error: any) {
      console.error("Error during idle connection cleanup:", error.message);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
});
