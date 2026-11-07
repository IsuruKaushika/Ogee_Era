import jwt from "jsonwebtoken";

// Allows guest checkout: a valid token sets userId, otherwise the order is a guest order.
export const GUEST_ID = "guest";

const optionalAuth = (req, res, next) => {
  const { token } = req.headers;
  req.body.userId = GUEST_ID;
  if (token) {
    try {
      req.body.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
      // Expired or invalid token: continue as guest instead of blocking the sale.
    }
  }
  next();
};

export default optionalAuth;
