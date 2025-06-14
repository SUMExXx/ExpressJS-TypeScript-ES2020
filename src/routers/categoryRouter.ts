import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import storage from '../utils/storage.js';
import { createCategory, getCategories } from '../controllers/categoryControllers.js';

dotenv.config();

const categoryRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

categoryRouter.get('/get-category', getCategories);

categoryRouter.post('/create-category', storage.single('image'), createCategory);

export default categoryRouter;