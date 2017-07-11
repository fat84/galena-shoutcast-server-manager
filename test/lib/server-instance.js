import { expect } from 'chai';

import Server from '../../lib/galena/server';
import ServerManager from '../../lib/galena/server-manager';

const SC_SERV_BIN = './bin/sc_serv';
const CONFIGS_DIR = './var/config';

let server = new Server({
  _id: 'e15a23ac-5f88-11e7-907b-a6006ad3dba0',
	portBase: 8000,
	password: 'Secret!',
	adminPassword: 'AdminSecret!',
  maxuser: 64
});

describe('Servers instances manager', function () {

  it('Create instance', function() {
    let serverManager = new ServerManager(SC_SERV_BIN, CONFIGS_DIR);
    expect(serverManager).to.be.an.instanceof(ServerManager);
  });

	it('Start a server', function () {

		let serverManager = new ServerManager(SC_SERV_BIN, CONFIGS_DIR);

		return serverManager.serverStart(server)
			.then(success => {
				expect(success).to.eql(true);
			});
	});
});
