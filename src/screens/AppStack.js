import React, {useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';

import {createStackNavigator, CardStyleInterpolators, TransitionPresets} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';

import FastImage from 'react-native-fast-image';

import AppMain from './app/home/AppMain';

import AuditionMain from './app/audition/AuditionMain';

import ActorMain from './app/actor/ActorMain';
import ActorList from './app/actor/ActorList';

import PartnerMain from './app/partner/PartnerMain';

import AuditionFilter from './app/AuditionFilter';
import Search from './app/Search';
import SearchList from './app/SearchList';
import ActorDetail from './app/actor/ActorDetail';

import CustomDrawer from './app/drawer/CustomDrawer';
import TabEditUser from './app/drawer/TabEditUser';
import QnA from './app/drawer/QnA';
import QnAWrite from './app/drawer/QnAWrite';
import Notice from './app/drawer/Notice';
import DirectorPick from './app/drawer/DirectorPick';
import DirectorPickAudition from './app/drawer/DirectorPickAudition';
import Notification from './app/drawer/Notification';
import FAQ from './app/drawer/FAQ';
import ApplyAudition from './app/drawer/ApplyAudition';
import TabAuditionDetail from './app/audition/TabAuditionDetail';
import TabLikeList from './app/drawer/TabLikeList';
import ActorRegister from './app/actor/ActorRegister';
import PartnerDetail from './app/partner/PartnerDetail';
import ProfileReview from './app/drawer/ProfileReview';
import ProfileReviewDetail from './app/drawer/ProfileReviewDetail';
import MyPoint from './app/drawer/MyPoint';
import PointUsedHistory from './app/drawer/PointUsedHistory';
import PointBuyHistory from './app/drawer/PointBuyHistory';
import BuyPoint from './app/drawer/BuyPoint';
import PointRefundHistory from './app/drawer/PointRefundHistory';
import PointSaveUpHistory from './app/drawer/PointSaveUpHistory';
import Payment from './app/drawer/Payment';

import TOS from './app/TOS';
import PP from './app/PP';

import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName={'AppMain'} headerMode="none">
      <Stack.Screen name="AppMain" component={AppMain} />
    </Stack.Navigator>
  );
};

const AuditionStack = () => {
  return (
    <Stack.Navigator initialRouteName={'AuditionMain'} headerMode="none">
      <Stack.Screen name="AuditionMain" component={AuditionMain} />
    </Stack.Navigator>
  );
};

const ActorStack = () => {
  return (
    <Stack.Navigator initialRouteName={'ActorMain'} headerMode="none">
      <Stack.Screen name="ActorMain" component={ActorMain} />
      <Stack.Screen
        name="ActorList"
        component={ActorList}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
    </Stack.Navigator>
  );
};

const PartnerStack = () => {
  return (
    <Stack.Navigator initialRouteName={'PartnerMain'} headerMode="none">
      <Stack.Screen name="PartnerMain" component={PartnerMain} />
    </Stack.Navigator>
  );
};

const mainRoutes = [
  {
    stackName: 'HomeStack',
    tabBarLabel: 'HOME',
    tabBarComponent: HomeStack,
    inactiveIcon: require('../../assets/images/drawable-xxxhdpi/home.png'),
    activeIcon: require('../../assets/images/drawable-xxxhdpi/home_active.png'),
  },
  {
    stackName: 'AuditionStack',
    tabBarLabel: '오디션공고',
    tabBarComponent: AuditionStack,
    inactiveIcon: require('../../assets/images/drawable-xxxhdpi/audition.png'),
    activeIcon: require('../../assets/images/drawable-xxxhdpi/auditio_active.png'),
  },
  {
    stackName: 'ActorStack',
    tabBarLabel: '배우검색',
    tabBarComponent: ActorStack,
    inactiveIcon: require('../../assets/images/drawable-xxxhdpi/actor.png'),
    activeIcon: require('../../assets/images/drawable-xxxhdpi/actor_active.png'),
  },
  {
    stackName: 'PartnerStack',
    tabBarLabel: '제휴업체',
    tabBarComponent: PartnerStack,
    inactiveIcon: require('../../assets/images/drawable-xxxhdpi/partner.png'),
    activeIcon: require('../../assets/images/drawable-xxxhdpi/partner_active.png'),
  },
];

const TabStack = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // 앱이 살아있는 상태에서 알림을 눌렀을 때
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('알림 클릭했을 때 실행 : ', remoteMessage);
      switch (remoteMessage.data.link) {
        case 'NO':
          break;

        case 'FULL_AUDITION':
          navigation.navigate('AuditionStack');
          break;

        case 'PROFILE_EDIT':
          navigation.navigate('TabEditUser');
          break;

        case 'DIBS_ME_DIRECTOR':
          navigation.navigate('DirectorPick');
          break;

        case 'ACTOR_SEARCH_PAGE':
          navigation.navigate('ActorStack');
          break;

        case 'POINT':
          navigation.navigate('MyPoint');
          break;

        case 'AUDITION':
          navigation.navigate('TabAuditionDetail', {
            HEADER: '새로운 오디션',
            audition_no: remoteMessage.data.audition_no,
          });
          break;

        case 'EVAL':
          navigation.navigate('ProfileReview');
          break;

        case 'QNA_NO':
          navigation.navigate('QnA');
          break;

        default:
          break;
      }
    });

    // 앱이 죽어있는 상태에서 알림을 눌렀을 때
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('(죽음)알림 클릭했을 때 실행 : ', remoteMessage);
          switch (remoteMessage.data.link) {
            case 'NO':
              break;

            case 'FULL_AUDITION':
              navigation.navigate('AuditionStack');
              break;

            case 'PROFILE_EDIT':
              navigation.navigate('TabEditUser');
              break;

            case 'DIBS_ME_DIRECTOR':
              navigation.navigate('DirectorPick');
              break;

            case 'ACTOR_SEARCH_PAGE':
              navigation.navigate('ActorStack');
              break;

            case 'POINT':
              navigation.navigate('MyPoint');
              break;

            case 'AUDITION':
              navigation.navigate('TabAuditionDetail', {
                HEADER: '새로운 오디션',
                audition_no: remoteMessage.data.audition_no,
              });
              break;

            case 'EVAL':
              navigation.navigate('ProfileReview');
              break;

            case 'QNA_NO':
              navigation.navigate('QnA');
              break;

            default:
              break;
          }
        }
      });
  }, []);

  return (
    <BottomTab.Navigator
      initialRouteName="HOME"
      backBehavior="none"
      tabBarOptions={{activeTintColor: '#e5293e', keyboardHidesTabBar: true}}>
      {mainRoutes.map(route => (
        <BottomTab.Screen
          key={`tab_${route.stackName}`}
          name={route.stackName}
          component={route.tabBarComponent}
          options={{
            tabBarLabel: route.tabBarLabel,
            tabBarIcon: ({focused}) => (
              <FastImage
                source={focused ? route.activeIcon : route.inactiveIcon}
                style={{width: 20, height: 20}}
                resizeMode={FastImage.resizeMode.contain}
              />
            ),
          }}
        />
      ))}
    </BottomTab.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="TabStack"
      headerMode="none"
      screenOptions={{
        cardOverlayEnabled: true,
        // cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS, // 페이지 전환 효과
        // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
      }}>
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen
        name="AuditionFilter"
        component={AuditionFilter}
        options={{...TransitionPresets.ModalPresentationIOS}}
      />
      <Stack.Screen name="ActorDetail" component={ActorDetail} options={{...TransitionPresets.ModalPresentationIOS}} />
      <Stack.Screen name="Search" component={Search} options={{...TransitionPresets.ModalPresentationIOS}} />
      <Stack.Screen name="SearchList" component={SearchList} options={{...TransitionPresets.ModalPresentationIOS}} />
      <Stack.Screen
        name="TabEditUser"
        component={TabEditUser}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="QnA"
        component={QnA}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="QnAWrite"
        component={QnAWrite}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="Notice"
        component={Notice}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="TabAuditionDetail"
        component={TabAuditionDetail}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="DirectorPick"
        component={DirectorPick}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="DirectorPickAudition"
        component={DirectorPickAudition}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQ}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="ApplyAudition"
        component={ApplyAudition}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="TabLikeList"
        component={TabLikeList}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="ActorRegister"
        component={ActorRegister}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="PartnerDetail"
        component={PartnerDetail}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="ProfileReview"
        component={ProfileReview}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="ProfileReviewDetail"
        component={ProfileReviewDetail}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="MyPoint"
        component={MyPoint}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="PointUsedHistory"
        component={PointUsedHistory}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="PointBuyHistory"
        component={PointBuyHistory}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="BuyPoint"
        component={BuyPoint}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="PointRefundHistory"
        component={PointRefundHistory}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="PointSaveUpHistory"
        component={PointSaveUpHistory}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="Payment"
        component={Payment}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="TOS"
        component={TOS}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
      <Stack.Screen
        name="PP"
        component={PP}
        options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainStack"
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        // ...(Platform.OS === 'android' ? {swipeEnabled: false} : {swipeEnabled: true}),
        swipeEnabled: false,
      }}>
      <Stack.Screen name="MainStack" component={MainStack} />
    </Drawer.Navigator>
  );
};

export default AppStack;
