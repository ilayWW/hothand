const {
  getStatsByTeamIdAndSeason,
  fetchTeamsGames,
} = require("../services/nba.service");

function fromMap(map) {
  return Array.from(map.entries(), ([k, v]) =>
    v instanceof Map ? { [k]: fromMap(v) } : { [k]: v }
  );
}

const rosterRouter = function (app) {
  app.get("/stats/:teamId/:season", async function (req, res) {
    const { teamId, season } = req.params;
    const singleGameStatsMap = await getStatsByTeamIdAndSeason(teamId, season);
    const [obj] = fromMap(singleGameStatsMap);
    res.status(200).json(obj);
  });

  app.get("/allTeamStats/:season", async function (req, res) {
    const { season } = req.params;
    console.log(`starting request for season - ${season}`);
    const allTeamsData = await fetchTeamsGames(season);
    console.log(`got all teams games`);
    let teamIdToName = {};
    const teamIds = Object.keys(allTeamsData).map((teamName) => {
      const teamId = allTeamsData[teamName].teamId;
      teamIdToName[teamId] = teamName;
      return teamId;
    });

    let allStats = {};
    for (const teamId of teamIds) {
      console.log(`starting with team - ${teamId}`);
      const singleGameStatsMap = await getStatsByTeamIdAndSeason(
        teamId,
        season
      );
      const [obj] = fromMap(singleGameStatsMap);
      console.log(`finished team ${teamId}`);
      allStats[teamIdToName[teamId]] = Object.values(obj)[0];
    }
    allStats.summaryPerTeam = genSummary(allStats);
    allStats.summary = calcSummaryFromListOfPlayers(
      [].concat(...Object.values(allStats))
    );
    res.status(200).json(allStats);
  });
};

const genSummary = (allStats) => {
  let res = {};
  Object.keys(allStats).forEach((teamName) => {
    res[teamName] = calcSummaryFromListOfPlayers(allStats[teamName]);
  });
  return res;
};

const calcSummaryFromListOfPlayers = (players) => {
  let res = {
    totalPlayers: players.length,
    hotHandPlayers: 0,
    coldHandPlayers: 0,
  };
  players.forEach((playerObj) => {
    const {
      regularPercentage,
      afterMadePercentage,
      afterMissPercentage,
    } = Object.values(playerObj)[0];
    if (afterMadePercentage > regularPercentage) {
      res.hotHandPlayers++;
    }
    if (afterMissPercentage > regularPercentage) {
      res.coldHandPlayers++;
    }
  });
  return res;
};

module.exports = rosterRouter;
