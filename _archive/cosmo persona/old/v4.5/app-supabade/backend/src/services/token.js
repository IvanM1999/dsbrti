const jwt = require("jsonwebtoken");

exports.generateAccess = (user) => {
   return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });
};

exports.generateRefresh = (user) => {
   return jwt.sign(user, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};