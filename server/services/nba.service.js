const NBA = require("nba");

const fetchTeamsGames = async (season = "2020-21") => {
  let teamGames = {};
  const params = {
    PlayerOrTeam: "T",
    Season: season,
  };
  const res = await NBA.stats.leagueGameLog(params);
  const { resultSets } = res;
  const headers = resultSets[0].headers;
  const rows = resultSets[0].rowSet;
  // @ts-ignore
  rows.forEach((row) => {
    const currTeamName = row[headers.indexOf("TEAM_NAME")];
    if (teamGames[currTeamName]) {
      teamGames[currTeamName].gameIds = teamGames[currTeamName].gameIds.concat(
        row[headers.indexOf("GAME_ID")]
      );
    } else {
      teamGames[currTeamName] = {
        gameIds: [row[headers.indexOf("GAME_ID")]],
        teamId: row[headers.indexOf("TEAM_ID")],
      };
    }
  });
  return teamGames;
};

const fetchTeamRoster = async (teamId, Season, onlyBySeason = false) => {
  let teamRosterResponse;
  let params = { Season };
  if (!onlyBySeason) {
    params.TeamID = teamId.toString();
  }
  teamRosterResponse = await NBA.stats.commonTeamRoster(params);

  return teamRosterResponse.commonTeamRoster.map(({ player, playerId }) => ({
    player,
    playerId,
  }));
};

const fetchShotsByTeamAndSeason = async (
  TeamID,
  Season,
  onlyBySeason = false
) => {
  let params = { Season };
  if (!onlyBySeason) {
    params.TeamID = TeamID;
  }
  return NBA.stats.shots(params);
};

const getSinglePlayerStatsPlain = (player, playerId) => {
  return {
    player,
    playerId,
    totalShotsInGame: 0,
    totalMadeShotsInTheGame: 0,
    totalShotsAfterMadeShot: 0,
    totalShotsAfterMissShot: 0,
    totalShotsMadeAfterMadeShots: 0,
    totalShotsMissAfterMadeShots: 0,
    totalShotsMadeAfterMissShots: 0,
    totalShotsMissAfterMissShots: 0,
    regularPercentage: 0,
    afterMadePercentage: 0,
    afterMissPercentage: 0,
  };
};

function getInitialTeamMap(roster) {
  return roster.reduce((teamMap, { player, playerId }) => {
    teamMap.set(playerId, getSinglePlayerStatsPlain(player, playerId));
    return teamMap;
  }, new Map());
}

const getStatsByTeamIdAndSeason = async (teamId, season, onlyBySeason) => {
  const allTeamGames = await fetchTeamsGames(season);

  if (typeof teamId === "number") {
    teamId = teamId.toString();
  }
  const selectTeamObj = Object.values(allTeamGames).find(
    (iterTeam) => iterTeam.teamId.toString() === teamId
  );

  if (!selectTeamObj) return {};
  const roster = await fetchTeamRoster(teamId, season, onlyBySeason);
  const teamsAndPlayersMap = new Map();
  teamsAndPlayersMap.set(teamId, getInitialTeamMap(roster));
  const { shot_Chart_Detail: allPlayes } = await fetchShotsByTeamAndSeason(
    teamId,
    season,
    onlyBySeason
  );

  let currentPeriod = 0;
  /**
   * map between player to last shot status -
   * 1 - made last shot
   * -1 - mis last shot
   * if not in dict --> did not shoot before
   */
  let lastShotHelper = new Map();
  let currentGame = null;
  allPlayes.forEach(
    ({ period, teamId, playerId, shotMadeFlag, playerName, gameId }) => {
      if (currentGame !== gameId) {
        currentGame = gameId;
        currentPeriod = 0;
      }
      if (period > currentPeriod) {
        lastShotHelper = new Map();
        currentPeriod = period;
      }
      const strPlayerId = playerId.toString();

      let currentPlayerStats = teamsAndPlayersMap
        .get(teamId.toString())
        .get(playerId);
      if (currentPlayerStats) {
        currentPlayerStats.totalShotsInGame++;
        const isMadeLastShot =
          lastShotHelper.get(strPlayerId) &&
          lastShotHelper.get(strPlayerId) === 1;
        const isMissLastShot =
          lastShotHelper.get(strPlayerId) &&
          lastShotHelper.get(strPlayerId) === -1;

        if (isMadeLastShot) {
          currentPlayerStats.totalShotsAfterMadeShot++;
          if (shotMadeFlag === 1) {
            currentPlayerStats.totalMadeShotsInTheGame++;
            currentPlayerStats.totalShotsMadeAfterMadeShots++;
            lastShotHelper.set(strPlayerId, 1);
          } else {
            currentPlayerStats.totalShotsMissAfterMadeShots++;
            lastShotHelper.set(strPlayerId, -1);
          }
        } else if (isMissLastShot) {
          currentPlayerStats.totalShotsAfterMissShot++;
          if (shotMadeFlag === 1) {
            currentPlayerStats.totalMadeShotsInTheGame++;
            currentPlayerStats.totalShotsMadeAfterMissShots++;
            lastShotHelper.set(strPlayerId, 1);
          } else {
            currentPlayerStats.totalShotsMissAfterMissShots++;
            lastShotHelper.set(strPlayerId, -1);
          }
        } else {
          if (shotMadeFlag === 1) {
            currentPlayerStats.totalMadeShotsInTheGame++;
            lastShotHelper.set(strPlayerId, 1);
          } else {
            lastShotHelper.set(strPlayerId, -1);
          }
        }
      }
    }
  );

  teamsAndPlayersMap.forEach((teamMap) => {
    teamMap.forEach((playerStats, playerId) => {
      playerStats.regularPercentage =
        playerStats.totalMadeShotsInTheGame / playerStats.totalShotsInGame;
      playerStats.afterMadePercentage =
        playerStats.totalShotsMadeAfterMadeShots /
        playerStats.totalShotsAfterMadeShot;
      playerStats.afterMissPercentage =
        playerStats.totalShotsMadeAfterMissShots /
        playerStats.totalShotsAfterMissShot;
      if (playerStats.totalShotsInGame === 0) {
        teamMap.delete(playerId);
      }
    });
  });
  return teamsAndPlayersMap;
};

module.exports = {
  fetchTeamsGames,
  fetchTeamRoster,
  fetchShotsByGameId: fetchShotsByTeamAndSeason,
  getStatsByTeamIdAndSeason,
};
