import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Dimensions,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../store/slices/taskSlice';
import { formatDateForApi } from '../../utils/dataMappers';
import { formatDateKey } from '../../utils/dateHelpers';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';
import ProfileHeader from '../../components/layout/ProfileHeader';
import MonthYearPicker from './MonthYearPicker';
import TaskBubble from './TaskBubble';
import Modal from '../../components/common/Modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius, commonStyles } from '../../theme';

// Import images
import leftArrow from '../../assets/images/left.png';

// Constants
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Screen dimensions for cell sizing
const screenWidth = Dimensions.get('window').width;
const cellSize = (screenWidth - 60) / 7;

const CalendarScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const [noTasksDate, setNoTasksDate] = useState(null);
  const today = new Date();
  const [currentYear, setYear] = useState(today.getFullYear());
  const [currentMonth, setMonth] = useState(today.getMonth());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Local state to organize tasks by date
  const [organizedTasks, setOrganizedTasks] = useState({});

  useEffect(() => {
    const fetchMonthTasks = async () => {
      try {
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        const fromDate = formatDateForApi(startDate);
        const toDate = formatDateForApi(endDate);

        await dispatch(
          fetchTasks({
            fromDate,
            toDate,
            includeCompleted: true,
          })
        );
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchMonthTasks();
  }, [currentYear, currentMonth, dispatch]);

  useEffect(() => {
    const todayDate = formatDateForApi(new Date());
    const tasksByDate = {};

    tasks.forEach((task) => {
      const isCompleted = task.status === 'COMPLETED' || task.completed;

      if (isCompleted) {
        const dateKey = task.completionDate?.split('T')[0] || todayDate;

        if (dateKey) {
          if (!tasksByDate[dateKey]) {
            tasksByDate[dateKey] = [];
          }
          tasksByDate[dateKey].push(task);
        }
      }
    });

    setOrganizedTasks(tasksByDate);
  }, [tasks]);

  const handleTaskClick = (day) => {
    const paddedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const dateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;

    const tasksForDate = getTasksForDay(day);

    if (tasksForDate.length === 0) {
      setNoTasksDate(dateStr);
    } else {
      AsyncStorage.setItem('selectedDate', dateStr).then(() => {
        navigation.navigate('CompletedTasks', { selectedDate: dateStr });
      });
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setMonth(11);
      setYear(currentYear - 1);
    } else {
      setMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setMonth(0);
      setYear(currentYear + 1);
    } else {
      setMonth(currentMonth + 1);
    }
  };

  const getTasksForDay = (day) => {
    const key = formatDateKey(currentYear, currentMonth, day);
    return organizedTasks[key] || [];
  };

  const getFirstDayOfMonth = () =>
    new Date(currentYear, currentMonth, 1).getDay();
    
  const getStartingDayOfWeek = () => {
    const firstDay = getFirstDayOfMonth();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startingDay = getStartingDayOfWeek();

  const isToday = (day) => {
    const currentDate = new Date();
    return (
      day === currentDate.getDate() &&
      currentMonth === currentDate.getMonth() &&
      currentYear === currentDate.getFullYear()
    );
  };

  const handleMonthYearSelect = (year, month) => {
    setYear(year);
    setMonth(month);
  };

  const renderCalendarGrid = () => {
    const cells = [];
    
    // Empty cells for the days before the 1st of the month
    for (let i = 0; i < startingDay; i++) {
      cells.push(
        <View key={`empty-${i}`} style={styles.calendarCell} />
      );
    }
    
    // Cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const taskList = getTasksForDay(day);
      const completedTasks = taskList.filter(
        (task) => task.status === 'COMPLETED' || task.completed
      );
      const hasCompletedTasks = completedTasks.length > 0;

      cells.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.calendarCell,
            isToday(day) && styles.todayCell
          ]}
          onPress={() => handleTaskClick(day)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.dayNumber,
            isToday(day) && styles.todayText
          ]}>
            {day}
          </Text>
          
          {/* {hasCompletedTasks && (
            <View style={styles.taskBubblesContainer}>
              {completedTasks.slice(0, 3).map((task, index) => (
                <TaskBubble 
                  key={index} 
                  isCompleted={true} 
                />
              ))}
              
              {completedTasks.length > 3 && (
                <Text style={styles.moreTasks}>+{completedTasks.length - 3}</Text>
              )}
            </View>
          )} */}
          
          {hasCompletedTasks && (
            <View style={styles.taskCount}>
              <Text style={styles.completedCount}>
                {completedTasks.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return cells;
  };

  return (
    <GradientBackground colors={gradientPresets.calendar}>
      <ScrollView style={styles.container}>
        <View style={styles.calendarPage}>
          <View style={styles.headerContainer}>
            <ProfileHeader />
          </View>

          <View style={styles.completedTasksTitle}>
            <Text style={styles.titleText}>Tasks Calendar</Text>
          </View>

          {error && <Text style={styles.errorMessage}>{error}</Text>}

          {/* No Tasks Modal */}
          <Modal
            visible={noTasksDate !== null}
            title="No Tasks"
            message={`No completed tasks for ${noTasksDate ? new Date(noTasksDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : ''}`}
            onClose={() => setNoTasksDate(null)}
            actions={[
              { title: 'OK', onPress: () => setNoTasksDate(null), variant: 'secondary' }
            ]}
          />

          <View style={styles.calendarBox}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                style={styles.navigationButton}
                onPress={prevMonth}
              >
                <Text style={styles.navButtonText}>◀</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setDatePickerVisible(true)}
                style={styles.monthYearButton}
              >
                <Text style={styles.monthYearText}>
                  {MONTHS[currentMonth]} {currentYear}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navigationButton}
                onPress={nextMonth}
              >
                <Text style={styles.navButtonText}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekdays}>
              {WEEKDAYS.map((day, i) => (
                <View key={i} style={styles.weekday}>
                  <Text style={styles.weekdayText}>{day}</Text>
                </View>
              ))}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={styles.loadingText}>Loading calendar...</Text>
              </View>
            ) : (
              <View style={styles.calendarGrid}>
                {renderCalendarGrid()}
              </View>
            )}
          </View>

          <View style={styles.backSection}>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
              <Image
                source={leftArrow}
                style={styles.backArrowImg}
              />
            </TouchableOpacity>
            <Text style={styles.footerTitle}>family planner</Text>
          </View>

          {/* Month/Year picker */}
          <MonthYearPicker
            visible={isDatePickerVisible}
            onClose={() => setDatePickerVisible(false)}
            onSelect={handleMonthYearSelect}
            initialYear={currentYear}
            initialMonth={currentMonth}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarPage: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    minHeight: '100%',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  completedTasksTitle: {
    backgroundColor: colors.accent,
    padding: spacing.xs,
    borderRadius: borderRadius.large,
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
    marginVertical: spacing.sm,
    ...commonStyles.shadow.light,
  },
  titleText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
  },
  calendarBox: {
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    padding: spacing.sm,
    width: '100%',
    maxWidth: 420,
    marginVertical: spacing.sm,
    ...commonStyles.shadow.light,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  navigationButton: {
    backgroundColor: '#b5e9ff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...commonStyles.shadow.light,
  },
  navButtonText: {
    fontSize: typography.fontSizes.md,
  },
  monthYearButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.small,
  },
  monthYearText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.dark,
  },
  weekdays: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  weekday: {
    width: cellSize,
    alignItems: 'center',
    padding: 4,
  },
  weekdayText: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
    color: colors.text.dark,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.text.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: spacing.xs,
  },
  calendarCell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.small,
    padding: spacing.xs,
    backgroundColor: 'white',
    margin: 2,
  },
  todayCell: {
    backgroundColor: '#e6f7ff',
    borderColor: '#0099ff',
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  todayText: {
    color: '#0099ff',
    fontWeight: typography.fontWeights.bold,
  },
  taskBubblesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  moreTasks: {
    fontSize: 8,
    color: colors.text.secondary,
    marginLeft: 2,
  },
  taskCount: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.card.taskCompleted,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
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
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  },
  errorMessage: {
    color: colors.status.error,
    textAlign: 'center',
    margin: spacing.sm,
  },
});

export default CalendarScreen;