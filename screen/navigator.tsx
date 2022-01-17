import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Chat/Home';
import AuthenVoiceScreen from './AuthenVoice';
import AddVoice from './AuthenVoice/AddVoice';
import AppContextProvider from './app-context/AppContextProvider';

const Stack = createNativeStackNavigator();

const MyStack = () => {
    return (
        <AppContextProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName={'AuthenVoice'}
                    screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                    />
                    <Stack.Screen
                        name="AddVoice"
                        component={AddVoice}
                    />
                    <Stack.Screen name="AuthenVoice" component={AuthenVoiceScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </AppContextProvider>
    );
};

export default MyStack