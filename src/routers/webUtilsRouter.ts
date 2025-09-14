import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import { contactFounder } from '../controllers/webUtilsController.js';

dotenv.config();

const webUtilsRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

webUtilsRouter.post('/contact-founder', contactFounder)

export default webUtilsRouter;