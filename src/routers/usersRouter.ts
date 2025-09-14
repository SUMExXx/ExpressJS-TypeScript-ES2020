import express from 'express';
// import multer from 'multer';
import { captureOrder, dodoCreate, getEmailUser, getUser, logout, verifyJWT, verifyPlan } from '../controllers/usersControllers.js';
import dotenv from 'dotenv';

dotenv.config();

const usersRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

usersRouter.post('/capture-order', express.raw({ type: 'application/json' }), captureOrder);

usersRouter.post('/dodo/create', dodoCreate);

usersRouter.post('/get-email', getEmailUser);

usersRouter.post('/get-user', getUser);

usersRouter.post('/logout', logout);

usersRouter.post('/verify-jwt', verifyJWT);

usersRouter.post('/verify-plan', verifyPlan);

export default usersRouter;