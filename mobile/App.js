import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AddDriverScreen from './src/screens/AddDriverScreen';
import DriverDashboardScreen from './src/screens/DriverDashboardScreen';
import EditUserScreen from './src/screens/EditUserScreen';
import LoginScreen from './src/screens/LoginScreen';
import NewTripScreen from './src/screens/NewTripScreen';
import TripHistoryScreen from './src/screens/TripHistoryScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DriverDashboardScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="AddDriver" component={AddDriverScreen} />
        <Stack.Screen name="EditUser" component={EditUserScreen} />
        <Stack.Screen name="NewTrip" component={NewTripScreen} />
        <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
