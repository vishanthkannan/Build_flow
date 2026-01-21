import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import ManagerStack from './ManagerStack';
import SupervisorStack from './SupervisorStack';

const Stack = createNativeStackNavigator();

const AppNav = () => {
    const { isLoading, user, splashLoading } = useContext(AuthContext);

    if (splashLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user ? (
                    user.role === 'manager' ? (
                        <Stack.Screen name="ManagerStack" component={ManagerStack} options={{ headerShown: false }} />
                    ) : (
                        <Stack.Screen name="SupervisorStack" component={SupervisorStack} options={{ headerShown: false }} />
                    )
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNav;
