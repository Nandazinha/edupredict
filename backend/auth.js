import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign({ id: user.id }, "SEGREDO_TCC", { expiresIn: "1h" });
}

export function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, "SEGREDO_TCC", (err) => {
    if (err) return res.sendStatus(403);
    next();
  });
}
