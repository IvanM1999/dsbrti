const jwt = require("jsonwebtoken");
const SECRET = "SUPER_SECRET_KEY";

module.exports = function(req, res, next) {
   const auth = req.headers.authorization;
   if (!auth) return res.sendStatus(401);
   
   const token = auth.split(" ")[1];
   
   try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
      next();
   } catch {
      res.sendStatus(403);
   }
};