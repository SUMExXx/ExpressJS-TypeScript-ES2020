import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import { forgotPass, forgotPassReset, forgotPassVerify, signin, signup, verify } from '../controllers/authControllers.js';
// import storage from '../utils/storage.js';

dotenv.config();

const authRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

authRouter.post('/forgot-pass', forgotPass)

authRouter.post('/forgot-pass-reset', forgotPassReset)

authRouter.post('/forgot-pass-verify', forgotPassVerify)

authRouter.post('/signin', signin)

authRouter.post('/signup', signup)

authRouter.get('/verify', verify)

export default authRouter;