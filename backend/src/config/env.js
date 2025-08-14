import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PORT) {
    throw new Error('PORT not defined in environment variables!');
}

if (!process.env.FASTAPI_URL){
    throw new Error('FASTAPI_URL not defined in environment variables!');
}

if (!process.env.FE_ORIGIN){
    throw new Error('FE_ORIGIN not defined in environment variables!');
}

export const PORT = process.env.PORT;
export const FASTAPI_URL = process.env.FASTAPI_URL;
export const FE_ORIGIN = process.env.FE_ORIGIN;