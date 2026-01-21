import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManagerDashboard from '../screens/manager/Dashboard';
import SitesMaterialsScreen from '../screens/manager/SitesMaterialsScreen';
import AllocationsScreen from '../screens/manager/AllocationsScreen';
import ApprovalsScreen from '../screens/manager/ApprovalsScreen';
import SiteExpensesScreen from '../screens/manager/SiteExpensesScreen';

import AddSupervisorScreen from '../screens/manager/AddSupervisorScreen';

const Stack = createNativeStackNavigator();

const ManagerStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} options={{ title: 'Manager Dashboard' }} />
            <Stack.Screen name="SitesMaterials" component={SitesMaterialsScreen} options={{ title: 'Sites & Materials' }} />
            <Stack.Screen name="Allocations" component={AllocationsScreen} options={{ title: 'Allocations' }} />
            <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
            <Stack.Screen name="AddSupervisor" component={AddSupervisorScreen} options={{ title: 'Add Supervisor' }} />
            <Stack.Screen name="SiteExpenses" component={SiteExpensesScreen} options={{ title: 'Site Expenses' }} />
        </Stack.Navigator>
    );
};

export default ManagerStack;
