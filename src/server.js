require("rootpath")();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middleware/error-handler");
const path = require("path");
const { connectMongoose } = require("./helpers/db");

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
app.use("/api/accounts", require("./controllers/accounts.controller"));
app.use("/api/profile", require("./controllers/profile.controller"));

// swagger docs route
app.use("/api-docs", require("./helpers/swagger"));

// global error handler
app.use(errorHandler);

app.use(express.static("build"));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// start server
connectMongoose().then(() => {
  const port =
    process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;

  app.listen(port, () => {
    console.log("Server listening on port " + port);
  });
});
