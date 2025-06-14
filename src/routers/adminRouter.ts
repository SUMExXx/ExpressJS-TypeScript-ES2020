import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import { adminLogin, adminRegister, adminTokenVerify } from '../controllers/adminController.js';
import storage from '../utils/storage.js';

dotenv.config();

const adminRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

adminRouter.post('/register', storage.single('image'), adminRegister)

adminRouter.post('/login', adminLogin)

adminRouter.post('/verify-admin-token', adminTokenVerify);

export default adminRouter;