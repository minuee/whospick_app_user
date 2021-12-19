import React, {useContext, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {changeTime, isEmpty, isEmptyArr, logging} from '../../../common/Utils';

import {Header, Icon} from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import {apiObject} from '../../../common/API';

const Notice = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const [dataList, setDataList] = useState({list: []});
    const [isOpendIndex, setIsOpendIndex] = useState(null);
    const _getNoticeList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getNoticeList({
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
            logging(error.response?.data, 'notice-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getNoticeList(true);
    }, []);

    const _renderNoticeList = ({item, index}) => (
    <>
        {
            index === 0 && (
            <>
            <TouchableOpacity
                style={{...styles.viewNoticeArea}}
                onPress={() => setIsOpendIndex(isEmpty(isOpendIndex) ? 'notice' : isOpendIndex === 'notice' ? null : 'notice')}
            >
                <Text style={{...styles.txtTitle}}>
                    <Text style={{...styles.txtTitle, fontWeight: 'bold'}}>{'[공지] '}</Text>
                    {'후즈픽 사업자 정보'}
                </Text>
                <Text style={{...styles.txtUploadReg}}>{changeTime(item.reg_dt)}</Text>
            </TouchableOpacity>
            {
                isOpendIndex === 'notice' && (
                <View style={{...styles.viewNoticeContentArea}}>
                    <Text>
                        {'상호명 : 후즈픽\n\n대표 : 전태후\n\n사업자번호 : 315-87-01770\n\n주소 : 서울특별시 동작구 동작대로35번길 29, 지하 1층(사당동)\n\n고객센터 : 070-4709-9350'}
                    </Text>
                </View>
                )
            }
            <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
            </>
            )
        }
        <TouchableOpacity
            style={{...styles.viewNoticeArea}}
            onPress={() => setIsOpendIndex(isEmpty(isOpendIndex) ? index : isOpendIndex === index ? null : index)}
        >
            <Text style={{...styles.txtTitle}}>
                <Text style={{...styles.txtTitle, fontWeight: 'bold'}}>{`[${item.notice_type_text}] `}</Text>
                {`${item.title}`}
            </Text>
            <Text style={{...styles.txtUploadReg}}>{changeTime(item.reg_dt)}</Text>
        </TouchableOpacity>
        {
            isOpendIndex === index && (
                <View style={{...styles.viewNoticeContentArea}}>
                    <Text>{item.content}</Text>
                </View>
            )
        }
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
                centerComponent={{text: '공지사항', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                {
                    isEmptyArr(dataList.list) ? (
                        <View style={{...styles.viewEmptyNotice}}>
                            <Icon name="ios-alert-circle-outline" type="ionicon" size={scale(75)} color="#dddddd" />
                            <Text style={{...styles.txtEmptyNotice}}>새로운 공지사항이 없습니다!</Text>
                        </View>
                    ) : (
                    <FlatList
                        data={dataList.list}
                        renderItem={_renderNoticeList}
                        keyExtractor={(item, index) => `notice_${index}`}
                        refreshing={isLoading}
                        onRefresh={() => _getNoticeList(true)}
                        onEndReached={() => _getNoticeList()}
                        onEndReachedThreshold={0.1}
                    />
                    )
                }
            </SafeAreaView>
        </View>
    );
};

export default Notice;

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