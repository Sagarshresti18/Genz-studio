import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';

const authService = new AuthService();

export class AuthController {
  login(req: Request, res: Response): void {
    const authResult = authService.createToken(req.body);
    res.status(200).json(authResult);
  }

  signup(req: Request, res: Response): void {
    const authResult = authService.createToken(req.body);
    res.status(201).json(authResult);
  }

  forgotPassword(_req: Request, res: Response): void {
    res.status(200).json({ message: 'Password reset email flow delegated to Firebase Auth.' });
  }

  verifyEmail(_req: Request, res: Response): void {
    res.status(200).json({ message: 'Email verification flow delegated to Firebase Auth.' });
  }
}
