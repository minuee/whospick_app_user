import React, {useContext, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import scale from '../../../common/Scale';
import {changeTime, isEmpty, isEmptyArr, logging, timeForToday} from '../../../common/Utils';
import {apiObject} from '../../../common/API';

import {Header, Icon} from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import LoadingContext from '../../../Context/LoadingContext';

const Notification = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const [dataList, setDataList] = useState({list: []});
    const _getNotificationList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getNotificationList({
                next_token: bool ? null : dataList.next_token,
                },loading => setIsLoading(loading)
            );
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
            logging(error.response?.data, 'notify-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _confirmNotification = async (notify_no, link, index) => {
        try {
            await apiObject.confirmNotification({notify_no});
        } catch (error) {
        } finally {
            let tmpArr = [...dataList.list];
            tmpArr[index].confirm_yn = true;
            setDataList({...dataList, list: tmpArr});
            switch (link) {
                case 'NO':
                    break;
                case 'FULL_AUDITION':
                    props.navigation.navigate('AuditionStack');
                    break;
                case 'PROFILE_EDIT':
                    props.navigation.navigate('TabEditUser');
                    break;
                case 'DIBS_ME_DIRECTOR':
                    props.navigation.navigate('DirectorPick');
                    break;
                case 'ACTOR_SEARCH_PAGE':
                    props.navigation.navigate('ActorStack');
                    break;
                case 'POINT':
                    props.navigation.navigate('MyPoint');
                    break;
                case 'AUDITION':
                    props.navigation.navigate('TabAuditionDetail', {
                        HEADER: '새로운 오디션',
                        audition_no: dataList.list[index].audition_no,
                    });
                    break;
                case 'EVAL':
                    props.navigation.navigate('ProfileReview');
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        _getNotificationList(true);
    }, []);

    const _renderNoticeList = ({item, index}) => (
        <>
            <TouchableOpacity
                style={{...styles.viewNoticeArea, backgroundColor: item.confirm_yn ? 'white' : '#f7f7f7'}}
                onPress={() => _confirmNotification(item.notify_no, item.link, index)}
            >
                <Text style={{...styles.txtTitle}}>
                    <Text style={{...styles.txtTitle, fontWeight: 'bold'}}>{'[알림] '}</Text>
                    {`${item.content}`}
                </Text>
                <Text style={{...styles.txtUploadReg}}>{timeForToday(item.reg_dt)}</Text>
            </TouchableOpacity>
            <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
        </>
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
                centerComponent={{text: '알림확인', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                {
                    isEmptyArr(dataList.list) ? (
                        <View style={{...styles.viewEmptyNotice}}>
                            <Icon name="ios-alert-circle-outline" type="ionicon" size={scale(75)} color="#dddddd" />
                            <Text style={{...styles.txtEmptyNotice}}>새로운 알림이 없습니다!</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={dataList.list}
                            renderItem={_renderNoticeList}
                            keyExtractor={(item, index) => `notice_${index}`}
                            refreshing={isLoading}
                            onRefresh={() => _getNotificationList(true)}
                            onEndReached={() => _getNotificationList()}
                            onEndReachedThreshold={0.1}
                        />
                    )
                }
            </SafeAreaView>
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewNoticeArea: {
        paddingHorizontal: scale(25),
        paddingVertical: scale(15),
    },
    viewHeadArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: scale(10),
    },
    txtIsAnswer: {
        color: 'white',
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        marginRight: scale(10),
    },
    txtUploadReg: {
        fontSize: scale(10),
        color: '#999999',
    },
    txtTitle: {
        marginBottom: scale(5),
        fontSize: scale(14),
    },
    viewEmptyNotice: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    txtEmptyNotice: {
        fontSize: scale(14),
        color: '#999999',
    },
    viewNoticeContentArea: {
        padding: scale(25),
        paddingVertical: 0,
        paddingBottom: scale(15),
    },
});