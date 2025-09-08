export class AuthService {
    constructor(studentRepo, teacherRepo) {
        this.studentRepo = studentRepo;
        this.teacherRepo = teacherRepo;
    }

    async loginAsGuest(userData) {
        const { name, role } = userData;
        
        if (!name || !role) {
            throw new Error('Name and role are required');
        }

        const repo = role === 'teacher' ? this.teacherRepo : this.studentRepo;
        
        let user = await repo.getByName(name);
        
        if (user) {
            user.role = role;
            return user;
        } else {
            const newUser = await repo.create({ 
                name, 
                email: `${name.toLowerCase().replace(/\s+/g, '.')}@guest.local` 
            });
            newUser.role = role;
            return newUser;
        }
    }
}