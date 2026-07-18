const router = require("express").Router();
const jwt = require("jsonwebtoken");

const SECRET = "SUPER_SECRET_KEY";
const users = [{ id: 1, user: "admin", pass: "1234" }];

router.post("/login", (req, res) => {
   const { user, pass } = req.body;
   
   const found = users.find(u => u.user === user && u.pass === pass);
   if (!found) return res.status(401).json({ error: "Invalid login" });
   
   const accessToken = jwt.sign({ id: found.id }, SECRET, { expiresIn: "15m" });
   const refreshToken = jwt.sign({ id: found.id }, SECRET, { expiresIn: "7d" });
   
   res.json({ accessToken, refreshToken });
});

module.exports = router;