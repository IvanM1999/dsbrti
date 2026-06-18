const router = require("express").Router();
const auth = require("../middleware/auth");

let profiles = [];

router.get("/", (req, res) => {
   res.json(profiles);
});

router.post("/", auth, (req, res) => {
   const p = { id: Date.now(), ...req.body };
   profiles.push(p);
   res.json(p);
});

router.delete("/:id", auth, (req, res) => {
   profiles = profiles.filter(p => p.id != req.params.id);
   res.json({ ok: true });
});

module.exports = router;