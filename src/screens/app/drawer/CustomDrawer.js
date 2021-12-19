import React, {useContext} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, ScrollView} from 'react-native';

import scale from '../../../common/Scale';
import {isEmpty, replaceEmail} from '../../../common/Utils';

import {Icon, ListItem, Avatar, Accessory} from 'react-native-elements';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

import {Auth, AuthType} from '@psyrenpark/auth';

const CustomDrawer = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const {resetUserInfo, userEmail, userImage, userName} = useContext(UserTokenContext);

    const _signOutPress = async () => {
        Auth.signOutProcess({
            authType: AuthType.EMAIL,
        },
        async success => {
            resetUserInfo();
        },
        error => {
            console.log('_signOutPress -> error', error);
        },
        loading => {}
        );
    };

    return (
        <View style={{...styles.drawerView}}>
            <View style={{...styles.drawerView__CloseView}}>
                <TouchableOpacity onPress={() => {props.navigation.toggleDrawer();_signOutPress();}}>
                    <Text style={{...styles.closeView__SignOut}}>로그아웃</Text>
                </TouchableOpacity>
                <Icon
                    name="close"
                    style={{...styles.closeView__Close}}
                    size={scale(25)}
                    color="white"
                    onPress={() => props.navigation.toggleDrawer()}
                />
            </View>
            <ListItem bottomDivider={true} containerStyle={{backgroundColor: '#e5293e'}}>
                <Avatar
                    source={isEmpty(userImage) ? require('../../../../assets/images/drawable-xxxhdpi/profile.png') : {uri: userImage}}
                    size={scale(50)}
                    rounded={true}>
                    <Accessory
                        size={scale(21)}
                        onPress={() => props.navigation.navigate('TabEditUser')}
                        underlayColor={'rgba(0, 0, 0, .3)'}
                    />
                </Avatar>
                <ListItem.Content>
                    <ListItem.Title style={{fontSize: scale(14), color: 'white'}}>{`${userName}님`}</ListItem.Title>
                    <ListItem.Subtitle style={{fontSize: scale(11), color: 'white'}}>
                        {`${replaceEmail(userEmail)}`}
                    </ListItem.Subtitle>
                </ListItem.Content>
            </ListItem>
            <ScrollView style={{...styles.drawerView__MenuView}} showsVerticalScrollIndicator={false}>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('TabLikeList')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-heart-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>찜리스트</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('ApplyAudition')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="contacts" type="antdesign" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>지원한오디션</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('DirectorPick')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-star-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>나를 픽한 디렉터</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('MyPoint')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-logo-usd" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>포인트 결제/관리</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('ProfileReview')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-help-circle-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>평가요청확인</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('Notification')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-notifications-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>알림확인</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('QnA')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-headset-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>1:1 고객문의</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('FAQ')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-help-circle-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>FAQ</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('Notice')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-volume-low-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>공지사항</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('TOS')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-document-text-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>이용약관</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem
                    bottomDivider={true}
                    containerStyle={{paddingVertical: scale(20)}}
                    onPress={() => props.navigation.navigate('PP')}
                    delayPressIn={0}
                >
                    <ListItem.Chevron name="ios-document-text-outline" type="ionicon" size={scale(20)} color="#888888" />
                    <ListItem.Content>
                        <ListItem.Title style={{fontSize: scale(14), color: '#888888'}}>개인정보처리방침</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            </ScrollView>
        </View>
    );
};

export default CustomDrawer;
const styles = StyleSheet.create({
    drawerView: {
        backgroundColor: '#e5293e',
        flex: 1,
        paddingTop: getStatusBarHeight(),
    },
    containerDrawer: {margin: 0, marginRight: '30%'},
    drawerView__CloseView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(15),
    },
    drawerView__MenuView: {flex: 1, backgroundColor: 'white'},
    closeView__SignOut: {
        fontSize: scale(12),
        color: 'white',
    },
    avatarView: {
        padding: scale(15),
        flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'flex-end',
    },
});