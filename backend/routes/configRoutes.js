import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  getConfigurations,
  getConfigurationByKey,
  upsertConfiguration,
  deleteConfiguration,
  createConfiguration
} from '../controllers/configController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Configuration routes
router.route('/')
  .get(getConfigurations)
  .post(upsertConfiguration);

router.route('/:key')
  .get(getConfigurationByKey)
  .delete(deleteConfiguration);

router.route('/create')
  .post(createConfiguration);

const configRoutes = router;
export default configRoutes; 