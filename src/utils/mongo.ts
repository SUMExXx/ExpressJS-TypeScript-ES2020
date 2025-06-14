import dotenv from 'dotenv';

dotenv.config();

const mongo = {
    url: process.env.MONGODB_URL
}

export default mongo; 