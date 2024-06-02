import bcrypt from 'bcryptjs';

export class CredentialService {
    // Compare a plain text password with a hashed password
    async comparePassword(password: string, hashPassword: string) {
        try {
            return await bcrypt.compare(password, hashPassword);
        } catch (err) {
            throw new Error('Error comparing passwords');
        }
    }
}
