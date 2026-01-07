import type { MiddlewareHandler } from "hono";
import { verifyToken } from "./auth";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyToken(token);
    c.set('user', payload); // Store payload in context for later use
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
