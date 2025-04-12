const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

async function authenticate(request, reply) {
  const authHeader = request.headers.authorization;
  
  // 1. Check for Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  // 2. Verify token
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach user to request
    request.user = { 
      userId: payload.userId, 
      name: payload.name 
    };

  } catch (err) {
    throw new UnauthenticatedError('Authentication invalid');
  }
}

module.exports = fp(async (fastify) => {
  fastify.decorateRequest('user', null); // 👈 Add `user` to Fastify requests
  fastify.addHook('preHandler', authenticate); // 👈 Run on every route
});
