const express = require("express");
const bodyParser = require("body-parser");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const cors = require("cors");
const path = require("path");
const gamesRoutes = require("./routes/games.route");
const statsRoutes = require("./routes/stats.route");

const app = express();

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

  app.use(cors());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  gamesRoutes(app);
  statsRoutes(app);

  // All remaining requests return the React app, so it can handle routing.
  app.get("*", function (request, response) {
    response.sendFile(
      path.resolve(__dirname, "../react-ui/build", "index.html")
    );
  });

  app.listen(PORT, function () {
    console.error(
      `Node ${
        isDev ? "dev server" : "cluster worker " + process.pid
      }: listening on port ${PORT}`
    );
  });
}

// // routes(app);

// const publicPath = path.join(__dirname, "..", "public");
// app.use(express.static(publicPath));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(publicPath, "index.html"));
// });

// const server = app.listen(port, function () {
//   console.log("app running on port.", server.address().port);
// });
