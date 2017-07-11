import mongodb from 'mongodb';
import uuidv1 from 'uuid/v1';

import Server from './server';
import AppError from './app-error';
import ValidationError from './validation-error';
import NotFoundError from './not-found-error';

/**
 * Map data from mongodb model to service
 *
 * @param {Object} data
 * @return {Server}
 */
function _modelToServer(data) {
  let server = new Server(data);
  server.id = server._id;
  delete server._id;
  return server;
}

function _serverToModel(server) {
  let data = {};
  Object.assign(data, server);
  data._id = server.id;
  delete data.id;
  return data;
}

function _createDbConnection(repo) {
  return mongodb.MongoClient.connect(repo._config.db);
}

export default class ServerRepository {

  constructor(config) {
    this._config = config;
  }

  /**
   * Create server
   *
   * @param {Object} data Server data
   * @returns {Server}
   * @memberof ServerRepository
   */
  async create(data) {
    let server = new Server(data);

    // Validate fields
    let validation = server.validate();
    if (validation !== false) {
      throw new ValidationError('Invalid model data', validation);
    }

    // Check if the port isn't already taken by other server
    let existentServerInPort = await this.getByPortBase(server.portBase, true);
    if (existentServerInPort) {
      throw new ValidationError('Invalid model data', {
        portBase: `Port is already used by "${existentServerInPort.name}"`
      });
    }

    // Assign new server ID
    server.id = uuidv1();

    // Save new server on DB
    let db = await _createDbConnection(this);
    let { result } = await db.collection('servers')
      .insertOne(_serverToModel(server));

    if (result.ok === 1) {
      return server;
    } else {
      throw new AppError('Cannot create new server.');
    }
  }

  /**
   * Update server
   *
   * @param {string} serverId Server Id
   * @param {Object} data Server data
   * @returns {Server}
   * @memberof ServerRepository
   */
  async update(serverId, data) {
    let server = new Server(data);

    // - Check if exist
    await this.getById(serverId);

    server.id = serverId;

    // Validate fields
    let validation = server.validate();
    if (validation !== false) {
      throw new ValidationError('Invalid model data', validation);
    }

    // Check if the port isn't already taken by other server
    let existentServerInPort = await this.getByPortBase(server.portBase, true);
    if (existentServerInPort && existentServerInPort.id !== serverId) {
      throw new ValidationError('Invalid model data', {
        portBase: `Port is already used by "${existentServerInPort.name}"`
      });
    }

    // Save new server on DB
    let db = await _createDbConnection(this);
    let { result } = await db.collection('servers')
      .update({ _id: server.id }, _serverToModel(server), { upsert: false });

    if (result.ok === 1) {
      return server;
    } else {
      throw new AppError('Cannot update the server.');
    }
  }


  /**
   * Get server by Id
   *
   * @param {string} serverId
   * @param {boolean} dontThrowException If true, returns null when entity not found
   * @returns {Server}
   * @memberof ServerRepository
   */
  async getById(serverId, dontThrowException = false) {
    let db = await _createDbConnection(this);
    let data = await db.collection('servers').findOne({ _id: serverId });

    if (data) {
      return _modelToServer(data);
    } else {
      if (dontThrowException) {
        return null;
      } else {
        throw new NotFoundError('Server not found');
      }
    }
  }

  /**
   * Get server by PortBase
   *
   * @param {Number} portBase
   * @param {boolean} dontThrowException If true, returns null when entity not found
   * @returns {Server}
   * @memberof ServerRepository
   */
  async getByPortBase(portBase, dontThrowException = false) {
    let db = await _createDbConnection(this);
    let data = await db.collection('servers').findOne({ portBase: portBase });

    if (data) {
      return _modelToServer(data);
    } else {
      if (dontThrowException) {
        return null;
      } else {
        throw new NotFoundError('Server not found');
      }
    }
  }


  /**
   * List all servers
   *
   * @returns {Server[]}
   * @memberof ServerRepository
   */
  async list() {
    let db = await _createDbConnection(this);
    let items = await db.collection('servers').find().toArray();

    return items.map((data) => {
      return _modelToServer(data);
    });
  }

  async remove(serverId) {
    await this.getById(serverId);

    let db = await _createDbConnection(this);
    let result = await db.collection('servers').deleteOne({ _id: serverId });

    if (result.ok !== 1) {
      throw new AppError('Cannot delete the server.');
    }
  }
}
