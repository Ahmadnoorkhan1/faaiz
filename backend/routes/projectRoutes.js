import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject ,
} from '../controllers/projectController.js';

const router = express.Router();

// All routes require authentication

// Project routes
router.route('/')
.get(getProjects)
.post(createProject);

router.use(authenticateToken);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);


const projectRoutes = router;
export default projectRoutes; 