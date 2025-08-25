import express from 'express';
import http from 'http';
import cors from 'cors';
import { init } from './socket/index.js';
import studentRoutes from './routes/student.js';
import { PORT, FE_ORIGINS } from './config/env.js';

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: FE_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Capture-Timestamp',
        'X-Student-ID'
    ]
}));

app.use('/student', studentRoutes);

init(server);

server.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
