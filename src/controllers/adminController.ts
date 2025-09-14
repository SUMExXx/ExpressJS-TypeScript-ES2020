import { SignJWT } from 'jose';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import Admin from '../models/admin.js';
import Affiliate from '../models/affiliate.js';
import { addDays, subMonths, format, endOfMonth, startOfMonth } from "date-fns";
import Visit from '../models/visit.js';
import ModelVisit from '../models/modelVisit.js';
import User from '../models/user.js';

dotenv.config();

export const affiliateCreate = async (req: Request, res: Response): Promise<void> => {
    
    try {

        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        const newAffiliate = new Affiliate({
            username,
            password
        });

        await newAffiliate.save();

        res.json({ message: 'Affiliate created successfully', affiliate: newAffiliate });
        return;
    } catch (error) {
        console.error('Error creating affiliate:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}



export const affiliateList = async (req: Request, res: Response): Promise<void> => {
    void req; // To avoid unused variable warning

    try {

        // const { searchParams } = new URL(req.url);
        // const email = searchParams.get('email');
        // const token = searchParams.get('token');

        // if (!email || !token) {
        //   return NextResponse.json({ error: 'Invalid or missing parameters' }, { status: 400 });
        // }

        // Find the user in unverified users collection
        const affiliates = await Affiliate.find({});

        if (!affiliates) {
            res.status(400).json({ error: 'Invalid' });
            return;
        }

        res.status(200).json(affiliates);
        return;
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
};


export const signin = async (req: Request, res: Response): Promise<void> => {

    const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

    try {
        const { email, password } = await req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            res.status(401).json({ error: 'Invalid admin credentials' });
            return;
        }

        // Compare passwords
        // const isMatch = await bcrypt.compare(password, admin.password);
        const isMatch = password == admin.password
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid admin credentials' });
            return;
        }

        // Generate JWT token using `jose`
        const token = await new SignJWT({ adminId: (admin._id as { toString: () => string }).toString(), email: admin.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(`${process.env.JWT_EXPIRATION}s`)
            .sign(JWT_SECRET_KEY);

        // res.cookie('admin_token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production", // only over HTTPS in production
        //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        //     maxAge: parseInt(process.env.JWT_EXPIRATION || '3600') * 1000, // convert to ms if in seconds
        // });

        res.status(200).json({ message: 'Admin login successful', adminToken: token });

        return;

    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
};



export const statsLast3Month = async (req: Request, res: Response): Promise<void> => {

    void req; // To avoid unused variable warning

    try {
        // Define the date range (exactly 3 months ago from today)
        const endDate = new Date(); // Today
        const startDate = subMonths(endDate, 3); // 3 months ago

        // Aggregate visits data by date
        const results = await Visit.aggregate([
            {
                $match: {
                    page: "/",
                    visitTime: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$visitTime" },
                        month: { $month: "$visitTime" },
                        day: { $dayOfMonth: "$visitTime" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);

        // Generate a list of all dates within the last 3 months
        const chartData: { date: string; visits: number }[] = [];
        let currentDate = startDate;

        while (currentDate <= endDate) {
            chartData.push({ date: format(currentDate, "yyyy-MM-dd"), visits: 0 });
            currentDate = addDays(currentDate, 1);
        }

        // Fill in available data
        results.forEach(({ _id, count }) => {
            const date = format(new Date(_id.year, _id.month - 1, _id.day), "yyyy-MM-dd");
            const index = chartData.findIndex((item) => item.date === date);
            if (index !== -1) chartData[index].visits = count;
        });

        // Calculate percentage increase/decrease based on the last day vs previous day
        const lastIndex = chartData.length - 1;
        const prevIndex = lastIndex - 1;

        const currentDayVisits = chartData[lastIndex]?.visits || 0;
        const previousDayVisits = chartData[prevIndex]?.visits || 0;

        let trending = 0;
        let up = false;

        if (previousDayVisits > 0) {
            trending = ((currentDayVisits - previousDayVisits) / previousDayVisits) * 100;
            up = trending > 0;
        }

        res.json({
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            chartData,
            trending: parseFloat(trending.toFixed(2)), // Limit to 2 decimal places
            up,
        });
        return;
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};



const MODELS = [
    'cap',
    'tshirt',
    'tshirtAnimated',
    'oversizedTshirt',
    'beanie',
    'pantAnimated',
    'hangingHoodie'
];

export const statsMostVisitedModels = async (req: Request, res: Response): Promise<void> => {
    void req; // To avoid unused variable warning

    try {

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const rawData = await ModelVisit.aggregate([
            {
                $match: {
                    visitTime: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: '$objectModel',
                    visitors: { $sum: 1 }
                }
            }
        ]);

        const countMap: Record<string, number> = {};
        rawData.forEach(({ _id, visitors }) => {
            countMap[_id] = visitors;
        });

        const chartData = MODELS.map((model) => ({
            model,
            visitors: countMap[model] || 0,
            fill: 'var(--color-foreground)'
        }));

        res.json(chartData);
        return;
    } catch (err) {
        console.error('Error in visit-summary:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
};



export const statsVisits6month = async (req: Request, res: Response): Promise<void> => {

    void req; // To avoid unused variable warning

    try {
        // Define the date range (last 6 months)
        const endDate = endOfMonth(new Date());
        const startDate = startOfMonth(subMonths(endDate, 5));

        // Aggregate visits data by month
        const results = await Visit.aggregate([
            {
                $match: {
                    page: "/",
                    visitTime: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $month: "$visitTime" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Month mapping
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];

        // Generate an empty structure with visits: 0
        const chartData = Array.from({ length: 6 }, (_, i) => {
            const monthIndex = (startDate.getMonth() + i) % 12;
            return { month: monthNames[monthIndex], visits: 0 };
        });

        // Fill in available data
        results.forEach(({ _id, count }) => {
            const index = chartData.findIndex((item) => item.month === monthNames[_id - 1]);
            if (index !== -1) chartData[index].visits = count;
        });

        // Calculate percentage increase/decrease
        const currentMonthVisits = chartData[5]?.visits || 0;
        const previousMonthVisits = chartData[4]?.visits || 0;

        let trending = 0;
        let up = false;

        if (previousMonthVisits > 0) {
            trending = ((currentMonthVisits - previousMonthVisits) / previousMonthVisits) * 100;
            up = trending > 0;
        }

        res.json({
            startMonth: startDate.getMonth() + 1,
            endMonth: endDate.getMonth() + 1,
            chartData,
            trending: parseFloat(trending.toFixed(2)), // Limit to 2 decimal places
            up,
        });
        return;
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};



export const usersList = async (req: Request, res: Response): Promise<void> => {

    void req; // To avoid unused variable warning

    try {

        // const { searchParams } = new URL(req.url);
        // const email = searchParams.get('email');
        // const token = searchParams.get('token');

        // if (!email || !token) {
        //   return NextResponse.json({ error: 'Invalid or missing parameters' }, { status: 400 });
        // }

        // Find the user in unverified users collection
        const users = await User.find({});

        if (!users) {
            res.status(400).json({ error: 'Invalid' });
            return;
        }

        res.json(users);
        return;
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
};