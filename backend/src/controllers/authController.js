import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signupSchema, loginSchema } from '../validators/userValidator.js';
import { signToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const signup = async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendError(res, 400, 'Validation failed', error.details.map((detail) => detail.message));
    }

    const { name, email, password } = value;
    if (await User.findOne({ email })) {
      return sendError(res, 400, 'Email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken({ id: user._id, name: user.name, email: user.email });

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendError(res, 400, 'Validation failed', error.details.map((detail) => detail.message));
    }

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendError(res, 400, 'Invalid credentials');
    }

    const token = signToken({ id: user._id, name: user.name, email: user.email });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
