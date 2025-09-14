import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import ModelVisit from '../models/modelVisit.js';
import Visit from '../models/visit.js';

dotenv.config();

export const getIP = async (req: Request, res: Response): Promise<void> => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = typeof forwardedFor === 'string'
    ? forwardedFor.split(",")[0].trim()
    : Array.isArray(forwardedFor) && forwardedFor.length > 0
      ? forwardedFor[0].split(",")[0].trim()
      : req.socket.remoteAddress || "Unknown IP";

  res.json({ ip });
  return;
};



export const modelVisit = async (req: Request, res: Response): Promise<void> => {
  try {

    const { objectModel, ipAddress } = await req.body;

    if (!objectModel || !ipAddress) {
      res.status(400).json({ error: 'Page and IP Address are required' });
      return;
    }

    const newVisit = await ModelVisit.create({
      visitTime: new Date(),
      objectModel,
      ipAddress
    });

    res.status(201).json({ success: true, data: newVisit });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
    return;
  }
};



export const visit = async (req: Request, res: Response): Promise<void> => {
  try {

    const { page, referrer, ipAddress } = await req.body;

    if (!page || !ipAddress) {
      res.status(400).json({ error: 'Page and IP Address are required' });
      return;
    }

    const newVisit = await Visit.create({
      visitTime: new Date(),
      page,
      referrer,
      ipAddress
    });

    res.status(201).json({ success: true, data: newVisit });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
    return;
  }
};