import { createStackNavigator } from "@react-navigation/stack";

import DashboardScreen from "../screens/tasks/DashboardScreen";
import AddTaskScreen from "../screens/tasks/AddTaskScreen";
import CalendarScreen from "../screens/calendar/CalendarScreen";
import CompletedTasksScreen from "../screens/tasks/CompletedTasksScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="CompletedTasks" component={CompletedTasksScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
