const express = require("express");
require("dotenv").config();
const connectDb = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v2/applicant", require("./routes/applicant.route"));

// Connect DB and start server
const port = process.env.PORT || 8080;
connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
