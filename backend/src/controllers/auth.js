export class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async loginAsGuest(req, res) {
        try {
            const user = await this.authService.loginAsGuest(req.body);
            res.status(200).json({ message: 'Guest login successful', user });
        } catch (error) {
            console.error('Guest login error:', error);
            if (error.message.includes('required')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}