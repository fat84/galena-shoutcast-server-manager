import express from 'express';
import serverRoutes from './server.route';

const router = express.Router();

router.get('/healt', (req, res) =>
  res.json({ healthy: 'true' })
);

router.use('/servers', serverRoutes);

export default router;
