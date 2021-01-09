// @ts-ignore
import NBA from 'nba';


type AllGamesResT = {
    "resource": string,
    "parameters": {
        "LeagueID": string,
        "Season": string,
        "SeasonType": string,
        "PlayerOrTeam": string,
        "Counter": number,
        "Sorter": string,
        "Direction": string,
        "DateFrom": string,
        "DateTo": string
    },
    "resultSets": {
        "name": string,
        "headers": string [],
        "rowSet": string | number [][]
    } []
}

export type SinglePlayerInRosterT = {
    "teamID": number,
    "season": string,
    "leagueID": string,
    "player": string,
    "playerSlug": string,
    "num": string,
    "position": string,
    "height": string,
    "weight": string,
    "birthDate": string,
    "age": number,
    "exp": string,
    "school": string,
    "playerId": number
}

export type SingleCoachRoster = {
    "teamId": number,
    "season": string,
    "coachId": number,
    "firstName": string,
    "lastName": string,
    "coachName": string,
    "isAssistant": number,
    "coachType": string,
    "sortSequence": number,
    "subSortSequence": number
}

export type TeamPartialRosterT = { "player": string, "playerId": number }[]

export type TeamRosterT = {
    commonTeamRoster: SinglePlayerInRosterT[], coaches: SingleCoachRoster[]
}
export type TeamsGamesT = {
    [key: string]: { gameIds: string[], teamId: number }
};


const fetchTeamsGames: () => Promise<TeamsGamesT> = async () => {
    let teamGames: TeamsGamesT = {};
    const res: AllGamesResT = await NBA.stats.leagueGameLog({PlayerOrTeam: 'T'})
    const {resultSets} = res;
    const headers = resultSets[0].headers;
    const rows = resultSets[0].rowSet;
    // @ts-ignore
    rows.forEach((row) => {
        const currTeamName = row[headers.indexOf('TEAM_NAME')];
        if (teamGames[currTeamName]) {
            teamGames[currTeamName].gameIds = teamGames[currTeamName].gameIds.concat(row[headers.indexOf('GAME_ID')]);
        } else {
            teamGames[currTeamName] = {
                gameIds: [row[headers.indexOf('GAME_ID')]],
                teamId: row[headers.indexOf('TEAM_ID')]
            };
        }
    });
    return teamGames;
}

const fetchTeamRoster: (teamId: number) => Promise<TeamPartialRosterT> = async (teamId) => {
    let teamRosterResponse: TeamRosterT;
    teamRosterResponse = await NBA.stats.commonTeamRoster({TeamID: teamId.toString()})

    return teamRosterResponse.commonTeamRoster.map(({player, playerId}: SinglePlayerInRosterT) => ({
        player,
        playerId
    }))
}


export {
    fetchTeamsGames,
    fetchTeamRoster
}
