import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import { affiliateCreate, affiliateList, signin, statsLast3Month, statsMostVisitedModels, statsVisits6month, usersList } from '../controllers/adminController.js';
// import storage from '../utils/storage.js';

dotenv.config();

const adminRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

adminRouter.post('/affiliate/create', affiliateCreate)

adminRouter.get('/affiliate/list', affiliateList)

adminRouter.post('/signin', signin)

adminRouter.get('/stats/last3month', statsLast3Month)

adminRouter.get('/stats/most-visited-models', statsMostVisitedModels)

adminRouter.get('/stats/visits6month', statsVisits6month);

adminRouter.get('/users/list', usersList)

export default adminRouter;