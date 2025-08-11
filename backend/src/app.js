import dotenv from 'dotenv';
import express from 'express'; 
import http from 'http';       
import { init }from './socket/index.js'; 
import studentRoutes from './routes/student.js'; 

dotenv.config();  

const app = express(); 
const server = http.createServer(app); 

init(server);   

app.use('/student', studentRoutes); 

const PORT = 3000; 

server.listen(PORT, () => {  
    console.log(`Server running on PORT: ${PORT}`);
});