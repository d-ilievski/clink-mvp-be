require("rootpath")();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middleware/error-handler");
const path = require("path");
const { connectDB } = require("./helpers/db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// api routes
app.use("/api/accounts", require("./routes/account.route"));
app.use("/api/profile", require("./routes/profile.route"));
app.use("/api/link", require("./routes/link.route"));
app.use("/api/tag", require("./routes/tag.route"));
// TODO Remove
app.use("/api/admin", require("./routes/admin.route"));

// global error handler
app.use(errorHandler);

// serve index.html from /build for production
app.use(express.static("build"));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// start server
connectDB().then(() => {
  const port =
    process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;

  app.listen(port, () => {
    console.log("Server listening on port " + port);
  });
});
