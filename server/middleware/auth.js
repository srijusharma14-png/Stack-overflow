
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    // Check whether the authorization header exists
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    const token = authorization.split(" ")[1];

    // Check the token
    const decodedata = jwt.verify(token, process.env.JWT_SECRET);

    req.userid = decodedata?.id;

    if (!req.userid) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default auth;
