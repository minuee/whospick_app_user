import {useEffect, useCallback} from 'react';
import {Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {apiObject} from './API';

const FCMContainer = ({children}) => {
    const _registerToken = async fcmToken => {
    try {
        await apiObject.applyPushToken({
            token_value: fcmToken,
        });
    } catch (error) {
        console.log('ERROR: _registerToken');
        console.log(error.response.data);
    }
};

const _updateTokenToServer = useCallback(async () => {
    try {
        const fcmToken = await messaging().getToken();
        //console.log(fcmToken);
        _registerToken(fcmToken);
    } catch (error) {
        //console.log('ERROR: _updateTokenToServer');
        console.log(error);
    }
}, []);

const _requestPermission = useCallback(async () => {
    try {
        // User has authorised
        await messaging().requestPermission();
        await _updateTokenToServer();
    } catch (error) {
        // User has rejected permissions
        console.log("you can't handle push notification");
    }
}, [_updateTokenToServer]);

const _checkPermission = useCallback(async () => {
    try {
        const enabled = await messaging().hasPermission();
        if (enabled !== -1) {
            // user has permissions
            _updateTokenToServer();
        } else {
            // user doesn't have permission
            _requestPermission();
        }
    } catch (error) {
        console.log('ERROR: _checkPermission', error);
        console.log(error);
    }
}, [_updateTokenToServer, _requestPermission]);

useEffect(() => {
    _checkPermission();
    // 앱이 살아있는 상태에서 알림을 눌렀을 때
    messaging().onNotificationOpenedApp(async remoteMessage => {
        console.log('알림 클릭했을 때 실행 : ', remoteMessage);
    });

    // 앱이 죽어있는 상태에서 알림을 눌렀을 때
    messaging()
    .getInitialNotification()
    .then(remoteMessage => {
        if (remoteMessage) {
            console.log('(죽음)알림 클릭했을 때 실행 : ', remoteMessage);
        }
    });

    // 포그라운드 알림
    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   console.log(remoteMessage);
    //   Alert.alert(
    //     remoteMessage.notification.title,
    //     remoteMessage.notification.body,
    //     [
    //       {
    //         text: '확인',
    //         style: 'cancel',
    //       },
    //     ],
    //     {cancelable: false}
    //   );
    // });

    // return unsubscribe;
}, [_checkPermission]);

return children;
};

export default FCMContainer;
