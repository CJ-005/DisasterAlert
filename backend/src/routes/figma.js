import express from 'express';
import {
  getFile,
  getFileFromUrl,
  getNodes,
  getImages,
  getComments,
  getTeamProjects,
  getProjectFiles,
} from '../controllers/figmaController.js';

const router = express.Router();

// Get file by key
router.get('/file/:fileKey', getFile);

// Get file from URL
router.post('/file-from-url', getFileFromUrl);

// Get specific nodes
router.post('/nodes', getNodes);

// Get images
router.post('/images', getImages);

// Get comments
router.get('/comments/:fileKey', getComments);

// Get team projects
router.get('/team/:teamId/projects', getTeamProjects);

// Get project files
router.get('/project/:projectId/files', getProjectFiles);

export default router;
