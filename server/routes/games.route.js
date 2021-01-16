const { fetchTeamsGames } = require("../services/nba.service");
// import { fetchTeamsGames } from "../services/nba.service";

const gamesRouter = function (app) {
  app.get("/games/:season", async function (req, res) {
    const allTeamsData = await fetchTeamsGames(req.params.season);
    res.status(200).json(allTeamsData);
  });
};

module.exports = gamesRouter;
