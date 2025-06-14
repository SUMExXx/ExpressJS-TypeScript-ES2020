import "module-alias/register.js";
import type { NextFunction, Request, Response } from "express";

import express from 'express';
import connectDB from './utils/db.js';
import userRouter from './routers/userRouter.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import categoryRouter from "./routers/categoryRouter.js";
import adminRouter from "./routers/adminRouter.js";
import webUtilsRouter from "./routers/webUtilsRouter.js";


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});

const app = express()

app.use(limiter);

app.use(cors({
  origin: process.env.APP_URL, // your frontend domain
  credentials: true // allow cookies
}));

app.use(express.json());

connectDB();

app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

// app.use((err, req, res, next) => {
//   if (err instanceof RateLimitError) {
//     res.status(429).json({ error: 'Rate limit exceeded' });
//   } else {
//     next();
//   }
// });

app.use((_: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials
  next();
});

const port = process.env.PORT || 8080;

app.use('/user', userRouter);

app.use('/admin', adminRouter);

app.use('/categories', categoryRouter);

app.use('/web-utils', webUtilsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});