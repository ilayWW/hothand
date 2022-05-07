const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes.js");
const gamesRoutes = require("./routes/games.route");
const statsRoutes = require("./routes/stats.route");
const app = express();
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 3001;
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
gamesRoutes(app);
statsRoutes(app);
// routes(app);

const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const server = app.listen(port, function () {
  console.log("app running on port.", server.address().port);
});
