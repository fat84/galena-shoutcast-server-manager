import GalenaApp from './app/index';
import ServerManager from './lib/galena/server-manager';
import ServerRepository from './lib/galena/server-repository';
import CONFIG from './config.json';

const SC_SERV_BIN = './bin/sc_serv';
const CONFIGS_DIR = './var/config';

let serverManager = new ServerManager(SC_SERV_BIN, CONFIGS_DIR);
let serverRepository = new ServerRepository(CONFIG);
let galenaApp = new GalenaApp(CONFIG, serverManager, serverRepository);

galenaApp.start();
