import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import { getIP, modelVisit, visit } from '../controllers/statsControllers.js';
// import storage from '../utils/storage.js';

dotenv.config();

const statsRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

statsRouter.get('/get-ip', getIP)

statsRouter.post('/model-visit', modelVisit)

statsRouter.post('/visit', visit)

export default statsRouter;