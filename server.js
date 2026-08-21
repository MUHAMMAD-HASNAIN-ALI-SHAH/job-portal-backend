const express = require("express");
require("dotenv").config();
const connectDb = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v2/company", require("./routes/company.route"));
app.use("/api/v3/applicant", require("./routes/applicant.route"));
app.use("/api/v4/job", require("./routes/job.route"));
app.use("/api/v6/application", require("./routes/application.route"));

// Connect DB and start server
const port = process.env.PORT || 8080;
connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
