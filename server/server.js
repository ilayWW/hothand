const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes.js");
const gamesRoutes = require("./routes/games.route");
const statsRoutes = require("./routes/stats.route");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
gamesRoutes(app);
statsRoutes(app);
routes(app);

const server = app.listen(3001, function () {
  console.log("app running on port.", server.address().port);
});
