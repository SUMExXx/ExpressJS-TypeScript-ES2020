import "module-alias/register.js";
import type { NextFunction, Request, Response } from "express";
import express from 'express';
import connectDB from './utils/db.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import adminRouter from "./routers/adminRouter.js";
import webUtilsRouter from "./routers/webUtilsRouter.js";
import authRouter from "./routers/authRouter.js";
import affiliateRouter from "./routers/affiliateRouter.js";
import statsRouter from "./routers/statsRouter.js";
import usersRouter from "./routers/usersRouter.js";
import { captureOrder } from "./controllers/usersControllers.js";
import cookieParser from "cookie-parser";


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});

const app = express() 

app.use(cookieParser());

app.set('trust proxy', 1);

app.post('/capture-order', express.raw({ type: '*/*' }), captureOrder);

app.use(limiter);

// app.use(cors({
//   origin: process.env.APP_URL, // your frontend domain
//   credentials: true // allow cookies
// }));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use((_: Request, res: Response, next: NextFunction): void => {
  // res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials
  next();
});

app.use(express.json());

connectDB();

app.use(express.urlencoded({ extended: true }));

// app.use((err, req, res, next) => {
//   if (err instanceof RateLimitError) {
//     res.status(429).json({ error: 'Rate limit exceeded' });
//   } else {
//     next();
//   }
// });

const port = process.env.PORT || 8080;

app.get("/", (_, res) => {
  res.send("API is running...");
});

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

// app.get("/health", (_, res) => {
//   res.status(200).send("OK");
// });

app.use('/users', usersRouter);

app.use('/admin', adminRouter);

app.use('/auth', authRouter);

app.use('/stats', statsRouter);

app.use('/affiliate', affiliateRouter);

app.use('/web-utils', webUtilsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});