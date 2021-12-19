import React, {useContext, useEffect, useState} from 'react';
import {Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {apiObject} from '../../common/API';
import scale from '../../common/Scale';

import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import {isEmpty, logging, YYYYMMDDHHMM} from '../../common/Utils';
import FastImage from 'react-native-fast-image';
import UserTokenContext from '../../Context/UserTokenContext';
import {Icon} from 'react-native-elements';

const SearchList = props => {
    const {passDirectorAuth} = useContext(UserTokenContext);
    const [dataList, setDataList] = useState({list: []});
    const _getActorList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const isSettingFilter = await AsyncStorage.getItem('@whosPick_SearchFilter_Actor');
            const isSettingFilterParse = JSON.parse(isSettingFilter);
            const apiResult = await apiObject.searchActor({
                next_token: bool ? null : dataList.next_token,
                search_text: props.route.params.SEARCH_TEXT,
                work_type_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.videoType.work_type_no : null,
                role_weight_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorType.role_weight_no : null,
                gender: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.sex : null,
                age_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.min : null,
                age_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.max : null,
                height_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.min : null,
                height_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.max : null,
                detail_info_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.detail_info_list : null,
                genre_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.genre_list : null,
            });

            if (bool) {
                setDataList(apiResult);
            } else {
                setDataList({
                    list: [...dataList.list, ...apiResult.list],
                    has_next: apiResult.has_next,
                    next_token: apiResult.next_token,
                });
            }
        } catch (error) {
            logging(error.response?.data, 'search/actor');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _getPartnerList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const isSettingFilter = await AsyncStorage.getItem('@whosPick_SearchFilter_Actor');
            const isSettingFilterParse = JSON.parse(isSettingFilter);
            const apiResult = await apiObject.searchPartner({
                next_token: bool ? null : dataList.next_token,
                search_text: props.route.params.SEARCH_TEXT,
                work_type_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.videoType.work_type_no : null,
                role_weight_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorType.role_weight_no : null,
                gender: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.sex : null,
                age_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.min : null,
                age_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.max : null,
                height_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.min : null,
                height_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.max : null,
                detail_info_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.detail_info_list : null,
                genre_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.genre_list : null,
            });
            if (bool) {
                setDataList(apiResult);
            } else {
                setDataList({
                    list: [...dataList.list, ...apiResult.list],
                    has_next: apiResult.has_next,
                    next_token: apiResult.next_token,
                });
            }
        } catch (error) {      
            logging(error.response?.data, 'search/affiliate');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _getAuditionList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const isSettingFilter = await AsyncStorage.getItem('@whosPick_SearchFilter_Actor');
            const isSettingFilterParse = JSON.parse(isSettingFilter);
            const apiResult = await apiObject.searchAudition({
                next_token: bool ? null : dataList.next_token,
                search_text: props.route.params.SEARCH_TEXT,
                work_type_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.videoType.work_type_no : null,
                role_weight_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorType.role_weight_no : null,
                gender: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.sex : null,
                age_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.min : null,
                age_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.max : null,
                height_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.min : null,
                height_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.max : null,
                detail_info_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.detail_info_list : null,
                genre_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.genre_list : null,
            });

            if (bool) {
                setDataList(apiResult);
            } else {
                setDataList({
                    list: [...dataList.list, ...apiResult.list],
                    has_next: apiResult.has_next,
                    next_token: apiResult.next_token,
                });
            }
        } catch (error) {      
            logging(error.response?.data, 'search/audition');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _getSearchList = () => {
        switch (props.route.params.TYPE) {
            case 'ACTOR':
                _getActorList();
                break;
            case 'PARTNER':
                _getPartnerList();
                break;
            case 'AUDITION':
                _getAuditionList();
                break;
        }
    };

    useEffect(() => {
        _getSearchList();
    }, []);

    return (
        <View style={{...styles.container}}>
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewInner}}>
                        {
                            props.route.params.TYPE === 'ACTOR' &&
                            dataList.list.map((item, index) => (
                            <TouchableOpacity
                                key={`actor_${index}`}
                                style={{...styles.viewUpActorArea}}
                                activeOpacity={1}
                                onPress={() => passDirectorAuth && props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}
                            >
                                <FastImage
                                    source={{uri: item.image_url}}
                                    style={{...styles.imgUpActor}}
                                    resizeMode={FastImage.resizeMode.cover}
                                />
                                <View style={{...styles.viewUpActorInfo}}>
                                    <View  style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1}}>
                                        <Text style={{...styles.txtActorName, fontSize: scale(15), flex: 1}}>{item.name}</Text>                      
                                    </View>
                                    <Text style={{...styles.txtActorPrivate,fontSize: scale(12),flex: 1,}}>
                                        {`${item.age}세     ${item.height}cm/${item.weight}kg`}
                                    </Text>
                                    <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
                                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap'}}>
                                        {
                                            item.keyword.map((d, i) => (
                                            <Text key={i} style={{...styles.txtActorPrivate, color: '#999999', fontSize: scale(12)}}>
                                                {i === item.keyword.length - 1 ? `${d}` : `${d}, `}
                                            </Text>
                                            ))
                                        }
                                    </View>
                                </View>
                            </TouchableOpacity>
                            ))
                        }
                        {
                            props.route.params.TYPE === 'PARTNER' &&
                            dataList.list.map((item, index) => (
                                <View style={{...styles.viewAuditionCard}} key={`partner_${index}`}>
                                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.affiliate_category_text}] `}</Text>
                                    <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Icon name="comment-dots" type="font-awesome-5" size={scale(15)} color="#e5293e" />
                                            <Text style={{fontSize: scale(12),fontWeight: 'bold',color: '#e5293e',}}>
                                                {` ${item.comment_count}  `}
                                            </Text>
                                            <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={{borderRadius: scale(5),backgroundColor: '#999999',paddingVertical: scale(3),paddingHorizontal: scale(10),alignSelf: 'flex-end',}}
                                            onPress={() =>  props.navigation.navigate('PartnerDetail', {partnerType: item.affiliate_category_text,title: item.title,uploadReg: item.reg_dt,affiliate_no: item.affiliate_no,})}
                                        >
                                            <Text style={{color: 'white'}}>자세히보기</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        }
                        {
                            props.route.params.TYPE === 'AUDITION' &&
                            dataList.list.map((item, index) => (
                                <TouchableOpacity
                                    key={`audition_${index}`}
                                    style={{...styles.viewAuditionCard}}
                                    onPress={() => props.navigation.navigate('TabAuditionDetail', {  HEADER: item.category, audition_no: item.audition_no,})}
                                >
                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                                        <Text style={{fontSize: scale(10), color: '#bababa'}}>{YYYYMMDDHHMM(item.reg_dt)}</Text>
                                    </View>
                                    <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                                    <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                                    <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default SearchList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewInner: {
        padding: scale(15),
    },
    viewAuditionArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(20),
    },
    txtLabel: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#e5293e',
    },
    txtViewMore: {
        fontSize: scale(10),
        color: '#ababab',
    },
    viewUpActorArea: {
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
        marginBottom: scale(20),
        flexDirection: 'row',
        flex: 1,
        borderRadius: scale(5),
        backgroundColor: 'white',
    },
    imgUpActor: {
        flex: 1,
        height: scale(100),
        borderTopLeftRadius: scale(5),
        borderBottomLeftRadius: scale(5),
    },
    viewUpActorInfo: {
        flex: 2,
        paddingVertical: scale(10),
        paddingHorizontal: scale(20),
        justifyContent: 'space-between',
    },
        txtActorPrivate: {
        fontSize: scale(10),
        color: '#e5293e',
    },
    viewActorTagArea: {
        flexDirection: 'row',
    },
    txtActorName: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#222222',
    },
    viewAuditionCard: {
        padding: scale(10),
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
        marginBottom: scale(20),
        borderRadius: scale(5),
    },
    txtAuditionTitle: {
        fontSize: scale(14),
        fontWeight: 'bold',
        marginVertical: scale(10),
    },
    txtAuditionSub: {
        fontSize: scale(11),
        color: '#666666',
    },
});