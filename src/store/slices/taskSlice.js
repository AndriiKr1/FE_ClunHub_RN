import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskService } from "../../services/taskService";

// Fetch tasks thunk
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params, { rejectWithValue }) => {
    try {
      const data = await taskService.fetchTasks(params);
      
      // Map the response data to the expected format
      return (data || [])
        .filter(task => task)
        .map(task => ({
          id: task.id,
          name: task.title || task.name,
          description: task.description,
          deadline: task.dueDate,
          status: task.status,
          completed: task.completed || task.status === "COMPLETED",
          createdAt: task.createdAt,
          completionDate: task.completionDate,
        }));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

// Create task thunk
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue, dispatch }) => {
    try {
      // Validation
      if (!taskData.name || taskData.name.length < 1) {
        return rejectWithValue("The task name must be at least 1 character long.");
      }
      
      if (taskData.name.length > 30) {
        return rejectWithValue("The task name cannot exceed 30 characters.");
      }
      
      if (!taskData.deadline) {
        return rejectWithValue("Due date is required");
      }
      
      const response = await taskService.createTask(taskData);
      
      // Refresh tasks list
      await dispatch(fetchTasks()).unwrap();
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create task");
    }
  }
);

// Update task thunk
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const response = await taskService.updateTask(params);
      
      // Refresh tasks
      await dispatch(fetchTasks()).unwrap();
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update task");
    }
  }
);

// Update task status thunk
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const response = await taskService.updateTaskStatus(params);
      
      // Refresh tasks after status update
      setTimeout(async () => {
        await dispatch(fetchTasks({ includeCompleted: true })).unwrap();
      }, 300);
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update task status");
    }
  }
);

// Delete task thunk
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      await taskService.deleteTask(taskId);
      
      // Refresh task list after deletion
      setTimeout(async () => {
        await dispatch(fetchTasks({ includeCompleted: false })).unwrap();
      }, 300);
      
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete task");
    }
  }
);

// Helper functions for task organization
const sortTasksByDate = (tasks) => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.deadline || a.completionDate || 0);
    const dateB = new Date(b.deadline || b.completionDate || 0);
    return dateB - dateA;
  });
};

const organizeTasksByDate = (tasks) => {
  return tasks.reduce((acc, task) => {
    let dateKey;
    
    // For completed tasks, use completionDate if available
    if (task.status === "COMPLETED" || task.completed) {
      dateKey = (
        task.completionDate ||
        task.deadline ||
        new Date().toISOString()
      ).split("T")[0];
    }
    // For active tasks, use deadline
    else if (task.deadline) {
      dateKey = task.deadline.split("T")[0];
    }
    
    if (dateKey) {
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    
    return acc;
  }, {});
};

// Task slice
const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    tasksByDate: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = sortTasksByDate(action.payload || []);
        state.tasksByDate = organizeTasksByDate(action.payload || []);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createTask
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.loading = false;
        // Tasks will be refreshed by fetchTasks in the thunk
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state) => {
        state.loading = false;
        // Tasks will be refreshed by fetchTasks in the thunk
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateTaskStatus
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        
        // Find and update task
        const taskIndex = state.tasks.findIndex(task => task.id === action.payload.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = {
            ...state.tasks[taskIndex],
            status: action.payload.status,
            completed: action.payload.status === "COMPLETED",
            completionDate: action.payload.completionDate
          };
          
          // Reorganize by date
          state.tasksByDate = organizeTasksByDate(state.tasks);
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove deleted task
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        
        // Reorganize by date
        state.tasksByDate = organizeTasksByDate(state.tasks);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;