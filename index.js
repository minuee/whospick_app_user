import 'react-native-gesture-handler';

import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import LoadingProvider from './src/Provider/LoadingProvider';
import UserTokenProvider from './src/Provider/UserTokenProvider';

import {Auth} from '@psyrenpark/auth';
import {Api} from '@psyrenpark/api';
import {Storage} from '@psyrenpark/storage';
import awsmobile from './aws-exports';

Auth.setConfigure(awsmobile);
Api.setConfigure(awsmobile);
Storage.setConfigure(awsmobile);

const index = () => {
  return (
    <LoadingProvider>
      <UserTokenProvider>
        <App />
      </UserTokenProvider>
    </LoadingProvider>
  );
};

AppRegistry.registerComponent(appName, () => index);
