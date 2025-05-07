import api from './api';
import { formatDateForApi } from '../utils/dataMappers';

export const taskService = {
  /**
   * Fetch tasks with optional filtering
   * @param {object} params - Query parameters
   * @returns {Promise} API response
   */
  fetchTasks: async (params) => {
    const { fromDate, toDate, includeCompleted = false } = params || {};
    
    let url = '/api/tasks/list';
    const queryParams = [];
    
    if (fromDate) queryParams.push(`fromDate=${fromDate}`);
    if (toDate) queryParams.push(`toDate=${toDate}`);
    if (includeCompleted !== undefined) queryParams.push(`includeCompleted=${includeCompleted}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Create a new task
   * @param {object} taskData - Task data
   * @returns {Promise} API response
   */
  createTask: async (taskData) => {
    // Format date
    const formattedDate = taskData.deadline
      ? formatDateForApi(taskData.deadline)
      : null;
      
    // Prepare data for API
    const taskRequest = {
      title: taskData.name,
      description: taskData.description || "",
      dueDate: formattedDate,
      status: "IN_PROGRESS",
      priority: taskData.priority || 3,
    };
    
    const response = await api.post('/api/tasks', taskRequest);
    return response.data;
  },
  
  /**
   * Update an existing task
   * @param {object} params - Task update parameters
   * @returns {Promise} API response
   */
  updateTask: async ({ taskId, taskData, email }) => {
    const response = await api.put(
      `/api/tasks?taskId=${taskId}&email=${email}`,
      {
        title: taskData.name,
        description: taskData.description || "",
        dueDate: formatDateForApi(taskData.deadline),
      }
    );
    
    return response.data;
  },
  
  /**
   * Update task status
   * @param {object} params - Status update parameters
   * @returns {Promise} API response
   */
  updateTaskStatus: async ({ id, status, completionDate }) => {
    const response = await api.patch(
      `/api/tasks/${id}/status?status=${status}`
    );
    
    return {
      ...response.data,
      id,
      status,
      completionDate: completionDate || null,
    };
  },
  
  /**
   * Delete a task
   * @param {number} taskId - Task ID to delete
   * @returns {Promise} API response
   */
  deleteTask: async (taskId) => {
    const response = await api.delete(`/api/tasks?id=${taskId}`);
    return response.data;
  }
};