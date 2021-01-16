import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const YEARS_BACK = 10;

export default function MainPage() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("2020-21");
  const [allTeams, setAllTeams] = useState([]);
  const [stats, setStats] = useState([]);
  const [counts, setCounts] = useState({
    afterMadePercentage: 0,
    afterMissPercentage: 0,
    totalPlayers: 0,
  });

  const fetchGames = async () => {
    const gamesRaw = await fetch(`/games/${selectedSeason}`);
    const gamesJson = await gamesRaw.json();
    setAllTeams(
      Object.keys(gamesJson).map((teamName) => [
        teamName,
        gamesJson[teamName].teamId,
      ])
    );
  };

  const fetchStats = async () => {
    const statsRaw = await fetch(`/stats/${selectedTeam}/${selectedSeason}`);
    const statsJson = await statsRaw.json();
    const allFieldsStats = Object.values(statsJson)[0]
      .map((playerStats) => Object.values(playerStats))
      .map(([obj]) => obj);
    const internalCounts = {
      afterMadePercentage: 0,
      afterMissPercentage: 0,
      totalPlayers: allFieldsStats.length,
    };

    const relevantFieldsStats = allFieldsStats.map(
      ({
        player,
        regularPercentage,
        afterMadePercentage,
        afterMissPercentage,
      }) => {
        if (afterMadePercentage > regularPercentage) {
          internalCounts.afterMadePercentage++;
        }
        if (afterMissPercentage > regularPercentage) {
          internalCounts.afterMissPercentage++;
        }

        return {
          player,
          regularPercentage,
          afterMadePercentage,
          afterMissPercentage,
        };
      }
    );
    setCounts(internalCounts);
    setStats(relevantFieldsStats);
  };

  useEffect(() => {
    allTeams.length && setSelectedTeam(allTeams[0][1]);
  }, [allTeams]);

  useEffect(() => {
    if (selectedTeam && selectedSeason) {
      fetchStats();
      // fetchData();
      // .then(data => console.log(data));  }, [selectedTeam, selectedSeason]);
    }
  }, [selectedTeam]);
  const handleSeasonChange = async (event) => {
    setSelectedSeason(event.target.value);
    await fetchGames();
  };

  const handleTeamChange = async (event) => {
    setSelectedTeam(event.target.value);
  };

  let yearNum = 2020;
  let shortYearNum = 20;

  const years = [...Array(YEARS_BACK).keys()].map(
    (YEAR_BACK) =>
      (yearNum - YEAR_BACK).toString() +
      "-" +
      (shortYearNum + 1 - YEAR_BACK).toString()
  );

  return (
    <>
      <Grid style={{ paddingTop: 10 }} container>
        <Grid item xs style={{ height: "100px" }}>
          <Select value={selectedSeason} onChange={handleSeasonChange}>
            {years.map((season) => (
              <MenuItem key={season} value={season}>
                {season}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs style={{ height: "100px" }}>
          counts:
          {JSON.stringify(counts)}
        </Grid>
        <Grid item xs style={{ height: "100px" }}>
          <Select value={selectedTeam} onChange={handleTeamChange}>
            {allTeams &&
              allTeams.map(([teamName, teamId]) => (
                <MenuItem key={teamId} value={teamId}>
                  {teamName}
                </MenuItem>
              ))}
          </Select>
        </Grid>
      </Grid>
      {stats.length && (
        <Grid container justify={"center"}>
          <Grid item>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {Object.keys(stats[0]).map((title) => (
                      <TableCell>{title}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.map((playerRow) => {
                    return (
                      <TableRow key={playerRow.player}>
                        {Object.keys(playerRow).map((key) => {
                          let color = "black";
                          const regularColoredFields = [
                            "player",
                            "regularPercentage",
                          ];
                          if (!regularColoredFields.includes(key)) {
                            const isGreen =
                              playerRow[key] > playerRow.regularPercentage;
                            // isGreen && internalCounts[key]++;
                            color = isGreen ? "#4BB543" : "red";
                          }

                          return (
                            <TableCell style={{ color }}>
                              {playerRow[key]}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </>
  );
}
