import express = require('express');
const CommonRoutesConfig = require('/server/routes/common.routes.config');

export class GamesRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'GamesRoutes');
    }

    configureRoutes() {
        // (we'll add the actual route configuration here next)
        return this.app;
    }
}
