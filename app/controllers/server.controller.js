import httpStatus from 'http-status';

import ServerViewModel from '../models/server';

/* Types used for JSDoc */
/* eslint-disable no-unused-vars */
import { Request } from 'express';
import ServerRepository from '../../lib/galena/server-repository';
import ServerManager from '../../lib/galena/server-manager';
/* eslint-enable no-unused-vars */

import AppError from '../../lib/galena/app-error';
import ValidationError from '../../lib/galena/validation-error';
import NotFoundError from '../../lib/galena/not-found-error';


/**
 @typedef AppRequest
 @type {Request}
 @property {ServerRepository} serverRepository Server Repository
 @property {ServerManager} serverManager Server Manager
 */

function _translateError(err, res) {
  let status = httpStatus.INTERNAL_SERVER_ERROR;
  let result = { message: err };

  if (err instanceof AppError) {
    result['errorType'] = err.name;
    result['message'] = err.message;
  }

  if (err instanceof NotFoundError) {
    status = httpStatus.NOT_FOUND;
  }

  if (err instanceof ValidationError) {
    status = httpStatus.BAD_REQUEST;
    result['validation'] = err.validation;
  }

  res.status(status).json(result);
}

/**
 * getOne
 *
 * @param {AppRequest} req
 * @param {any} res
 */
async function getOne(req, res) {
  try {
    let { serverId } = req.params;
    let server = await req.serverRepository.getById(serverId);
    let model = new ServerViewModel(server);
    model.isRunning = req.serverManager.serverIsRunning(model.id);
    res.json({ server: model });
  } catch (err) {
    _translateError(err, res);
  }
}

/**
 * list
 *
 * @param {AppRequest} req
 * @param {any} res
 */
async function list(req, res) {
  try {
    let list = await req.serverRepository.list();
    let models = list.map(server => {
      let model = new ServerViewModel(server);
      model.isRunning = req.serverManager.serverIsRunning(model.id);
      return model;
    });
    res.json({ servers: models });
  } catch (err) {
    _translateError(err, res);
  }
}

/**
 * create
 *
 * @param {AppRequest} req
 * @param {any} res
 */
async function create(req, res) {
  try {
    let serverData = req.body.server;
    let server = await req.serverRepository.create(serverData);
    let model = new ServerViewModel(server);
    res.json({ server: model });
  } catch (err) {
    _translateError(err, res);
  }
}

/**
 * update
 *
 * @param {AppRequest} req
 * @param {any} res
 */
async function update(req, res) {
  try {
    let { serverId } = req.params;
    let serverData = req.body.server;
    let server = await req.serverRepository.getById(serverId);

    if (req.serverManager.serverIsRunning(server.id)) {
      throw new AppError('Server running. Cannot be updated', 400);
    }

    let newServer = await req.serverRepository.update(server.id, serverData);
    let model = new ServerViewModel(newServer);
    res.json({ server: model });
  } catch (err) {
    _translateError(err, res);
  }
}

/**
 * remove
 *
 * @param {AppRequest} req
 * @param {any} res
 */
async function remove(req, res) {
  try {
    let { serverId } = req.params;
    let server = await req.serverRepository.getById(serverId);

    if (req.serverManager.serverIsRunning(server.id)) {
      throw new AppError('Server running. Cannot be removed', 400);
    }

    await req.serverRepository.remove(server.id);
    res.status(204).end();
  } catch (err) {
    _translateError(err, res);
  }
}

/**
 * start
 *
 * @param {AppRequest} req
 * @param {any} res
 */
async function start(req, res) {
  try {
    let { serverId } = req.params;
    let server = await req.serverRepository.getById(serverId);
    let model = new ServerViewModel(server);

    await req.serverManager.serverStart(server);

    model.isRunning = req.serverManager.serverIsRunning(model.id);
    res.json({ server: model });
  } catch (err) {
    _translateError(err, res);
  }
}

/**
 * stop
 *
 * @param {AppRequest} req
 * @param {any} res
 */
async function stop(req, res) {
  try {
    let { serverId } = req.params;
    let server = await req.serverRepository.getById(serverId);
    let model = new ServerViewModel(server);

    await req.serverManager.serverStop(server);

    model.isRunning = req.serverManager.serverIsRunning(model.id);
    res.json({ server: model });
  } catch (err) {
    _translateError(err, res);
  }
}

export default { getOne, list, create, update, remove, start, stop };
