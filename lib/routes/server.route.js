import express from 'express';
import serverController from '../controllers/server.controller';

const router = express.Router();

router.route('/').get(serverController.list).post(serverController.create);

router.route('/:serverId').get(serverController.getOne).put(serverController.update).delete(serverController.remove);

router.route('/:serverId/start').post(serverController.start);

router.route('/:serverId/stop').post(serverController.stop);

export default router;