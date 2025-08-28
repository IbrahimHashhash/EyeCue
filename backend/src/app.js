import express from 'express';
import http from 'http';
import cors from 'cors';
import { init } from './socket/index.js';
import studentRoutes from './routes/student.js';
import { initTF } from './services/check-similarity/tf-init.js';
import { PORT, FE_ORIGIN } from './config/env.js';
import scoreRoutes from './routes/score.js';
import { initializeDbConnection } from './services/db.js'; 

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: FE_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Capture-Timestamp',
        'X-Student-ID'
    ]
}));

app.use('/api/score', scoreRoutes);
app.use('/api/student', studentRoutes);

await initTF();
init(server);

(async () => {
    try {
        await initializeDbConnection();
        server.listen(PORT, () => {
            console.log(`Server running on PORT: ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect DB, cannot start server:", err);
        process.exit(1);
    }
})();
