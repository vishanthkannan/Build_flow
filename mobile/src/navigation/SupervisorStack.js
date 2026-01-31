import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SupervisorDashboard from '../screens/supervisor/Dashboard';
import AddExpenseScreen from '../screens/supervisor/AddExpenseScreen';
import ActivityScreen from '../screens/supervisor/ActivityScreen';
import AttendanceScreen from '../screens/supervisor/AttendanceScreen';
import SitesMaterialsScreen from '../screens/manager/SitesMaterialsScreen';

const Stack = createNativeStackNavigator();

const SupervisorStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="SupervisorHome" component={SupervisorDashboard} options={{ title: 'Dashboard' }} />
            <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
            <Stack.Screen name="Activity" component={ActivityScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="SitesMaterials" component={SitesMaterialsScreen} options={{ title: 'Materials' }} />
        </Stack.Navigator>
    );
};

export default SupervisorStack;
