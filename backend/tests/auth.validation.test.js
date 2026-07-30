import test from 'node:test';
import assert from 'node:assert/strict';
import { signupSchema, loginSchema } from '../validators/userValidator.js';

test('signup schema rejects invalid email addresses', () => {
  const { error } = signupSchema.validate({
    name: 'Jane Doe',
    email: 'nandini',
    password: 'Abcdef1!'
  });

  assert.ok(error);
  assert.match(error.message, /email/i);
});

test('signup schema rejects weak passwords', () => {
  const { error } = signupSchema.validate({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: '12345'
  });

  assert.ok(error);
  assert.match(error.message, /password/i);
});

test('login schema accepts a valid payload', () => {
  const { value, error } = loginSchema.validate({
    email: 'jane@example.com',
    password: 'Abcdef1!'
  });

  assert.equal(error, undefined);
  assert.deepEqual(value, {
    email: 'jane@example.com',
    password: 'Abcdef1!'
  });
});
