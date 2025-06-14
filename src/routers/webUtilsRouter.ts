import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import { contactEmail, requestQuote } from '../controllers/webUtilsController.js';

dotenv.config();

const webUtilsRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

webUtilsRouter.post('/contact-email', contactEmail)

webUtilsRouter.post('/request-quote', requestQuote)

export default webUtilsRouter;