import React from 'react';
import {createStackNavigator, CardStyleInterpolators, TransitionPresets} from '@react-navigation/stack';

import AuthMain from './auth/AuthMain';
import SignUp from './auth/SignUp';
import ResetPass from './auth/ResetPass';

import TOS from './app/TOS';
import PP from './app/PP';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="AuthMain" screenOptions={{headerShown: false}}>
      <Stack.Screen name="AuthMain" component={AuthMain} />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ResetPass"
        component={ResetPass}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="TOS"
        component={TOS}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="PP"
        component={PP}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
