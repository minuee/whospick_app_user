import React, {useContext, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {changeTime, isEmptyArr, logging} from '../../../common/Utils';
import {apiObject} from '../../../common/API';

import {Divider, Header, Icon} from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';

const QnA = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const [dataList, setDataList] = useState({list: []});
    const [opendIndex, setOpendIndex] = useState(null);
    const _getMyQnAList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getMyQnAList(
            {
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
                });
            }
        } catch (error) {
            logging(error.response?.data, 'my-qna-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _renderQnAList = ({item, index}) => (
    <>
        <TouchableOpacity style={{...styles.viewQnAArea}} onPress={() => setOpendIndex(index)}>
            <View style={{...styles.viewHeadArea}}>
                <Text style={{...styles.txtIsAnswer, backgroundColor: item.answer_yn ? '#e5293e' : '#707070'}}>
                    {item.answer_yn ? '답변완료' : '답변대기'}
                </Text>
                <Text style={{...styles.txtUploadReg}}>{changeTime(item.reg_dt)}</Text>
            </View>
            <Text style={{...styles.txtTitle, fontWeight: 'bold'}}>{item.q_title}</Text>
            <Divider style={{marginVertical: scale(5)}} />
            <Text style={{...styles.txtTitle}}>{item.q_content}</Text>
        </TouchableOpacity>

        {
            opendIndex === index && item.answer_yn ? (
                <View style={{...styles.viewQnAArea, paddingTop: 0}}>
                    <Text>A : {`${item.a_content}`}</Text>
                </View>
            ) : null
        }
        <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
    </>
    );

    useEffect(() => {
        _getMyQnAList();
    }, []);

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
                centerComponent={{text: '1:1 고객문의', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                rightComponent={
                    <TouchableOpacity onPress={() => props.navigation.navigate('QnAWrite', {SET_DATA_LIST: setDataList, DATA_LIST: dataList})}>
                        <Text style={{fontSize: scale(14), color: 'white'}}>문의하기</Text>
                    </TouchableOpacity>
                }
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                {
                    isEmptyArr(dataList.list) ? (
                        <View style={{...styles.viewEmptyQnA}}>
                            <Icon name="ios-alert-circle-outline" type="ionicon" size={scale(75)} color="#dddddd" />
                            <Text style={{...styles.txtEmptyQnA}}>등록한 문의가 없습니다!</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={dataList.list}
                            renderItem={_renderQnAList}
                            keyExtractor={(item, index) => `QnA_${index}`}
                            refreshing={isLoading}
                            onRefresh={() => _getMyQnAList(true)}
                            onEndReached={() => _getMyQnAList()}
                            onEndReachedThreshold={0.1}
                        />
                    )}
            </SafeAreaView>
        </View>
    );
};

export default QnA;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewQnAArea: {
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
        fontSize: scale(14),
    },
    viewEmptyQnA: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    txtEmptyQnA: {
        fontSize: scale(14),
        color: '#999999',
    },
});