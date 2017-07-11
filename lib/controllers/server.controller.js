import httpStatus from 'http-status';
import ServerViewModel from '../models/server';
import ServerRepository from '../../lib/galena/server-repository';
import AppError from '../../lib/galena/app-error';
import ValidationError from '../../lib/galena/validation-error';

function _manageError(err, res) {
  if (err instanceof AppError) res.status(err.status).json({ message: err.message });
  if (err instanceof ValidationError) res.status(err.status).json({ message: err.message, validation: err.validation });else res.status(500).json({ message: err });
}

function getOne(req, res) {
  req.serverRepository.getById(req.params.serverId).then(server => {
    let model = new ServerViewModel(server);
    model.isRunning = req.serverManager.serverIsRunning(model.id);
    res.json({ server: model });
  }).catch(err => {
    _manageError(err, res);
  });
}

function list(req, res) {
  req.serverRepository.list().then(list => {
    let models = list.map(server => {
      let model = new ServerViewModel(server);
      model.isRunning = req.serverManager.serverIsRunning(model.id);
      return model;
    });
    res.json({ servers: models });
  }).catch(err => {
    _manageError(err, res);
  });
}

function create(req, res) {
  req.serverRepository.create(req.body.server).then(server => {
    let model = new ServerViewModel(server);
    model.isRunning = false;
    res.json({ server: model });
  }).catch(err => {
    _manageError(err, res);
  });
}

function update(req, res) {
  req.serverRepository.getById(req.params.serverId).then(server => {
    if (req.serverManager.serverIsRunning(server.id)) {
      return Promise.reject(new AppError('Server running. Cant be updated', 400));
    }
    return req.serverRepository.update(server.id, req.body.server);
  }).then(server => {
    let model = new ServerViewModel(server);
    res.json({ server: model });
  }).catch(err => {
    _manageError(err, res);
  });
}

function remove(req, res) {
  req.serverRepository.getById(req.params.serverId).then(server => {
    if (req.serverManager.serverIsRunning(server.id)) {
      return Promise.reject(new AppError('Server running. Cant be removed', 400));
    }
    return req.serverRepository.remove(server.id);
  }).then(() => {
    res.status(204).end();
  }).catch(err => {
    _manageError(err, res);
  });
}

function start(req, res) {
  req.serverRepository.getById(req.params.serverId).then(server => {
    return req.serverManager.serverStart(server);
  }).then(server => {
    let model = new ServerViewModel(server);
    model.isRunning = req.serverManager.serverIsRunning(model.id);
    res.json({ server: model });
  }).catch(err => {
    _manageError(err, res);
  });
}

function stop(req, res) {
  req.serverRepository.getById(req.params.serverId).then(server => {
    return req.serverManager.serverStop(server);
  }).then(server => {
    let model = new ServerViewModel(server);
    model.isRunning = req.serverManager.serverIsRunning(model.id);
    res.json({ server: model });
  }).catch(err => {
    _manageError(err, res);
  });
}

export default { getOne, list, create, update, remove, start, stop };