const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const login = async (email, password) => {
  console.log('[AUTH] Login attempt for email and password and password:', email, password);

  const user = await User.scope('withPassword').findOne({ where: { email } });

  console.log('[AUTH] User found:', !!user);
  if (user) {
    console.log('[AUTH] User id:', user.id);
    console.log('[AUTH] User role:', user.role);
    console.log('[AUTH] Password field present:', !!user.password);
    console.log('[AUTH] Password field value (first 10 chars):', user.password ? user.password.substring(0, 10) : 'null/undefined');
  }

  if (!user) {
    console.log('[AUTH] Failing: user not found in DB');
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  console.log('[AUTH] bcrypt.compare result:', isMatch);

  if (!isMatch) {
    console.log('[AUTH] Failing: password does not match hash');
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
};

module.exports = { login };
