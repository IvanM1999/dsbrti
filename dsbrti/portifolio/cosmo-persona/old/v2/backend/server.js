const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/profiles", require("./routes/profiles"));

app.listen(3000, () => console.log("Server rodando"));