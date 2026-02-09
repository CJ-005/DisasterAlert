import figmaService from '../services/figmaService.js';

/**
 * Get Figma file data
 * GET /api/figma/file/:fileKey
 */
export const getFile = async (req, res, next) => {
  try {
    const { fileKey } = req.params;
    
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: 'File key is required',
      });
    }

    const result = await figmaService.getFile(fileKey);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Figma file from URL
 * POST /api/figma/file-from-url
 * Body: { url: "https://figma.com/file/..." }
 */
export const getFileFromUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Figma URL is required',
      });
    }

    const fileKey = figmaService.extractFileKey(url);
    
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Figma URL format',
      });
    }

    const result = await figmaService.getFile(fileKey);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific nodes from a Figma file
 * POST /api/figma/nodes
 * Body: { fileKey: "...", nodeIds: ["id1", "id2"] }
 */
export const getNodes = async (req, res, next) => {
  try {
    const { fileKey, nodeIds } = req.body;
    
    if (!fileKey || !nodeIds || !Array.isArray(nodeIds)) {
      return res.status(400).json({
        success: false,
        error: 'File key and nodeIds array are required',
      });
    }

    const result = await figmaService.getFileNodes(fileKey, nodeIds);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get images from Figma file
 * POST /api/figma/images
 * Body: { fileKey: "...", nodeIds: ["id1", "id2"], options: { format: "png", scale: 2 } }
 */
export const getImages = async (req, res, next) => {
  try {
    const { fileKey, nodeIds, options } = req.body;
    
    if (!fileKey || !nodeIds || !Array.isArray(nodeIds)) {
      return res.status(400).json({
        success: false,
        error: 'File key and nodeIds array are required',
      });
    }

    const result = await figmaService.getFileImages(fileKey, nodeIds, options);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments from a Figma file
 * GET /api/figma/comments/:fileKey
 */
export const getComments = async (req, res, next) => {
  try {
    const { fileKey } = req.params;
    
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: 'File key is required',
      });
    }

    const result = await figmaService.getFileComments(fileKey);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get team projects
 * GET /api/figma/team/:teamId/projects
 */
export const getTeamProjects = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    
    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required',
      });
    }

    const result = await figmaService.getTeamProjects(teamId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project files
 * GET /api/figma/project/:projectId/files
 */
export const getProjectFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required',
      });
    }

    const result = await figmaService.getProjectFiles(projectId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};
