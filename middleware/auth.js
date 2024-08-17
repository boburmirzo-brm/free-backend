import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      msg: "Access denied.",
      variant: "error",
      payload: null,
    });
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          msg: "Invalid token.",
          variant: "error",
          payload: null,
        });
      }
      if (decoded.isActive) {
        req.admin = decoded;
        next();
      } else {
        return res.status(401).json({
          msg: "Invalid token.",
          variant: "error",
          payload: null,
        });
      }
    });
  } catch (err) {
    res.status(401).json({
      msg: "Invalid token.",
      variant: "error",
      payload: null,
    });
  }
};

export const ownerMiddleware = (req, res, next) => {
  if (req.admin.role !== "owner") {
    return res.status(403).json({
      msg: "Access denied.",
      variant: "error",
      payload: null,
    });
  }
  next();
};
