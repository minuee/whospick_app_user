import React, {useState} from 'react';
import UserTokenContext from '../Context/UserTokenContext';

// import * as Keychain from 'react-native-keychain';

const UserTokenProvider = ({children}) => {
  const setIsSessionAlive = bool => {
    setUser(prevState => {
      return {
        ...prevState,
        isSessionAlive: bool,
      };
    });
  };

  const setUserInfo = data => {
    setUser(prevState => {
      return {
        ...prevState,
        ...data,
      };
    });
  };

  const resetUserInfo = async () => {
    // await Keychain.resetInternetCredentials('auth').then(setUser(initialState));
    setUser(initialState);
  };

  const initialState = {
    isSessionAlive: false,
    userEmail: '',
    userImage: '',
    userImageNo: '',
    userName: '',
    userPhone: '',
    isActor: false,
    isDirector: false,
    userPoint: 0,
    userCode: '',
    haveProfile: false,
    isNewPush: false,
    actorInfo: {
      actorType: {},
      actorImage: [],
      actorName: '',
      actorDesc: '',
      actorHeight: 0,
      actorWeight: 0,
      actorBirth: '',
      actorSex: '',
      actorKeyword: [],
      topSize: 0,
      bottomSize: 0,
      footSize: 0,
      lastSchool: '',
      major: '',
      specialty: '',
      agency: false,
      careerHistory: [],
      tagList: [],
      videoUrl: '',
      snsUrl: {
        facebook: '',
        instagram: '',
        twitter: '',
      },
      actorSongType: {id: '', name: ''},
    },
    setIsSessionAlive,
    setUserInfo,
    resetUserInfo,
  };

  const [user, setUser] = useState(initialState);

  return <UserTokenContext.Provider value={user}>{children}</UserTokenContext.Provider>;
};

export default UserTokenProvider;
