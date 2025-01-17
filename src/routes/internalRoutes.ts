import { Router } from "express";
import { deleteRows } from "../controllers/transactionController";

const router = Router();

//Delete data
router.delete("/delete-data", deleteRows);

export default router;
