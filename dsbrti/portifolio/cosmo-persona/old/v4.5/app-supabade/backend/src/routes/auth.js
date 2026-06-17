const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { generateAccess, generateRefresh } = require("../services/token");

const prisma = new PrismaClient();
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
   const { email, password } = req.body;
   
   const hash = await bcrypt.hash(password, 10);
   
   const user = await prisma.user.create({
      data: { email, password: hash }
   });
   
   res.json(user);
});

// LOGIN
router.post("/login", async (req, res) => {
   const { email, password } = req.body;
   
   const user = await prisma.user.findUnique({ where: { email } });
   
   if (!user) return res.status(400).json({ error: "User not found" });
   
   const valid = await bcrypt.compare(password, user.password);
   
   if (!valid) return res.status(400).json({ error: "Invalid password" });
   
   const access = generateAccess({ id: user.id, role: user.role });
   const refresh = generateRefresh({ id: user.id });
   
   res.json({ access, refresh });
});

module.exports = router;