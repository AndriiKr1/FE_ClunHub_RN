import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, spacing, borderRadius, typography, commonStyles } from '../../theme';

// Import images
import eyesIcon from '../../assets/images/eyes.png';
import checkmarkIcon from '../../assets/images/checkmark.png';
import cancelIcon from '../../assets/images/cancel.png';

const TaskItem = ({ 
  task, 
  onViewDetails,
  onComplete,
  onDelete,
  onEdit
}) => {
  const isOverdue = (deadline) => {
    if (!deadline) return false;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    
    return deadlineDate < today;
  };
  
  return (
    <View style={styles.taskRow}>
      <TouchableOpacity
        style={[
          styles.taskButton,
          isOverdue(task.deadline) && styles.overdueTask
        ]}
        onPress={() => onEdit(task)}
      >
        <Text style={styles.taskText} numberOfLines={1}>
          {task.name}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.taskIcons}>
        <TouchableOpacity onPress={() => onViewDetails(task)}>
          <Image source={eyesIcon} style={styles.icon} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => onComplete(task)}>
          <Image source={checkmarkIcon} style={styles.icon} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => onDelete(task)}>
          <Image source={cancelIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 44,
    marginBottom: spacing.xs,
  },
  taskButton: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    ...commonStyles.shadow.medium,
  },
  taskText: {
    fontSize: typography.fontSizes.md,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  overdueTask: {
    backgroundColor: colors.status.overdue,
    shadowColor: '#8b0000',
  },
  taskIcons: {
    flexDirection: 'row',
    height: 44,
    marginLeft: spacing.xs,
  },
  icon: {
    width: 44,
    height: 44,
    marginLeft: -10,
  },
});

export default TaskItem;