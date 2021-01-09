import {CommonRoutesConfig} from '../common/common.routes.config';
import {fetchTeamsGames, fetchTeamRoster} from '../utils/nba.util'
import type {TeamsGamesT} from '../utils/nba.util'
// @ts-ignore
import express from 'express';

export class GamesRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'GamesRoutes');
    }

    configureRoutes() {

        this.app.route(`/games`)
            .get(async (req: express.Request, res: express.Response) => {
                const allTeamsData: TeamsGamesT = await fetchTeamsGames();
                res.status(200).json(allTeamsData);
            });

        this.app.route(`/teamRoster/:teamId`)
            .get(async (req: express.Request, res: express.Response) => {
                const teamRoster: any = await fetchTeamRoster(req.params.teamId);
                res.status(200).json(teamRoster);
            });

        this.app.route(`/users/:userId`)
            .all((req: express.Request, res: express.Response, next: express.NextFunction) => {
                // This middleware function runs before any request to /users/:userId
                // It doesn't accomplish anything just yet---it simply passes control to the next applicable function below using next()
                next();
            })
            .get((req: express.Request, res: express.Response) => {
                res.status(200).send(`GET requested for id ${req.params.userId}`);
            })
            .put((req: express.Request, res: express.Response) => {
                res.status(200).send(`Put requested for id ${req.params.userId}`);
            })
            .patch((req: express.Request, res: express.Response) => {
                res.status(200).send(`Patch requested for id ${req.params.userId}`);
            })
            .delete((req: express.Request, res: express.Response) => {
                res.status(200).send(`Delete requested for id ${req.params.userId}`);
            });

        return this.app;
    }
}
