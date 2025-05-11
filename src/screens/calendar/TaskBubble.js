import { View, StyleSheet } from "react-native";
import { colors } from "../../theme";

const TaskBubble = ({ isCompleted }) => {
  return (
    <View
      style={[styles.taskBubble, isCompleted && styles.completedTaskBubble]}
    />
  );
};

const styles = StyleSheet.create({
  taskBubble: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#b5e9ff",
    margin: 2,
  },
  completedTaskBubble: {
    backgroundColor: colors.card.taskCompleted,
  },
});

export default TaskBubble;
