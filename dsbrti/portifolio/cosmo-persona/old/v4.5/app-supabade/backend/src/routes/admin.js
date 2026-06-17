const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.use(auth);

// CHECK ADMIN
router.use((req, res, next) => {
   if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
   }
   next();
});

// VER TUDO
router.get("/logs", async (req, res) => {
   const logs = await prisma.log.findMany({
      orderBy: { createdAt: "desc" }
   });
   
   res.json(logs);
});

module.exports = router;