import React, {useContext, useEffect, useState} from 'react';
import {FlatList, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {Avatar, Button, Header} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';
import {apiObject} from '../../../common/API';
import {isEmptyArr, logging, YYYYMMDDHHMM} from '../../../common/Utils';

const IMAGE_FLAG = require('../../../../assets/images/drawable-xxxhdpi/flag.png');
const IMAGE_FLAG_MAIN = require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')

const ApplyAudition = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const {} = useContext(UserTokenContext);

    const [dataList, setDataList] = useState({list: [], total_count: 0});
    const [modalStatus, setModalStatus] = useState(false);
    const [seletedIndex, setSeletecIndex] = useState(0);

    const _getApplyAuditionList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getApplyAuditionList({
                next_token: bool ? null : dataList.next_token,
            },
            loading => setIsLoading(loading)
            );
            if (bool) {
                setDataList(apiResult);
            } else {
                setDataList({
                    list: [...dataList.list, ...apiResult.list],
                    has_next: apiResult.has_next,
                    next_token: apiResult.next_token,
                    total_count: apiResult.total_count,
                });
            }
        } catch (error) {
            logging(error.response?.data, 'apply-audition-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _requestMyProfile = async audition_no => {
        try {
            await apiObject.requestMyProfile({audition_no});
            let tmpArr = [...dataList.list];
            tmpArr[seletedIndex].eval_apply_yn = true;
            setDataList({...dataList, list: tmpArr});
        } catch (error) {
            logging(error.response?.data, 'apply-eval-me/...');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getApplyAuditionList(true);
    }, []);

    const _renderAuditionList = ({item, index}) => (
        <TouchableOpacity
            style={{...styles.viewAuditionCard}}
            onPress={() => {
                setSeletecIndex(index);
                setModalStatus(true);
            }}
        >
            <View style={styles.auditionListWrap}>
                <View style={styles.auditionImageWrap}>
                    <FastImage
                        source={item.d_day <= 7 ? IMAGE_FLAG : IMAGE_FLAG_MAIN }
                        style={styles.auditionImage}
                    >
                        <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}}>{`D-${item.d_day}`}</Text>
                    </FastImage>
                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                    <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                </View>
            </View>
            <View style={{paddingHorizontal: scale(10)}}>
                <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                <Text style={{...styles.txtAuditionSub}}>{'배역 : '}<Text style={{color: '#e5293e', fontWeight: 'bold'}}>{`${item.role_name}`}</Text>
                </Text>
                <View style={{borderRadius: scale(5),backgroundColor: item.pass_type_no === 0 ? '#dddddd' : item.pass_type_no < 1 ? '#707070' : '#e5293e',paddingVertical: scale(2),width: scale(65),alignSelf: 'flex-end',alignItems: 'center',}}>
                    <Text style={{color: 'white', fontSize: scale(11)}}>
                        {item.pass_type_no === 0 ? '검토중' : item.pass_type_no >= 1 ? `${Math.abs(item.pass_type_no)}차 합격` : `${Math.abs(item.pass_type_no)}차 불합격`}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
    
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
                centerComponent={{text: '지원한오디션', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <View style={{...styles.viewScrollInner, paddingTop: scale(20)}}>
                    <Text style={{fontSize: scale(16),fontWeight: 'bold',color: '#e5293e',}}>
                        {`지원한 오디션 ${dataList.total_count}개`}
                    </Text>
                </View>
                {
                    isEmptyArr(dataList.list) && (
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scale(16), marginBottom: scale(20), color: '#a4a4a4'}}>
                            지원한 오디션이 없어요 :(
                        </Text>
                        <TouchableOpacity
                            style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(5),paddingHorizontal: scale(12),}}
                            onPress={() => props.navigation.navigate('AuditionMain')}
                        >
                            <Text style={{color: 'white', fontSize: scale(16)}}>내게 꼭 맞는 오디션 찾으러 가기!</Text>
                        </TouchableOpacity>
                    </View>
                    )
                }
                <FlatList
                    data={dataList.list}
                    renderItem={_renderAuditionList}
                    keyExtractor={(item, index) => `auditionCard_${index}`}
                    refreshing={isLoading}
                    onRefresh={() => _getApplyAuditionList(true)}
                    onEndReached={() => _getApplyAuditionList()}
                    onEndReachedThreshold={0.1}
                    contentContainerStyle={{...styles.viewScrollInner, paddingTop: scale(5)}}
                />
            </SafeAreaView>
            {
            !isEmptyArr(dataList.list) && (
                <Modal
                    isVisible={modalStatus}
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    statusBarTranslucent={true}
                    onBackButtonPress={() => setModalStatus(false)}
                    onBackdropPress={() => setModalStatus(false)}
                >
                    <View
                        style={{
                        ...styles.viewModalArea,
                        ...(dataList.list[seletedIndex].eval_apply_yn
                        ? {borderBottomLeftRadius: scale(10), borderBottomRightRadius: scale(10)}
                        : null),
                        }}
                    >
                        <FastImage
                            source={{uri: dataList.list[seletedIndex].url}}
                            style={{width: scale(200), height: scale(200), borderRadius: scale(5)}}
                        />
                        {
                        dataList.list[seletedIndex].pass_type_no === 0 ? null : dataList.list[seletedIndex].pass_type_no < 0 ? (
                            <Text style={{fontSize: scale(18), fontWeight: 'bold', color: '#707070'}}>지원하신</Text>
                        ) : (
                            <Text style={{fontSize: scale(18), fontWeight: 'bold', color: '#707070'}}>축하합니다!</Text>
                        )}
                        {
                        dataList.list[seletedIndex].pass_type_no === 0 ? (
                            <Text style={{fontSize: scale(18), fontWeight: 'bold', color: '#707070'}}>
                            <Text style={{color: '#e5293e'}}>
                                {`[${dataList.list[seletedIndex].role_name}]`}</Text>에서
                            </Text>
                        ) : dataList.list[seletedIndex].pass_type_no < 0 ? (
                            <Text style={{fontSize: scale(18), fontWeight: 'bold', color: '#707070'}}>
                                <Text style={{color: '#e5293e'}}>{`[${dataList.list[seletedIndex].role_name}]`}</Text>에
                            </Text>
                        ) : (
                            <Text style={{fontSize: scale(18), fontWeight: 'bold', color: '#707070'}}>
                                <Text style={{color: '#e5293e'}}>{`[${dataList.list[seletedIndex].role_name}]`}</Text>에
                            </Text>
                        )}
                        {
                        dataList.list[seletedIndex].pass_type_no === 0 ? (
                            <Text style={{fontSize: scale(18), fontWeight: 'bold', color: '#707070'}}>배우님을 검토중입니다!</Text>
                        ) : dataList.list[seletedIndex].pass_type_no < 0 ? (
                            <Text style={{fontSize: scale(18),fontWeight: 'bold',color: '#707070',}}>
                                {`${Math.abs(dataList.list[seletedIndex].pass_type_no)}차 불합격하셨습니다`}
                            </Text>
                        ) : (
                            <Text style={{fontSize: scale(18),fontWeight: 'bold',color: '#707070',}}>
                                {`${Math.abs(dataList.list[seletedIndex].pass_type_no)}차 합격되셨습니다!`}
                            </Text>
                        )}
                        {
                        dataList.list[seletedIndex].pass_type_no === 0 ? (
                            <Text style={{fontSize: scale(10), color: '#999999'}}>
                                결과가 나올시, <Text style={{color: '#ff540e'}}>알림</Text>으로 합격소식을 알려드립니다.
                            </Text>
                        ) : dataList.list[seletedIndex].pass_type_no < 0 ? (
                            <Text style={{fontSize: scale(10), color: '#999999'}}>
                                디렉터에게 프로필에 대해 <Text style={{color: '#ff540e'}}>피드백 요청</Text>하실 수 있습니다!
                            </Text>
                        ) : (
                            <Text style={{fontSize: scale(10), color: '#999999'}}>
                                자세한 오디션정보는 해당 <Text style={{color: '#ff540e'}}>오디션 공지사항</Text>에서 확인하실 수 있습니다.
                            </Text>
                        )}
                    </View>
                    {dataList.list[seletedIndex].eval_apply_yn ? null : (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                backgroundColor: 'white',
                                borderBottomLeftRadius: scale(10),
                                borderBottomRightRadius: scale(10),
                                paddingTop: scale(1),
                                paddingBottom: scale(25),
                                paddingHorizontal: scale(25),
                            }}
                        >
                            <Button
                                title="닫기"
                                titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}
                                buttonStyle={{backgroundColor: 'white',borderRadius: scale(35),paddingVertical: scale(10),borderWidth: scale(1),borderColor: '#e5293e',}}
                                containerStyle={{width: '49%', backgroundColor: 'blue'}}
                                onPress={() => setModalStatus(false)}
                            />
                            <Button
                                title="프로필 평가요청"
                                titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                                buttonStyle={{backgroundColor: '#e5293e',borderRadius: scale(35),paddingVertical: scale(10),}}
                                containerStyle={{width: '49%'}}
                                onPress={() => _requestMyProfile(dataList.list[seletedIndex].audition_no)}
                            />
                        </View>
                    )}
                </Modal>
            )}
        </View>
    );
};

export default ApplyAudition;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewScrollInner: {
        padding: scale(20),
        paddingTop: 0,
    },
    auditionListWrap : {
        flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(5),paddingRight: scale(10),
    },
    auditionImageWrap : {
        flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)
    },
    auditionImage : {
        marginRight: scale(5),paddingLeft: scale(3),paddingRight: scale(10)
    },
    viewDirectorBox: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scale(15),
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
        marginBottom: scale(25),
        borderRadius: scale(5),
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
    viewModalArea: {
        backgroundColor: 'white',
        borderTopLeftRadius: scale(10),
        borderTopRightRadius: scale(10),
        padding: scale(25),
        justifyContent: 'space-evenly',
        alignItems: 'center',
        maxHeight: '60%',
        minHeight: '60%',
    },
});
