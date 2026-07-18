const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.use(auth);

// CREATE
router.post("/", async (req, res) => {
   const profile = await prisma.profile.create({
      data: {
         name: req.body.name,
         userId: req.user.id
      }
   });
   
   res.json(profile);
});

// LIST
router.get("/", async (req, res) => {
   const data = await prisma.profile.findMany({
      where: { userId: req.user.id }
   });
   
   res.json(data);
});

module.exports = router;