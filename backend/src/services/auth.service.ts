import * as userModel from '../models/user.model';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export const registerUser = async (payload: { fullName?: string; email: string; password: string }) => {
  const { fullName, email, password } = payload;

  // Basic validation (controller should also validate inputs)
  if (!email || !password) throw new Error('INVALID_INPUT');

  const existing = await userModel.findByEmail(email.toLowerCase());
  if (existing) throw new Error('EMAIL_ALREADY_REGISTERED');

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = crypto.randomUUID();

  const user = await userModel.createUser({
    id,
    full_name: fullName || null,
    email: email.toLowerCase(),
    password_hash,
    role: 'customer',
  });

  return user;
};

export const authenticateUser = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;
  const user = await userModel.findByEmail(email.toLowerCase());
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('INVALID_CREDENTIALS');

  return user;
};
