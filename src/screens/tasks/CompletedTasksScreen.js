import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../store/slices/taskSlice';
import { formatDateForApi } from '../../utils/dataMappers';
import ProfileHeader from '../../components/layout/ProfileHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius, commonStyles } from '../../theme';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';

// Import images
import leftArrow from '../../assets/images/left.png';

// Component to render a task with properly formatted description
const TaskCard = ({ task }) => {
  const [isTruncated, setIsTruncated] = useState(true);
  
  // Calculate if description should be truncated
  const shouldTruncate = task.description && task.description.length > 80;
  
  // Toggle truncation on press
  const toggleTruncation = () => {
    if (shouldTruncate) {
      setIsTruncated(!isTruncated);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.taskCard} 
      onPress={toggleTruncation}
      activeOpacity={shouldTruncate ? 0.7 : 1}
    >
      <Text style={styles.taskTitle}>
        {task.title || task.name || 'Untitled Task'}
      </Text>
      
      {task.description && (
        <View style={styles.taskDescriptionContainer}>
          <Text style={styles.taskDescription}>
            {shouldTruncate && isTruncated 
              ? `${task.description.substring(0, 80)}...` 
              : task.description}
          </Text>
            
          {shouldTruncate && (
            <Text style={styles.showMoreText}>
              {isTruncated ? 'Show more' : 'Show less'}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const CompletedTasksScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const [selectedDate, setSelectedDate] = useState('');
  const [displayTasks, setDisplayTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasksForDate = useCallback(
    async (date) => {
      try {
        const selectedDateObj = new Date(date);
        const firstDayOfMonth = new Date(
          selectedDateObj.getFullYear(),
          selectedDateObj.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          selectedDateObj.getFullYear(),
          selectedDateObj.getMonth() + 1,
          0
        );

        const fromDate = formatDateForApi(firstDayOfMonth);
        const toDate = formatDateForApi(lastDayOfMonth);

        await dispatch(
          fetchTasks({
            fromDate: fromDate,
            toDate: toDate,
            includeCompleted: true,
          })
        );
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const loadSelectedDate = async () => {
      try {
        // First check if we received the date as a route parameter
        const routeDate = route.params?.selectedDate;
        
        // If not, check AsyncStorage
        let dateToUse = routeDate;
        if (!dateToUse) {
          const storedDate = await AsyncStorage.getItem('selectedDate');
          if (storedDate) {
            dateToUse = storedDate;
          } else {
            // Default to today if no date is found
            const today = new Date();
            dateToUse = formatDateForApi(today);
          }
        }
        
        setSelectedDate(dateToUse);
        fetchTasksForDate(dateToUse);
      } catch (error) {
        console.error('Error loading selected date:', error);
      }
    };
    
    loadSelectedDate();
  }, [fetchTasksForDate, route.params]);

  useEffect(() => {
    if (!tasks.length) return;

    // Filter tasks based on the selected date - ONLY SHOW COMPLETED TASKS
    const filteredTasks = tasks.filter((task) => {
      const isCompleted = task.status === 'COMPLETED' || task.completed;

      if (isCompleted) {
        // For completed tasks, check if the completion date matches the selected date
        const taskCompletionDate = task.completionDate?.split('T')[0];
        return taskCompletionDate === selectedDate;
      }

      // Don't show active tasks at all
      return false;
    });

    setDisplayTasks(filteredTasks);
  }, [tasks, selectedDate]);

  const formatDate = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const completedTasks = displayTasks.filter(
    (task) => task.completed || task.status === 'COMPLETED'
  );

  return (
    <GradientBackground colors={gradientPresets.completedTasks}>
  
    <View style={styles.completedPage}>
      <View style={styles.headerContainer}>
        <ProfileHeader />
      </View>

      <View style={styles.dateTitle}>
        <Text style={styles.dateTitleText}>{formatDate(selectedDate)}</Text>
      </View>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : displayTasks.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No tasks for this date</Text>
        </View>
      ) : (
        <>
          {/* Show completed tasks */}
          {completedTasks.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Completed Tasks</Text>
              <FlatList
                data={completedTasks}
                renderItem={({ item }) => (
                  <TaskCard task={item} />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.taskList}
                ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </>
      )}

      <View style={styles.backSection}>
        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <Image
            source={leftArrow}
            style={styles.backArrowImg}
          />
        </TouchableOpacity>
        <Text style={styles.footerTitle}>family planner</Text>
      </View>
    </View>
    
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  completedPage: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 70, 
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateTitle: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.large,
    alignSelf: 'center',
    marginVertical: spacing.md,
    ...commonStyles.shadow.light,
  },
  dateTitleText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.text.primary,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasksText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.lg,
  },
  subsectionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  taskList: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  taskCard: {
    backgroundColor: colors.card.task,
    borderRadius: borderRadius.round,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.xs,
    ...commonStyles.shadow.light,
  },
  taskTitle: {
    color: colors.text.dark,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  taskDescriptionContainer: {
    marginTop: spacing.xs,
  },
  taskDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.dark,
    opacity: 0.8,
  },
  showMoreText: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
  },
  backSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backArrowImg: {
    width: 80,
    height: 80,
  },
  footerTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
    marginTop: spacing.xs,
  },
  errorMessage: {
    color: colors.status.error,
    textAlign: 'center',
    margin: spacing.sm,
  },
});

export default CompletedTasksScreen;