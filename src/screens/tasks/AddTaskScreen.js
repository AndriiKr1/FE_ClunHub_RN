import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import GradientBackground, { gradientPresets } from '../../components/layout/GradientBackground';
import Modal from '../../components/common/Modal';
import CustomDatePicker from './CustomDatePicker';
import ProfileHeader from '../../components/layout/ProfileHeader';
import { colors, spacing, typography, borderRadius, commonStyles } from '../../theme';
import { useForm } from '../../hooks/useForm';

// Import images
import leftIcon from '../../assets/images/left.png';
import checkmarkIcon from '../../assets/images/checkmark1.png';

const AddTaskScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { taskToEdit, isEditing } = route.params || {};

  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Use the form hook
  const validateTaskForm = (values) => {
    const errors = {};
    
    if (!values.taskName.trim()) {
      errors.taskName = 'Please enter task name';
    } else if (values.taskName.length > 30) {
      errors.taskName = 'Task name cannot exceed 30 characters';
    }
    
    // Deadline validation happens when selecting a date
    
    if (values.description && values.description.length > 100) {
      errors.description = 'Description cannot exceed 100 characters';
    }
    
    return errors;
  };
  
  const { 
    values, 
    errors, 
    handleChange, 
    validateForm, 
    setFieldValue,
    setFieldError 
  } = useForm(
    { 
      taskName: '',
      description: ''
    }, 
    validateTaskForm
  );

  useEffect(() => {
    if (isEditing && taskToEdit) {
      setFieldValue('taskName', taskToEdit.name);
      
      if (taskToEdit.deadline) {
        const dateValue = new Date(taskToEdit.deadline);
        setDeadline(dateValue);
      }
      
      setFieldValue('description', taskToEdit.description || '');
    }
  }, [isEditing, taskToEdit]);

  const handleBack = () => navigation.navigate('Dashboard');
    
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateSelect = (selectedDate) => {
    setDeadline(selectedDate);
    
    // Check for past date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setFieldError('deadline', 'Deadline cannot be in the past');
    } else {
      setFieldError('deadline', '');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Check for past date
    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setFieldError('deadline', 'Deadline cannot be in the past');
      return;
    }
    
    try {
      const formattedDeadline = formatDate(deadline);

      if (isEditing && taskToEdit) {
        await dispatch(updateTask({
          taskId: taskToEdit.id,
          taskData: {
            name: values.taskName,
            description: values.description,
            deadline: formattedDeadline
          },
          email: user.email
        })).unwrap();
      } else {
        await dispatch(createTask({
          name: values.taskName,
          description: values.description,
          deadline: formattedDeadline
        })).unwrap();
      }
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving task:', error);
      setFieldError('submit', error);
    }
  };

  const handleOk = () => {
    setShowSuccess(false);
    navigation.navigate('Dashboard');
  };

  return (
    <GradientBackground colors={gradientPresets.addTask}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.addTaskContainer}>
            <ProfileHeader />

            <View style={styles.contentWrapper}>
              <TextInput
                style={[
                  styles.taskTitleInput,
                  errors.taskName ? styles.errorInput : {}
                ]}
                value={values.taskName}
                onChangeText={(text) => handleChange('taskName', text)}
                placeholder={isEditing ? 'Edit task name' : 'Enter task name'}
              />
              {errors.taskName ? (
                <Text style={styles.errorMessage}>{errors.taskName}</Text>
              ) : null}

              <View style={styles.taskForm}>
                <View style={styles.deadlineContainer}>
                  <Text style={styles.deadlineLabel}>Deadline:</Text>
                  <TouchableOpacity 
                    style={[
                      styles.dateInput,
                      errors.deadline ? styles.errorInput : {}
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDisplayDate(deadline)}
                    </Text>
                  </TouchableOpacity>
                  {errors.deadline ? (
                    <Text style={styles.errorMessage}>{errors.deadline}</Text>
                  ) : null}
                </View>

                <TextInput
                  style={[
                    styles.descriptionInput,
                    errors.description ? styles.errorInput : {}
                  ]}
                  value={values.description}
                  onChangeText={(text) => handleChange('description', text)}
                  placeholder="Enter task description..."
                  multiline={true}
                  numberOfLines={6}
                />
                {errors.description ? (
                  <Text style={styles.errorMessage}>{errors.description}</Text>
                ) : null}

                <View style={styles.actionButtonsContainer}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={handleBack}>
                      <Image
                        source={leftIcon}
                        style={styles.leftIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                      <Image
                        source={checkmarkIcon}
                        style={styles.checkmarkIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Success Modal */}
            <Modal
              visible={showSuccess}
              title={`Task "${values.taskName}" ${isEditing ? "updated" : "added"} successfully!`}
              onClose={handleOk}
              actions={[
                { title: 'OK', onPress: handleOk, variant: 'secondary' }
              ]}
            />

            {/* Custom Date Picker */}
            <CustomDatePicker
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onSelect={handleDateSelect}
              initialDate={deadline}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>family planner</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  addTaskContainer: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 70, 
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  taskTitleInput: {
    width: '100%',
    padding: spacing.md,
    marginVertical: spacing.lg,
    backgroundColor: colors.secondary,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.round,
    fontSize: typography.fontSizes.lg,
    letterSpacing: typography.letterSpacing.wide,
    textAlign: 'center',
    fontWeight: typography.fontWeights.bold,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 3,
  },
  taskForm: {
    width: '100%',
    marginVertical: spacing.sm,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  deadlineLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  dateInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...commonStyles.shadow.light,
  },
  dateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  descriptionInput: {
    width: '100%',
    minHeight: 200,
    padding: spacing.md,
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    fontSize: typography.fontSizes.md,
    textAlignVertical: 'top',
    ...commonStyles.shadow.light,
    marginBottom: 1,
  },
  actionButtonsContainer: {
    width: '100%',
    position: 'relative',
    marginTop: 0,
    height: 140,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    height: '100%',
  },
  leftIcon: {
    width: 80,
    height: 80,
    position: 'absolute',
    left: 0,
    top: 90,
  },
  submitButton: {
    position: 'absolute',
    left: '50%',
    top: 20,
  },
  checkmarkIcon: {
    width: 100,
    height: 100,
    transform: [{ translateX: -50 }],
  },
  errorInput: {
    borderWidth: 2,
    borderColor: colors.status.error,
  },
  errorMessage: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.wide,
  }
});

export default AddTaskScreen;