import express from 'express';
import { AuthService } from '../services/auth.js';
import { AuthController } from '../controllers/auth.js';

const createAuthRoutes = (studentRepo, teacherRepo) => {
    const router = express.Router();
    const authService = new AuthService(studentRepo, teacherRepo);
    const authController = new AuthController(authService);
    
    router.post('/guest-login', (req, res) => authController.loginAsGuest(req, res));
    
    return router;
};

export default createAuthRoutes;