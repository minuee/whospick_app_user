import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet,Text,View,SafeAreaView,TouchableOpacity,KeyboardAvoidingView,Platform,ScrollView,UIManager,LayoutAnimation,Keyboard,} from 'react-native';

import scale from '../../common/Scale';
import {screenWidth, _chkEmail, _chkPwd, _chkPhone, logging} from '../../common/Utils';

import {Header, Button, Input, Icon} from 'react-native-elements';
import Modal from 'react-native-modal';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-simple-toast';
import {TabView} from 'react-native-tab-view';

import {Auth, AuthType} from '@psyrenpark/auth';
import {apiObject} from '../../common/API';

import LoadingContext from '../../Context/LoadingContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SignUp = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    let struserName = "";
    if ( props.route.params ) {
        if ( props.route.params.USER_NAME ) {
            struserName =  props.route.params.USER_NAME;
        }else if ( props.route.params.MYINFO.user_name ) {
            struserName =  props.route.params.MYINFO.user_name;
        }
    }
    const [inputData, setInputData] = useState({
        userEmail: props.route.params ? props.route.params.USER_EMAIL : '',
        confirmCode: '',
        userName : struserName,
        userPhone: props.route.params ? props.route.params.MYINFO.mobile_no : '',
        userBirth: props.route.params ? new Date(props.route.params.MYINFO.birth_dt * 1000) : new Date(),
        userPass: props.route.params ? props.route.params.USER_PASS : '',
        recommendCode: '',
        showPass: false,
        emailMessage: '',
        passMessage: '8자 이상의 영문, 숫자, 특수문자 조합',
        confirmCodeMessage: '',
        phoneMessage: '',
    });

    const [index, setIndex] = useState(props.route.params ? props.route.params.TAB_INDEX : 0);
    const [routes] = useState([
        {key: 'one', title: '이메일비밀번호'},
        {key: 'two', title: '인증번호'},
        {key: 'three', title: '추가정보'},
    ]);

    const [signUpProgress, setSignupProgress] = useState('33%');
    const [isModalBirthOpend, setIsModalBirthOpend] = useState(false);

    const _onSignUpProgress = async () => {
        Keyboard.dismiss();
        switch (index) {
            case 0:
                Auth.signUpProcess({
                    email: inputData.userEmail,
                    password: inputData.userPass,
                    authType: AuthType.EMAIL,
                    lang: 'ko',
                    cognitoRegComm: {
                        user_type: 'ACTOR',
                        signup_device: 'APP',
                    },
                },
                async success => {
                    setIndex(1);
                },
                error => {
                    console.log('error => 가입실패 : ', error);
                    setInputData({
                        ...inputData,
                        emailMessage: '이미 사용중인 이메일이거나 사용이 제한된 이메일입니다.',
                    });
                },
                loading => setIsLoading(loading)
                );
            break;
            case 1:
                Auth.confirmSignUpProcess({
                    email: inputData.userEmail,
                    password: inputData.userPass,
                    authType: AuthType.EMAIL,
                    code: inputData.confirmCode,
                },
                async success => {
                    setIndex(2);
                },
                error => {
                    setInputData({
                        ...inputData,
                        confirmCodeMessage: '인증번호가 올바르지 않습니다. 다시 입력해주세요.',
                    });
                    console.log('error => 인증실패 : ', error);
                },
                loading => setIsLoading(loading)
            );
            break;
            case 2:
                try {
                    const apiResult = await apiObject.applyUserInfo({
                        name: inputData.userName,
                        mobile_no: inputData.userPhone,
                        birth_dt: Math.floor(inputData.userBirth.getTime() / 1000),
                        referral_code: inputData.recommendCode,
                    },
                        loading => setIsLoading(loading)
                    );                
                    Toast.showWithGravity('환영합니다 :)\n다시 한 번 로그인 해주세요.', Toast.SHORT, Toast.CENTER);
                    props.navigation.goBack(null);
                } catch (error) {            
                    logging(error.response?.data, 'my-privacy');
                    Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
                }
            break;
        }
    };

    const _onCheckType = () => {
        switch (index) {
            case 0:
                return !(
                    inputData.userEmail !== '' &&
                    inputData.userPass !== '' &&
                    inputData.emailMessage === '' &&
                    inputData.passMessage === '8자 이상의 영문, 숫자, 특수문자 조합' &&
                    _chkEmail(inputData.userEmail) &&
                    _chkPwd(inputData.userPass)
                );
            case 1:
                return !(inputData.confirmCode.length === 6 && inputData.confirmCodeMessage === '');
            case 2:
                return !(inputData.userName !== '' && inputData.userPhone !== '' && _chkPhone(inputData.userPhone));
            default:
                return false;
        }
    };

    const renderTabs = ({route}) => {
        switch (route.key) {
            case 'one':
            return (
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
                    onChangeText={text => setInputData({...inputData, userEmail: text})}
                    value={inputData.userEmail}
                    errorMessage={inputData.emailMessage}
                    onBlur={() => {
                        if (!_chkEmail(inputData.userEmail)) {
                            setInputData({...inputData, emailMessage: '이메일 형식이 올바르지 않습니다.'});
                        }
                    }}
                    onFocus={() =>
                        setInputData({
                            ...inputData,
                            emailMessage: '',
                        })
                    }
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
                    secureTextEntry={!inputData.showPass}
                    rightIcon={{
                        name: !inputData.showPass ? 'eye-outline' : 'eye-off-outline',
                        type: 'material-community',
                        color: '#d4d4d4',
                        size: scale(25),
                        onPress: () => {
                            setInputData({...inputData, showPass: !inputData.showPass});
                        },
                    }}
                    onChangeText={text => setInputData({...inputData, userPass: text})}
                    value={inputData.userPass}
                    errorMessage={inputData.passMessage}
                    onBlur={() => {
                        if (!_chkPwd(inputData.userPass)) {
                            setInputData({
                                ...inputData,
                                passMessage: '비밀번호 형식이 올바르지 않습니다.\n8자 이상의 영문, 숫자, 특수문자 조합',
                            });
                        }
                    }}
                    onFocus={() =>
                        setInputData({
                            ...inputData,
                            passMessage: '8자 이상의 영문, 숫자, 특수문자 조합',
                        })
                    }
                />
            </ScrollView>
        );
        case 'two':
            return (
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
                        onChangeText={text => setInputData({...inputData, confirmCode: text})}
                        value={inputData.confirmCode}
                        errorMessage={inputData.confirmCodeMessage}
                        onFocus={() =>
                            setInputData({
                                ...inputData,
                                confirmCodeMessage: '',
                            })
                        }
                        onSubmitEditing={() => inputData.confirmCode.length === 6 && _onSignUpProgress()}
                    />
                </ScrollView>
            );
        case 'three':
            return (
                <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                    <Input
                        label={
                            <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold'}}>
                                이름
                                <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                            </Text>
                        }
                        labelStyle={{fontSize: scale(14), color: '#222222'}}
                        placeholder={'이름입력'}
                        inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                        inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
                        containerStyle={{paddingHorizontal: 0}}
                        onChangeText={text => setInputData({...inputData, userName: text})}
                        value={inputData.userName}
                    />
                    <Input
                        label={
                            <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold'}}>
                                핸드폰번호
                                <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                            </Text>
                        }
                        labelStyle={{fontSize: scale(14), color: '#222222'}}
                        placeholder={'핸드폰번호입력'}
                        inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                        inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
                        containerStyle={{paddingHorizontal: 0}}
                        errorMessage={
                            <Text style={{fontSize: scale(12), color: '#707070'}}>
                                <Text style={{color: '#e5293e', fontSize: scale(14)}}>! </Text>
                                <Text>연락처정보는 배우님을 선택한 감독에게만 노출됩니다.</Text>
                            </Text>
                        }
                        errorStyle={{marginBottom: scale(15)}}
                        keyboardType="phone-pad"
                        maxLength={11}
                        onChangeText={text => setInputData({...inputData, userPhone: text})}
                        value={inputData.userPhone}
                    />
                    <Text style={{fontSize: scale(14), color: '#222222', fontWeight: 'bold', marginBottom: scale(5)}}>
                        생년월일
                        <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                    </Text>
                    <View style={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', marginBottom: scale(20)}}>
                        <TouchableOpacity
                            style={{
                                ...styles.viewListBoxContainer,
                                borderColor: '#dddddd',
                                flexDirection: 'row',
                                justifyContent: 'space-evenly',
                                alignItems: 'center',
                            }}
                            onPress={() => setIsModalBirthOpend(true)}
                        >
                            <Text style={{fontSize: scale(16)}}>{`${inputData.userBirth.getFullYear()}년`}</Text>
                            <Icon name="ios-chevron-down" type="ionicon" />
                            <Text style={{fontSize: scale(16)}}>{`${inputData.userBirth.getMonth() + 1}월`}</Text>
                            <Icon name="ios-chevron-down" type="ionicon" />
                            <Text style={{fontSize: scale(16)}}>{`${inputData.userBirth.getDate()}일`}</Text>
                            <Icon name="ios-chevron-down" type="ionicon" />
                        </TouchableOpacity>
                    </View>
                    <Input
                        label={'추천인코드'}
                        labelStyle={{fontSize: scale(14), color: '#222222'}}
                        placeholder={'추천인코드입력'}
                        inputStyle={{padding: 15, borderRadius: scale(35), backgroundColor: '#e7ebed', fontSize: scale(14)}}
                        inputContainerStyle={{borderBottomWidth: 0, marginTop: scale(5)}}
                        containerStyle={{paddingHorizontal: 0}}
                        errorMessage={
                            <Text style={{fontSize: scale(12), color: '#707070'}}>
                                <Text style={{color: '#e5293e', fontSize: scale(14)}}>! </Text>
                                <Text>
                                자신의 추천인 코드를 입력하면 <Text style={{color: '#e5293e', fontWeight: 'bold'}}>50원</Text> 적립!
                                </Text>
                            </Text>
                        }
                        errorStyle={{marginBottom: scale(15)}}
                        onChangeText={text => setInputData({...inputData, recommendCode: text})}
                        value={inputData.recommendCode}
                    />
                </ScrollView>
            );
        }
    };

    useEffect(() => {
        switch (index) {
            case 1:
                setSignupProgress('66%');
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                break;
            case 2:
                setSignupProgress('100%');
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                break;
        }
    }, [index]);

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
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={{...styles.txtLabel}}>Sign Up</Text>
                        {
                            index === 2 && (
                            <Button
                                title="저장"
                                type="clear"
                                titleStyle={{color: '#e5293e'}}
                                disabled={_onCheckType()}
                                loading={isLoading}
                                loadingProps={{color: '#e5293e'}}
                                onPress={() => _onSignUpProgress()}
                            />
                        )}
                    </View>
                    <View style={{width: '100%', backgroundColor: '#e7ebed', height: scale(5), marginBottom: scale(25)}}>
                        <View style={{backgroundColor: '#e5293e', flex: 1, width: signUpProgress}} />
                    </View>
                    <TabView
                        swipeEnabled={false}
                        renderTabBar={() => null}
                        navigationState={{index, routes}}
                        renderScene={renderTabs}
                        onIndexChange={setIndex}
                    />
                    {
                        index !== 2 && (
                        <Button
                            title="NEXT"
                            titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                            disabled={_onCheckType()}
                            buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
                            onPress={() => _onSignUpProgress()}
                            loading={isLoading}
                        />
                    )}
                </View>
            </SafeAreaView>
        <Modal
            isVisible={isModalBirthOpend}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            onBackdropPress={() => setIsModalBirthOpend(false)}
            onBackButtonPress={() => setIsModalBirthOpend(false)}
            coverScreen={false}
            style={{justifyContent: 'flex-end', margin: 0}}
            statusBarTranslucent={true}
        >
            <SafeAreaView style={{maxHeight: scale(200), backgroundColor: 'white'}}>
                <DatePicker
                    date={inputData.userBirth}
                    mode="date"
                    style={{width: screenWidth}}
                    onDateChange={date => setInputData({...inputData, userBirth: date})}
                    maximumDate={new Date()}
                />
            </SafeAreaView>
        </Modal>
    </KeyboardAvoidingView>
    );
};

export default SignUp;

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
    viewFindPassArea: {
        paddingVertical: scale(20),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewModalContainer: {
        backgroundColor: 'white',
        borderRadius: scale(5),
        padding: scale(10),
        justifyContent: 'space-between',
    },
});
