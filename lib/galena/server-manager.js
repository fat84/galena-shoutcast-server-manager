import fs from 'fs';
import { spawn } from 'child_process';

/* Types used for JSDoc */
/* eslint-disable no-unused-vars */
import { ChildProcess } from 'child_process';
import Server from './server';
/* eslint-enable no-unused-vars */

import ConfigFileAdapter from '../shoutcast/config-file-adapter';
import AppError from './app-error';

/**
 @typedef ServerInstance
 @type {Object}
 @property {ChildProcess} cp Child process
 @property {Server} conf Server configuration
 */

/**
 * Server Manager
 *
 * @class ServerManager
 */
export default class ServerManager {

  /**
   * Creates an instance of ServerManager.
   * @param {string} scBinPath
   * @param {string} configsPath
   * @memberof ServerManager
   */
  constructor(scBinPath, configsPath) {

    if (!fs.statSync(scBinPath).isFile())
      throw new AppError('Invalid Shoutcast server bin!');

    if (!fs.statSync(configsPath).isDirectory())
      throw new AppError('Invalid server configs directory!');

    Object.assign(this, {
      _scBinPath: scBinPath,
      _configsPath: configsPath,
      _instances: {}
    });
  }

  /**
   * Get Configuration filename
   *
   * @param {Server} server
   * @returns
   * @private
   * @memberof ServerManager
   */
  _getConfigFilename(server) {
    return `${this._configsPath}/${server.id}.config`;
  }

  /**
   * Unregister instance
   *
   * @private
   * @param {string} id Server Id
   * @private
   * @memberof ServerManager
   */
  _unregisterInstance(id) {
    if (this._instances[id] !== undefined) {
      delete this._instances[id];
    }
  }

  /**
   * Register Instance
   *
   * @param {string} id Server Id
   * @param {ServerInstance} instance Server instance
   * @private
   * @memberof ServerManager
   */
  _registerInstance(id, instance) {
    this._instances[id] = instance;
  }

  /**
   * Get server instance by server Id
   *
   * @param {string} id Server Id
   * @returns {ServerInstance} Returns server instance or false if doesn't exist
   * @private
   * @memberof ServerManager
   */
  _getInstance(id) {
    let instance = this._instances[id];
    return (instance === undefined) ? false : instance;
  }

  /**
   * Returns if the server is running
   *
   * @param {string} serverId Server Id
   * @returns {boolean} True if server is running of False if not.
   * @memberof ServerManager
   */
  serverIsRunning(serverId) {
    if (this._getInstance(serverId) === false) {
      return false;
    } else {
      return true;
    }
  }


  /**
   * Starts a server
   *
   * @param {Server} server Server to start
   * @returns {Promise}
   * @memberof ServerManager
   */
  serverStart(server) {
    let configFile = this._getConfigFilename(server);
    let configAdapter = new ConfigFileAdapter();

    if (this.serverIsRunning(server.id)) {
      return Promise.reject(new AppError('Server already running.'));
    }

    return configAdapter.writeOnFile(configFile, server)
      .then(() => {
        return new Promise((resolve) => {
          let options = {
            cwd: './',
            env: process.env,
            stdio: 'inherit',
            detached: false
          };

          let ps = spawn(this._scBinPath, [configFile], options);

          let instance = { cp: ps, conf: {} };
          Object.assign(instance.conf, server);

          this._registerInstance(server.id, instance);

          ps.on('close', () => {
            this._unregisterInstance(server.id);
          });

          ps.on('error', () => {
            this._unregisterInstance(server.id);
          });

          resolve(server);
        });
      })
  }


  /**
   * Stop a server
   *
   * @param {Server} server The server to be stopped
   * @returns {Promise}
   * @memberof ServerManager
   */
  serverStop(server) {
    return new Promise((resolve, reject) => {

      if (!this.serverIsRunning(server.id)) {
        reject(new AppError('Server not running.'));
        return;
      }

      let { cp } = this._getInstance(server.id);

      cp.kill('SIGINT');
      this._unregisterInstance(server.id);
      resolve(server);
    });
  }
}
