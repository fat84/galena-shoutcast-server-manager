import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/index.route';

export default class GalenaApp {

  constructor(config, serverManager, serverRepository) {

    this._config = config;
    let app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());

    app.use(express.static('public'));

    app.use((req, res, next) => {
      req.config = config;
      req.serverManager = serverManager;
      req.serverRepository = serverRepository;
      next();
    });

    app.use('/api', routes);

    this._innerApp = app;
  }

  getExpressApp() {
    return this._innerApp;
  }

  start() {
    this._innerApp.listen(this._config.port);
    console.log(`App started on: http://localhost:${this._config.port}`);
  }
}
