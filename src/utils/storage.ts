import multer from 'multer';

const storage =  multer({ storage: multer.memoryStorage() });

export default storage;