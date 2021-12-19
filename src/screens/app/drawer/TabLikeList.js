import React, {useContext, useEffect, useState} from 'react';
import {Alert, FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';

import {Header, Icon} from 'react-native-elements';
import {Tab, Tabs} from 'native-base';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import {isEmptyArr, logging, YYYYMMDDHHMM} from '../../../common/Utils';
import UserTokenContext from '../../../Context/UserTokenContext';

const TabLikeList = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const {setUserInfo} = useContext(UserTokenContext);
    const [auditionList, setAuditionList] = useState({list: [], total_count: 0});
    const [rolesList, setRolesList] = useState({list: [], total_count: 0});

    const _getJJimAuditionList = async bool => {
        if (auditionList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getJJimAuditionList({
                next_token: bool ? null : auditionList.next_token,
                },loading => setIsLoading(loading)
            );

            if (bool) {
                setAuditionList(apiResult);
            } else {
                setAuditionList({
                    list: [...auditionList.list, ...apiResult.list],
                    has_next: apiResult.has_next,
                    next_token: apiResult.next_token,
                    total_count: apiResult.total_count,
                });
            }
        } catch (error) {
            logging(error.response?.data, 'dibs-audition-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _getJJimRolesList = async bool => {
        if (rolesList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getJJimRolesList({
                next_token: bool ? null : rolesList.next_token,
                },loading => setIsLoading(loading)
            );
            if (bool) {
                setRolesList(apiResult);
            } else {
                setRolesList({
                    list: [...rolesList.list, ...apiResult.list],
                    has_next: apiResult.has_next,
                    next_token: apiResult.next_token,
                    total_count: apiResult.total_count,
                });
            }
        } catch (error) {
            logging(error.response?.data, 'dibs-audition-recruit-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _applyAudition = async audition_recruit_no => {
        try {
            const apiResult = await apiObject.applyAudition({
                audition_recruit_no: audition_recruit_no,
            });
            if (apiResult.already_apply) {
                Toast.show('이미 지원이 완료된 오디션입니다.\n결과를 기다려주세요!', Toast.SHORT);
                return null;
            }
            if (!apiResult.payable) {
                Alert.alert('[안내]', '오디션 지원을 위한 포인트가 부족합니다.', [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '충전하기',
                    onPress: () => props.navigation.navigate('BuyPoint'),
                },
                ]);
            } else {
                Toast.showWithGravity('지원을 완료했습니다.', Toast.SHORT, Toast.CENTER);
                setUserInfo({userPoint: apiResult.point});
            }
        
            _getJJimRolesList(true);
        } catch (error) {
            logging(error.response?.data, 'audition-apply');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _onApplyAuditionPress = (audition_recruit_no, role_name) => {
        Alert.alert('[안내]', `'${role_name}'역에 지원하시겠습니까?\n\n포인트 차감 : 1,000P`, [
        {
            text: '취소',
            style: 'cancel',
        },
        {
            text: '지원하기',
            onPress: () => _applyAudition(audition_recruit_no),
        },
        ]);
    };

    useEffect(() => {
        _getJJimAuditionList(true);
        _getJJimRolesList(true);
    }, []);

    const _renderAuditionList = ({item, index}) => (
        <TouchableOpacity
            style={{...styles.viewAuditionCard}}
            onPress={() => props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})}
        >
            <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(5),paddingRight: scale(10)}}>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
                    <FastImage 
                        source={item.d_day <= 7? require('../../../../assets/images/drawable-xxxhdpi/flag.png') : require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')}
                        style={{marginRight: scale(5),paddingLeft: scale(3),paddingRight: scale(10),}}
                    >
                        <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}} numberOfLines={1}>{`D-${item.d_day}`}</Text>
                    </FastImage>
                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                    <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                </View>
                <Icon
                    name={'favorite'}
                    color={'#e5293e'}
                    size={scale(15)}
                    containerStyle={{
                        backgroundColor: 'white',
                        borderRadius: scale(50),
                        borderWidth: scale(1),
                        borderColor: '#e5293e',
                        padding: scale(3),
                    }}
                    onPress={() => _onDeleteFavoritePress(item.audition_no)}
                />
            </View>
            <View style={{paddingHorizontal: scale(10)}}>
                <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
                <TouchableOpacity
                    style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(2),paddingHorizontal: scale(12),alignSelf: 'flex-end',}}
                    onPress={() => props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})}
                >
                    <Text style={{color: 'white'}}>오디션보기</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const _renderRolesList = ({item, index}) => (
        <TouchableOpacity
            style={{...styles.viewAuditionCard}}
            key={`auditionCard_${index}`}
            onPress={() => props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})}
        >
            <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(5),paddingRight: scale(10)}}>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
                    <FastImage
                        source={item.d_day <= 7? require('../../../../assets/images/drawable-xxxhdpi/flag.png'): require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')}
                        style={{marginRight: scale(5),paddingLeft: scale(3),paddingRight: scale(10),}}
                    >
                        <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}} numberOfLines={1}>{`D-${item.d_day}`}</Text>
                    </FastImage>
                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                    <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                </View>
                <Icon
                    name={'favorite'}
                    color={'#e5293e'}
                    size={scale(15)}
                    containerStyle={{
                        backgroundColor: 'white',
                        borderRadius: scale(50),
                        borderWidth: scale(1),
                        borderColor: '#e5293e',
                        padding: scale(3),
                    }}
                    onPress={() => _onDeleteRolesFavoritePress(item.audition_recruit_no)}
                />
            </View>
            <View style={{paddingHorizontal: scale(10)}}>
                <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                <Text style={{...styles.txtAuditionSub}}>
                    배역 : <Text style={{color: '#e5293e', fontWeight: 'bold'}}>{`${item.role_name}`}</Text>
                </Text>
                <TouchableOpacity
                    style={{borderRadius: scale(5),backgroundColor: item.apply_yn ? '#dddddd' : '#e5293e',paddingVertical: scale(2),paddingHorizontal: scale(12),alignSelf: 'flex-end',}}
                    onPress={() => (item.apply_yn ? null : _onApplyAuditionPress(item.audition_recruit_no, item.role_name))}
                >
                    <Text style={{color: 'white'}}>지원하기</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const _deleteFavorite = async audition_no => {
        try {
            await apiObject.deleteFavorite({audition_no: audition_no});
            _getJJimAuditionList(true);
        } catch (error) {
            logging(error.response?.data, 'undibs-audition');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _deleteActorFavorite = async audition_recruit_no => {
        try {
            await apiObject.deleteActorFavorite({audition_recruit_no: audition_recruit_no});
            _getJJimRolesList(true);
        } catch (error) {
            logging(error.response?.data, 'undibs-audition-recruit');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _onDeleteFavoritePress = audition_no => {
        Alert.alert('[안내]', '해당 오디션을 찜에서 삭제할까요?', [
        {
            text: '취소',
            style: 'cancel',
        },
        {
            text: '삭제',
            style: 'destructive',
            onPress: () => _deleteFavorite(audition_no),
        },
        ]);
    };

    const _onDeleteRolesFavoritePress = audition_recruit_no => {
        Alert.alert('[안내]', '해당 배역을 찜에서 삭제할까요?', [
        {
            text: '취소',
            style: 'cancel',
        },
        {
            text: '삭제',
            style: 'destructive',
            onPress: () => _deleteActorFavorite(audition_recruit_no),
        },
        ]);
    };

    return (
        <View style={{...styles.container}}>
            <Header
                backgroundColor="#e5293e"
                statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'light-content', animated: true}}
                leftComponent={{
                    icon: 'ios-chevron-back',
                    type: 'ionicon',
                    size: scale(25),
                    color: 'white',
                    onPress: () => props.navigation.goBack(),
                }}
                centerComponent={{text: '찜리스트', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <Tabs tabBarUnderlineStyle={{backgroundColor: '#e5293e'}}>
                    <Tab
                        heading="오디션"
                        tabStyle={{backgroundColor: 'white'}}
                        activeTabStyle={{backgroundColor: 'white'}}
                        activeTextStyle={{color: '#e5293e'}}
                    >
                        <View style={{...styles.viewScrollInner}}>
                            <Text style={{fontSize: scale(16),fontWeight: 'bold',color: '#e5293e'}}>
                                {`내가 찜한 오디션 ${auditionList.total_count}개`}
                            </Text>
                        </View>
                        {
                            isEmptyArr(auditionList.list) && (
                                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={{fontSize: scale(16), color: '#a4a4a4'}}>찜한 오디션이 없습니다 :(</Text>
                                    <Text style={{fontSize: scale(16), marginVertical: scale(20), textAlign: 'center'}}>
                                        마음에 드는 오디션을 찜해주세요!
                                    </Text>
                                    <TouchableOpacity
                                        style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(5),paddingHorizontal: scale(12)}}
                                        onPress={() => props.navigation.navigate('AuditionMain')}
                                    >
                                        <Text style={{color: 'white', fontSize: scale(16)}}>내게 꼭 맞는 오디션 찾으러 가기!</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        <FlatList
                            data={auditionList.list}
                            renderItem={_renderAuditionList}
                            keyExtractor={(item, index) => `audition_${index}`}
                            contentContainerStyle={{...styles.viewScrollInner, paddingTop: 0}}
                            refreshing={isLoading}
                            onRefresh={() => _getJJimAuditionList(true)}
                            onEndReached={() => _getJJimAuditionList()}
                            onEndReachedThreshold={0.1}
                        />
                    </Tab>
                    <Tab
                        heading="배역"
                        tabStyle={{backgroundColor: 'white'}}
                        activeTabStyle={{backgroundColor: 'white'}}
                        activeTextStyle={{color: '#e5293e'}}
                    >
                        <View style={{...styles.viewScrollInner}}>
                            <Text style={{fontSize: scale(16),fontWeight: 'bold',color: '#e5293e'}}>{`내가 찜한 배역 ${rolesList.total_count}개`}</Text>
                        </View>
                        {
                            isEmptyArr(rolesList.list) && (
                                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={{fontSize: scale(16), color: '#a4a4a4'}}>찜한 배역이 없습니다 :(</Text>
                                    <Text style={{fontSize: scale(16), marginVertical: scale(20), textAlign: 'center'}}>
                                        마음에 드는 배역을 찜해주세요!
                                    </Text>
                                    <TouchableOpacity
                                        style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(5),paddingHorizontal: scale(12)}}
                                        onPress={() => props.navigation.navigate('AuditionMain')}
                                    >
                                        <Text style={{color: 'white', fontSize: scale(16)}}>내게 꼭 맞는 배역 찾으러 가기!</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        <FlatList
                            data={rolesList.list}
                            renderItem={_renderRolesList}
                            keyExtractor={(item, index) => `roles_${index}`}
                            contentContainerStyle={{...styles.viewScrollInner, paddingTop: 0}}
                            refreshing={isLoading}
                            onRefresh={() => _getJJimRolesList(true)}
                            onEndReached={() => _getJJimRolesList()}
                            onEndReachedThreshold={0.1}
                        />
                    </Tab>
                </Tabs>
            </SafeAreaView>
        </View>
    );
};

export default TabLikeList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewScrollInner: {
        padding: scale(15),
    },
    viewAuditionCard: {
        paddingVertical: scale(10),
        backgroundColor: 'white',
        ...Platform.select({
            ios: {
                shadowColor: '#ddd',
                shadowOffset: {
                    width: scale(2),
                    height: scale(2),
                },
                shadowRadius: scale(2),
                shadowOpacity: 1,
            },
            android: {
                elevation: scale(2),
            },
        }),
        marginBottom: scale(15),
        borderRadius: scale(5),
    },
    txtAuditionTitle: {
        fontSize: scale(14),
        fontWeight: 'bold',
    },
    txtAuditionSub: {
        fontSize: scale(11),
        color: '#666666',
    },
});
