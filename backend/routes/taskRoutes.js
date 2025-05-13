import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middlewares/auth.js';
import { importTasksFromExcel } from '../controllers/importController.js';
import { 
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject
} from '../controllers/taskController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Public routes (if any)
router.post('/import', upload.single('file'), importTasksFromExcel);

// Protected routes
router.use(authenticateToken);

// Task CRUD endpoints
router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get((req, res) => res.status(200).json({ message: "Get single task" })) // Placeholder
  .put(updateTask)
  .delete(deleteTask);

// Get tasks by project
router.get('/project/:projectId', getTasksByProject);


export default router;