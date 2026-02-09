import axios from 'axios';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

/**
 * Figma Service - Handles all interactions with Figma API
 */
class FigmaService {
  constructor() {
    this.apiToken = process.env.FIGMA_API_TOKEN;
    if (!this.apiToken) {
      console.warn('⚠️  FIGMA_API_TOKEN not set. Figma integration will not work.');
    }
  }

  /**
   * Get authenticated axios instance with Figma headers
   */
  getAuthenticatedClient() {
    if (!this.apiToken) {
      throw new Error('FIGMA_API_TOKEN is not configured');
    }

    return axios.create({
      baseURL: FIGMA_API_BASE,
      headers: {
        'X-Figma-Token': this.apiToken,
      },
    });
  }

  /**
   * Get file metadata
   * @param {string} fileKey - Figma file key (from URL)
   * @returns {Promise<Object>} File metadata
   */
  async getFile(fileKey) {
    try {
      const client = this.getAuthenticatedClient();
      const response = await client.get(`/files/${fileKey}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching Figma file:', error.message);
      return {
        success: false,
        error: error.response?.data?.err || error.message,
      };
    }
  }

  /**
   * Get file nodes (specific parts of the design)
   * @param {string} fileKey - Figma file key
   * @param {string[]} nodeIds - Array of node IDs to fetch
   * @returns {Promise<Object>} Node data
   */
  async getFileNodes(fileKey, nodeIds) {
    try {
      const client = this.getAuthenticatedClient();
      const ids = nodeIds.join(',');
      const response = await client.get(`/files/${fileKey}/nodes`, {
        params: { ids },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching Figma nodes:', error.message);
      return {
        success: false,
        error: error.response?.data?.err || error.message,
      };
    }
  }

  /**
   * Get images from Figma file
   * @param {string} fileKey - Figma file key
   * @param {string[]} nodeIds - Array of node IDs to export as images
   * @param {Object} options - Export options (format, scale)
   * @returns {Promise<Object>} Image URLs
   */
  async getFileImages(fileKey, nodeIds, options = {}) {
    try {
      const client = this.getAuthenticatedClient();
      const ids = nodeIds.join(',');
      const params = {
        ids,
        format: options.format || 'png',
        scale: options.scale || 1,
      };

      const response = await client.get(`/images/${fileKey}`, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching Figma images:', error.message);
      return {
        success: false,
        error: error.response?.data?.err || error.message,
      };
    }
  }

  /**
   * Get comments from a Figma file
   * @param {string} fileKey - Figma file key
   * @returns {Promise<Object>} Comments data
   */
  async getFileComments(fileKey) {
    try {
      const client = this.getAuthenticatedClient();
      const response = await client.get(`/files/${fileKey}/comments`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching Figma comments:', error.message);
      return {
        success: false,
        error: error.response?.data?.err || error.message,
      };
    }
  }

  /**
   * Get team projects
   * @param {string} teamId - Figma team ID
   * @returns {Promise<Object>} Projects data
   */
  async getTeamProjects(teamId) {
    try {
      const client = this.getAuthenticatedClient();
      const response = await client.get(`/teams/${teamId}/projects`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching team projects:', error.message);
      return {
        success: false,
        error: error.response?.data?.err || error.message,
      };
    }
  }

  /**
   * Get project files
   * @param {string} projectId - Figma project ID
   * @returns {Promise<Object>} Files data
   */
  async getProjectFiles(projectId) {
    try {
      const client = this.getAuthenticatedClient();
      const response = await client.get(`/projects/${projectId}/files`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching project files:', error.message);
      return {
        success: false,
        error: error.response?.data?.err || error.message,
      };
    }
  }

  /**
   * Extract file key from Figma URL
   * @param {string} url - Figma file URL
   * @returns {string|null} File key
   */
  extractFileKey(url) {
    const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
}

export default new FigmaService();
