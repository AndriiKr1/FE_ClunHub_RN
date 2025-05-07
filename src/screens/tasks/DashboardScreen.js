import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { formatDateForApi } from '../../utils/dataMappers';
import { fetchTasks, updateTaskStatus, deleteTask } from '../../store/slices/taskSlice';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ProfileHeader from '../../components/layout/ProfileHeader';
import TaskItem from '../../screens/tasks/TaskItem';
import { colors, spacing, typography, commonStyles } from '../../theme';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  
  // State for modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmationTask, setConfirmationTask] = useState(null);
  const [deleteConfirmationTask, setDeleteConfirmationTask] = useState(null);
  const [editConfirmationTask, setEditConfirmationTask] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTasks = () => {
    // Get today's date
    const today = new Date();
    
    // Calculate a date range that includes the future (e.g., 1 year from now)
    const startDate = formatDateForApi(today);
    
    // One year from now
    const futureDate = new Date(today);
    futureDate.setFullYear(today.getFullYear() + 1);
    const endDate = formatDateForApi(futureDate);
    
    // Fetch tasks with this extended date range
    dispatch(fetchTasks({ 
      fromDate: startDate,
      toDate: endDate,
      includeCompleted: false 
    }));
  };

  // Filter active tasks
  const activeTasks = tasks?.filter(task => !task.completed) || [];

  const handleCompleteTask = async (taskId) => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      await dispatch(
        updateTaskStatus({
          id: taskId,
          status: "COMPLETED",
          completionDate: today 
        })
      ).unwrap();
      
      loadTasks();
      setConfirmationTask(null);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      setDeleteConfirmationTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = (task) => {
    navigation.navigate("AddTask", {
      taskToEdit: task,
      isEditing: true,
    });
  };

  const goToCompletedTasks = () => {
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    navigation.navigate("Calendar", { selectedDate: formattedToday });
  };

  return (
    <GradientBackground colors={gradientPresets.dashboard}>
      <View style={styles.dashboardContainer}>
        <ProfileHeader />

        <Button
          title="Add new task"
          onPress={() => navigation.navigate("AddTask")}
          variant="accent"
          style={styles.addTaskButton}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
          </View>
        ) : (
          <View style={styles.scrollableTaskList}>
            {activeTasks.length > 0 ? (
              <FlatList
                data={activeTasks}
                renderItem={({ item }) => (
                  <TaskItem
                    task={item}
                    onViewDetails={() => setSelectedTask(item)}
                    onComplete={() => setConfirmationTask(item)}
                    onDelete={() => setDeleteConfirmationTask(item)}
                    onEdit={() => setEditConfirmationTask(item)}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.taskListContent}
              />
            ) : (
              <View style={styles.noTasksContainer}>
                <Text style={styles.noTasksText}>No active tasks</Text>
              </View>
            )}
          </View>
        )}

        <Button
          title="Completed tasks"
          onPress={goToCompletedTasks}
          variant="accent"
          style={styles.completedButton}
        />

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>family planner</Text>
        </View>

        {/* Task Details Modal */}
        {selectedTask && (
          <Modal
            visible={selectedTask !== null}
            title={selectedTask?.name}
            onClose={() => setSelectedTask(null)}
            actions={[
              { title: 'OK', onPress: () => setSelectedTask(null), variant: 'secondary' }
            ]}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Description:</Text>
                {'\n'}
                {selectedTask?.description || "No description provided"}
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Deadline:</Text>{" "}
                {selectedTask?.deadline}
              </Text>
            </View>
          </Modal>
        )}

        {/* Complete Task Confirmation Modal */}
        {confirmationTask && (
          <Modal
            visible={confirmationTask !== null}
            title="Confirm completion"
            message={`Did you really complete "${confirmationTask?.name}"?`}
            onClose={() => setConfirmationTask(null)}
            actions={[
              { 
                title: 'Yes', 
                onPress: () => handleCompleteTask(confirmationTask?.id), 
                variant: 'secondary',
                style: styles.yesButton
              },
              { 
                title: 'No', 
                onPress: () => setConfirmationTask(null), 
                variant: 'danger'
              }
            ]}
          />
        )}

        {/* Delete Task Confirmation Modal */}
        {deleteConfirmationTask && (
          <Modal
            visible={deleteConfirmationTask !== null}
            title="Confirm deletion"
            message={`Are you sure you want to delete "${deleteConfirmationTask?.name}"?`}
            onClose={() => setDeleteConfirmationTask(null)}
            actions={[
              { 
                title: 'Yes', 
                onPress: () => handleDeleteTask(deleteConfirmationTask?.id), 
                variant: 'secondary',
                style: styles.yesButton
              },
              { 
                title: 'No', 
                onPress: () => setDeleteConfirmationTask(null), 
                variant: 'danger'
              }
            ]}
          />
        )}

        {/* Edit Task Confirmation Modal */}
        {editConfirmationTask && (
          <Modal
            visible={editConfirmationTask !== null}
            title="Confirm editing"
            message={`Do you want to edit "${editConfirmationTask?.name}"?`}
            onClose={() => setEditConfirmationTask(null)}
            actions={[
              { 
                title: 'Yes', 
                onPress: () => {
                  handleEditTask(editConfirmationTask);
                  setEditConfirmationTask(null);
                }, 
                variant: 'secondary',
                style: styles.yesButton
              },
              { 
                title: 'No', 
                onPress: () => setEditConfirmationTask(null), 
                variant: 'danger'
              }
            ]}
          />
        )}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskButton: {
    width: '100%',
    maxWidth: 320,
    margin: spacing.sm,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border.accent,
  },
  scrollableTaskList: {
    width: '100%',
    maxWidth: 320,
    height: 188,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.small,
    padding: spacing.xs,
    marginVertical: spacing.sm,
  },
  taskListContent: {
    paddingVertical: spacing.xs,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasksText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
    fontStyle: 'italic',
  },
  completedButton: {
    width: '100%',
    maxWidth: 320,
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border.accent,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingVertical: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
  modalContent: {
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  modalText: {
    fontSize: typography.fontSizes.md,
    marginBottom: spacing.md,
    color: colors.text.primary,
    textAlign: 'left',
    lineHeight: 22,
  },
  modalLabel: {
    fontWeight: typography.fontWeights.bold,
  },
  yesButton: {
    backgroundColor: colors.status.success,
  },
});

export default DashboardScreen;