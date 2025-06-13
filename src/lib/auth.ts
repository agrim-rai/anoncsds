import { readFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  [key: string]: unknown;
}

interface JWTVerificationResult {
  [key: string]: unknown;
}

export function isValidEmail(email: string): boolean {
  // Check if email ends with nsut.ac.in
  if (!email.endsWith('@nsut.ac.in')) {
    return false;
  }

  try {
    // Read the accepted emails list
    const acceptedEmailsPath = join(process.cwd(), 'public', 'acceptedEmail.json');
    const acceptedEmailsData = readFileSync(acceptedEmailsPath, 'utf8');
    const { emails } = JSON.parse(acceptedEmailsData);
    
    // Check if email is in the accepted list
    return emails.includes(email);
  } catch (error) {
    console.error('Error reading accepted emails:', error);
    return false;
  }
}

export function generateJWT(payload: JWTPayload): string {
  const secret = process.env.NEXTAUTH_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

export function verifyJWT(token: string): JWTVerificationResult {
  const secret = process.env.NEXTAUTH_SECRET!;
  return jwt.verify(token, secret) as JWTVerificationResult;
}