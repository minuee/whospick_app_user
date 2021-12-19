import React, {useContext, useRef, useState} from 'react';
import {Alert,Platform,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View,} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import {Avatar, Accessory, Icon, Button, Input} from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import Modal from 'react-native-modal';

import scale from '../../../common/Scale';
import {isEmpty, isSNS, logging, replaceEmail, _chkPwd} from '../../../common/Utils';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

import {Auth, AuthType} from '@psyrenpark/auth';
import {apiObject, IMAGE_URL} from '../../../common/API';
import {Storage} from '@psyrenpark/storage';
import AsyncStorage from '@react-native-community/async-storage';

const EditUserInfo = ({parentsProps}) => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const {userEmail, userName, userPhone, userImage, userImageNo, setUserInfo, resetUserInfo} = useContext(UserTokenContext);
    const refInputNewPass = useRef(null);
    const [modalChangePassVisible, setModalChangePassVisible] = useState(false);
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [showPass, setShowPass] = useState(false);

    const [userInfo, setUserInfoLocal] = useState({
        email: userEmail,
        name: userName,
        tel: userPhone,
        image: userImage,
    });

    const options = {
        title: '사진 촬영 & 선택',
        cancelButtonTitle: '취소',
        takePhotoButtonTitle: '사진 촬영',
        chooseFromLibraryButtonTitle: '사진 선택',
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        storageOptions: {
            skipBackup: true,
            path: 'images',
        },
        ...(!isEmpty(userImage) && {customButtons: [{name: 'resetProfileImage', title: '기본 이미지로 변경'}]}),
    };

    const _onImagePicker = () => {
        ImagePicker.showImagePicker(options, async image => {
            const userId = userEmail.split('@')[0];
            if (image.didCancel) {
            } else if (image.customButton === 'resetProfileImage') {
                setUserInfoLocal({...userInfo, image: ''});
            } else if (image.error) {
                Alert.alert(
                    '[안내]',
                    '사진을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
                    [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
                    {cancelable: false}
                );
            } else {
                const result = await fetch(image.uri);
                const blob = await result.blob();
                let fileName = blob._data.name;
                let extensionName = fileName.split('.')[1];
                let now_timestamp = Math.floor(new Date().getTime() / 1000);
                fileName = `${userId}_${now_timestamp}.${extensionName}`;
                try {
                    const storageUrl = await Storage.put({
                        key: `profile/${fileName}`,
                        object: blob,
                        config: {
                            contentType: 'image',
                        },
                    },
                    loading => setIsLoading(loading)
                    );
                    setUserInfoLocal({...userInfo, image: `${IMAGE_URL}${storageUrl.key}`});
                } catch (error) {
                    Alert.alert(
                        '[안내]',
                        '사진을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
                        [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
                        {cancelable: false}
                    );
                    setUserInfoLocal({...userInfo, image: userImage});
                }
            }
        });
    };

    const _onEditUserInfo = async () => {
        try {
            if (userImage !== userInfo.image) {
                if (userInfo.image !== '') {
                    const imageUploadResult = await apiObject.imageUpload({url: userInfo.image,},loading => setIsLoading(loading));
                    const apiResult = await apiObject.editUserInfo({
                        name: userInfo.name,
                        mobile_no: userInfo.tel,
                        profile_image_no: imageUploadResult.image_no,
                    });
                    console.log('_onEditUserInfo -> apiResult: ', apiResult.success);
                    setUserInfo({
                        userImage: userInfo.image,
                        userImageNo: imageUploadResult.image_no,
                        userName: userInfo.name,    
                        userPhone: userInfo.tel,
                    });
                } else {
                    const apiResult = await apiObject.editUserInfo({
                        name: userInfo.name,
                        mobile_no: userInfo.tel,
                        profile_image_no: null,
                    });
                    setUserInfo({
                        userImage: userInfo.image,
                        userImageNo: '',
                        userName: userInfo.name,
                        userPhone: userInfo.tel,
                    });
                }
            } else {
                const apiResult = await apiObject.editUserInfo({
                    name: userInfo.name,
                    mobile_no: userInfo.tel,
                    profile_image_no: userImageNo,
                });
                setUserInfo({
                    userName: userInfo.name,
                    userPhone: userInfo.    tel,
                }); 
            }
            Toast.showWithGravity('회원정보가 수정되었습니다.', Toast.SHORT, Toast.CENTER);
        } catch (error) {
            logging(error.response?.data, 'image||my-privacy');
            Alert.alert(
                '[안내]',
                '사진을 처리하는 도중 에러가 발생했습니다.\n다시 시도해 주세요.',
                [{text: '확인', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
                {cancelable: false}
            );
            setUserInfoLocal({...userInfo, image: userImage});
        }
    };

    const _onChangePassPress = async () => {
        Auth.changePasswordProcess({
            email: userEmail,
            authType: AuthType.EMAIL,
            oldPassword: oldPass,
            newPassword: newPass,
        },
        async data => {
            Toast.showWithGravity('회원정보가 수정되었습니다.', Toast.SHORT, Toast.CENTER);
            setOldPass('');
            setNewPass('');
            setModalChangePassVisible(false);
        },
        error => {
            console.log(error.code);
            switch (error.code) {
                case 'NotAuthorizedException':
                    Toast.show('현재 비밀번호가 틀렸습니다.\n다시 입력해주세요.', Toast.SHORT);
                    break;  
                case 'SamePasswordException':
                    Toast.show('현재 비밀번호와 새 비밀번호가 같습니다.\n다시 입력해주세요.', Toast.SHORT);
                    break;
                default:
                    logging(error.response?.data, 'changePasswordProcess');
                    Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
                    break;
            }
        },
        loading => setIsLoading(loading)
        );
    };

    const _onDeleteUser = async () => {
        try {
            await apiObject.deleteUser();
            _signOutPress();
        } catch (error) {
            console.log('_onDeleteUser -> error: ', error);
        }
    };

    const _onDeleteUserPressLast = () => {
        Alert.alert('[안내]', '해당 작업은 되돌릴 수 없습니다.\n\n정말 회원탈퇴를 할까요?', [
        {
            text: '취소',
            style: 'cancel',
        },
        {
            text: '탈퇴하기',
            style: 'destructive',
            onPress: () => _onDeleteUser(),
        },
        ]);
    };

    const _onDeleteUserPress = () => {
        Alert.alert('[안내]', '정말 회원탈퇴를 할까요?', [
        {
            text: '취소',
            style: 'cancel',
        },
        {
            text: '탈퇴하기',
            style: 'destructive',
            onPress: () => _onDeleteUserPressLast(),
        },
        ]);
    };

    const _signOutPress = async () => {
        Auth.signOutProcess(
        {
            authType: AuthType.EMAIL,
        },
        async success => {
            await AsyncStorage.removeItem('@whosPick_SearchFilter_Actor');
            Toast.showWithGravity('탈퇴되었습니다.\n이용해주셔서 감사합니다.', Toast.SHORT, Toast.CENTER);
            resetUserInfo();
        },
        error => {
            console.log('_signOutPress -> error', error);
        },
            loading => {}
        );
    };

    return (
        <View style={{...styles.container}}>
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewAvatarArea}}>
                        <Avatar
                            source={isEmpty(userInfo.image)? require('../../../../assets/images/drawable-xxxhdpi/profile.png') : {uri: userInfo.image}}
                            size={scale(70)}
                            onPress={() => _onImagePicker()}
                            rounded={true}
                        >
                            <Accessory size={scale(21)} onPress={() => _onImagePicker()} underlayColor={'rgba(0, 0, 0, .3)'} />
                        </Avatar>
                    </View>
                    <View style={{...styles.viewEditForm}}>
                        <Text style={{...styles.txtLabel}}>이메일</Text>
                        <Text style={{...styles.inputEdit}}>{`${replaceEmail(userEmail)}`}</Text>
                    </View>
                    <View style={{...styles.viewEditForm}}>
                        <Text style={{...styles.txtLabel}}>이름</Text>
                        <TextInput
                            style={{...styles.inputEdit}}
                            value={userInfo.name}
                            padding={0}
                            onChangeText={text => setUserInfoLocal({...userInfo, name: text})}
                            maxLength={8}
                        />
                        <Icon name="mode-edit" size={scale(15)} color="#aaaaaa" />
                    </View>
                    <View style={{...styles.viewEditForm}}>
                        <Text style={{...styles.txtLabel}}>연락처</Text>
                        <TextInput
                            style={{...styles.inputEdit}}
                            value={userInfo.tel}
                            padding={0}
                            onChangeText={text => setUserInfoLocal({...userInfo, tel: text})}
                            maxLength={11}
                            keyboardType="number-pad"
                        />
                        <Icon name="mode-edit" size={scale(15)} color="#aaaaaa" />
                    </View>
                <TouchableOpacity
                    style={{...styles.viewEditForm}}
                    onPress={() => !isSNS(userEmail) && setModalChangePassVisible(true)}
                >
                    <Text style={{...styles.txtLabel}}>비밀번호</Text>
                    <Text style={{...styles.inputEdit}}>변경하기</Text>
                    <Icon name="keyboard-arrow-right" size={scale(15)} color="#aaaaaa" />
                </TouchableOpacity>
                <TouchableOpacity style={{...styles.viewEditForm}} onPress={() => _onDeleteUserPress()}>
                    <Text style={{...styles.txtLabel}}>회원탈퇴</Text>
                    <Text style={{...styles.inputEdit}}>탈퇴하기</Text>
                    <Icon name="keyboard-arrow-right" size={scale(15)} color="#aaaaaa" />
                </TouchableOpacity>
            </ScrollView>
            <View style={{...styles.viewEditBtnArea}}>
                <Button
                    disabled={!(userName !== userInfo.name || userPhone !== userInfo.tel || userImage !== userInfo.image)}
                    title="수정하기"
                    titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                    buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
                    onPress={() => _onEditUserInfo()}
                    loading={isLoading}
                />
            </View>
        </SafeAreaView>
        <Modal
            isVisible={modalChangePassVisible}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            onBackdropPress={() => setModalChangePassVisible(false)}
            onBackButtonPress={() => setModalChangePassVisible(false)}
            avoidKeyboard={true}
            statusBarTranslucent={true}
        >
            <View style={{backgroundColor: 'white', borderRadius: scale(5), padding: scale(15)}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <Button
                        disabled={!(oldPass !== '' && newPass !== '' && _chkPwd(newPass))}
                        title="변경"    
                        titleStyle={{color: '#e5293e', fontWeight: 'bold', fontSize: scale(16)}}
                        type="clear"
                        onPress={() => _onChangePassPress()}
                        loading={isLoading}
                        loadingProps={{color: '#e5293e'}}
                    />
                </View>
                <Input
                    label="현재 비밀번호"
                    value={oldPass}
                    onChangeText={text => setOldPass(text)}
                    containerStyle={{paddingHorizontal: 0}}
                    secureTextEntry={!showPass}
                    rightIcon={{
                        name: !showPass ? 'eye-outline' : 'eye-off-outline',
                        type: 'material-community',
                        color: '#d4d4d4',
                        size: scale(25),
                        onPress: () => {setShowPass(!showPass);},
                    }}
                    onSubmitEditing={() => refInputNewPass.current.focus()}
                />
                <Input
                    ref={refInputNewPass}
                    label="새 비밀번호"
                    value={newPass}
                    onChangeText={text => setNewPass(text)}
                    containerStyle={{paddingHorizontal: 0}}
                    secureTextEntry={!showPass}
                    rightIcon={{
                        name: !showPass ? 'eye-outline' : 'eye-off-outline',
                        type: 'material-community',
                        color: '#d4d4d4',
                        size: scale(25),
                        onPress: () => {setShowPass(!showPass);},
                    }}
                />
            </View>
        </Modal>
    </View>
    );
};

export default EditUserInfo;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewAvatarArea: {
        alignItems: 'center',
        paddingVertical: scale(20),
        borderBottomColor: '#dddddd',
        borderBottomWidth: scale(1),
    },
    viewEditForm: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(15),
        borderBottomColor: '#dddddd',
        borderBottomWidth: scale(1),
    },
    txtLabel: {
        flex: 1,
        fontSize: scale(13),
    },
    inputEdit: {
        flex: 2,
        fontSize: scale(13),
        color: '#aaaaaa',
    },
    viewEditBtnArea: {
        paddingHorizontal: scale(15),
        paddingTop: scale(15),
        ...(Platform.OS === 'android' ? {paddingBottom: scale(15)} : null),
    },
});