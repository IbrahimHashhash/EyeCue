import express from 'express';
import http from 'http';
import { init } from './socket/index.js';
import studentRoutes from './routes/student.js';
import cors from 'cors';
import { PORT , FE_ORIGIN } from './config/env.js'

const app = express();
const server = http.createServer(app);

init(server);

app.use(cors({
    origin: FE_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Capture-Timestamp']
}));

app.use('/student', studentRoutes);

server.listen(PORT, () => {  
    console.log(`Server running on PORT: ${PORT}`);
});