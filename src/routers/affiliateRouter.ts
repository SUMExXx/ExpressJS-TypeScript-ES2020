import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import { addRef, checkValidity, getData, signin } from '../controllers/affiliateControllers.js';
// import storage from '../utils/storage.js';

dotenv.config();

const affiliateRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

affiliateRouter.post('/add-ref', addRef)

affiliateRouter.post('/check-validity', checkValidity)

affiliateRouter.post('/get-data', getData)

affiliateRouter.post('/signin', signin)

export default affiliateRouter;