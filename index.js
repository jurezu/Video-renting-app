const winston = require("winston");
const express = require("express");
const config = require("config");
var cors = require("cors");
const app = express();
//for development
app.use(cors());

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);
require("./startup/corsHandler")(app);

const port = process.env.PORT || config.get("port") || 3000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);
module.exports = server;
