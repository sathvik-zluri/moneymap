import express, { Router } from 'express';
import { getTransctions,addTransctions, deleteTransaction, updateTransction, uploadTransactions ,deleteRows } from '../controllers/transactionController';
import { validateTransactionInput } from '../middleware/validateTransactionInput';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { validateFileUpload } from '../middleware/validateFileUpload';

const router:Router = express.Router();

//Fetching transctions with pagination & sorting
router.get('/list',getTransctions);

//Uploading transctions throught csv
router.post('/uploadcsv',uploadMiddleware,validateFileUpload,uploadTransactions);

//Adding transctions with feature finding duplicalcy
router.post("/add", validateTransactionInput, addTransctions);

//Update transctions
router.put("/update/:id",validateTransactionInput,updateTransction);

// Delete Transaction
router.delete("/delete/:id", deleteTransaction);

//Delete data
router.delete("/delete-data", deleteRows);

export default router;