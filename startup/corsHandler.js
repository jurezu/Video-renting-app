const config = require("config");
var cors = require("cors");
module.exports = function(app) {
  //if it is not production enalbe cors
  if (process.env.NODE_ENV !== "production") {
    console.log("CORS enabled");
    app.use(cors());
  }
};
