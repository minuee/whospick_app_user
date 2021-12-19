import React, {useContext, useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  UIManager,
  LayoutAnimation,
  ScrollView,
  Keyboard,
} from 'react-native';

import scale from '../../common/Scale';

import {_chkPwd} from '../../common/Utils';

import {Button, Header, Input} from 'react-native-elements';
import {Tab, Tabs} from 'native-base';
import Toast from 'react-native-simple-toast';

import {Auth, AuthType} from '@psyrenpark/auth';

import LoadingContext from '../../Context/LoadingContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ResetPass = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);

  const [inputEmail, setInputEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [tabsIndex, setTabsIndex] = useState(0);
  const [signUpProgress, setSignupProgress] = useState('50%');

  const _onResetPassPress = async () => {
    Keyboard.dismiss();
    switch (tabsIndex) {
      case 0:
        Auth.forgotPasswordProcess(
          {
            email: inputEmail,
            authType: AuthType.EMAIL,
          },
          async data => {
            Toast.showWithGravity(`${inputEmail}\n이메일로 전송된 인증번호를 입력해주세요.`, Toast.SHORT, Toast.CENTER);
            setTabsIndex(1);
          },
          error => {
            console.log('_onResetPassPress -> error', error);
            Toast.show('정상적인 이메일인지 다시 확인해주세요.', Toast.SHORT);
          },
          loading => setIsLoading(loading)
        );
        break;

      case 1:
        Auth.confirmForgotPasswordProcess(
          {
            email: inputEmail,
            authType: AuthType.EMAIL,
            code: inputCode,
            newPassword: inputPass,
          },
          async data => {
            _globalSignOut();
          },
          error => {
            switch (error.code) {
              case 'CodeMismatchException':
                Toast.show('인증번호가 일치하지 않습니다.\n다시 입력해주세요.', Toast.SHORT);
                break;

              case 'LimitExceededException':
                Toast.show('인증 횟수를 초과했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
                break;
            }
          },
          loading => setIsLoading(loading)
        );
        break;
    }
  };

  const _globalSignOut = async () => {
    Auth.signOutProcess(
      {
        authType: AuthType.EMAIL,
      },
      async success => {
        Toast.showWithGravity('비밀번호를 초기화했습니다.\n다시 로그인해주세요.', Toast.SHORT, Toast.CENTER);
        props.navigation.goBack(null);
      },
      error => {
        console.log('_signOutPress -> error', error);
        Toast.showWithGravity('비밀번호를 초기화했습니다.\n다시 로그인해주세요.', Toast.SHORT, Toast.CENTER);
        props.navigation.goBack(null);
      }
    );
  };

  useEffect(() => {
    switch (tabsIndex) {
      case 1:
        setSignupProgress('100%');
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        break;
    }
  }, [tabsIndex]);

  return (
    <KeyboardAvoidingView style={{...styles.container}} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{
          translucent: true,
          backgroundColor: 'transparent',
          barStyle: 'dark-content',
          animated: true,
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <Text style={{...styles.txtLabel}}>Forgot Password</Text>
          <View style={{width: '100%', backgroundColor: '#e7ebed', height: scale(5), marginBottom: scale(25)}}>
            <View style={{backgroundColor: '#e5293e', flex: 1, width: signUpProgress}} />
          </View>
          <Tabs
            page={tabsIndex}
            onChangeTab={index => setTabsIndex(index.i)}
            tabContainerStyle={{height: 0, borderBottomWidth: 0}}
            tabBarUnderlineStyle={{height: 0}}
            tabBarActiveTextColor="transparent"
            tabBarInactiveTextColor="transparent"
            locked={true}>
            <Tab heading="이메일입력">
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <Input
                  label={'이메일'}
                  labelStyle={{fontSize: scale(14), color: '#222222'}}
                  placeholder={'이메일주소입력'}
                  inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                  inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
                  containerStyle={{paddingHorizontal: 0}}
                  maxLength={25}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={text => setInputEmail(text)}
                  value={inputEmail}
                />
              </ScrollView>
            </Tab>
            <Tab heading="인증번호및새비밀번호">
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <Input
                  label={'이메일 인증번호'}
                  labelStyle={{fontSize: scale(14), color: '#222222'}}
                  placeholder={'인증번호입력'}
                  inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                  inputContainerStyle={{
                    borderBottomWidth: 0,
                    marginTop: scale(5),
                    borderRadius: scale(35),
                    backgroundColor: '#e7ebed',
                    paddingRight: scale(10),
                  }}
                  containerStyle={{paddingHorizontal: 0}}
                  maxLength={6}
                  keyboardType="number-pad"
                  onChangeText={text => setInputCode(text)}
                  value={inputCode}
                />
                <Input
                  label={'비밀번호'}
                  labelStyle={{fontSize: scale(14), color: '#222222'}}
                  placeholder={'비밀번호입력'}
                  inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                  inputContainerStyle={{
                    borderBottomWidth: 0,
                    marginTop: scale(5),
                    borderRadius: scale(35),
                    backgroundColor: '#e7ebed',
                    paddingRight: scale(10),
                  }}
                  containerStyle={{paddingHorizontal: 0}}
                  maxLength={16}
                  errorMessage="8~16자의 영문, 숫자, 특수문자 조합"
                  secureTextEntry={!showPass}
                  rightIcon={{
                    name: !showPass ? 'eye-outline' : 'eye-off-outline',
                    type: 'material-community',
                    color: '#d4d4d4',
                    size: scale(25),
                    onPress: () => setShowPass(!showPass),
                  }}
                  onChangeText={text => setInputPass(text)}
                  value={inputPass}
                />
              </ScrollView>
            </Tab>
          </Tabs>
          <Button
            title={tabsIndex ? 'RESET' : 'NEXT'}
            titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
            disabled={tabsIndex === 1 ? !_chkPwd(inputPass) : false}
            buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
            onPress={() => _onResetPassPress()}
            loading={isLoading}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ResetPass;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    flex: 1,
    paddingHorizontal: scale(25),
    paddingBottom: scale(25),
  },
  txtLabel: {
    fontSize: scale(30),
    fontWeight: 'bold',
    color: '#e5293e',
    marginBottom: scale(10),
  },
});
