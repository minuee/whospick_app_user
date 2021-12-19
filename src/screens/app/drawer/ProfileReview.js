import React, {useContext, useEffect, useState} from 'react';
import {Alert, FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';
import {Header} from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import {isEmptyArr, logging, YYYYMMDDHHMM} from '../../../common/Utils';

const ProfileReview = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const [dataList, setDataList] = useState({list: [], total_count: 0});

    const _getRequestProfileList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getRequestProfileList({
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
            logging(error.response?.data, 'apply-eval-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _removeRequestProfile = (eval_apply_no, index) => {
        Alert.alert('[안내]', '평가 요청을 정말 삭제할까요?\n\n이 작업은 되돌릴 수 없습니다.', [
        {
            text: '취소',
            style: 'cancel',
        },
        {
            text: '삭제',
            onPress: async () => {
                try {
                    await apiObject.removeRequestProfile({eval_apply_no: [eval_apply_no]});
                    let tmpArr = [...dataList.list];
                    tmpArr.splice(index, 1);
                    setDataList({
                        ...dataList,
                        list: tmpArr,
                        total_count: dataList.total_count > 0 ? dataList.total_count - 1 : 0,
                    });
                } catch (error) {
                    logging(error.response?.data, 'remove-apply-eval');
                    Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
                }
            },
        },
        ]);
    };

    useEffect(() => {
        _getRequestProfileList(true);
    }, []);

    const _renderAuditionList = ({item, index}) => (
        <TouchableOpacity
            style={{...styles.viewAuditionCard}}
            key={`auditionCard_${index}`}
            onPress={() => item.eval_yn ? props.navigation.navigate('ProfileReviewDetail', {eval_apply_no: item.eval_apply_no}) : null}
        >
            <View style={{paddingHorizontal: scale(10)}}>
                <View style={{flexDirection: 'row',alignItems: 'center',marginBottom: scale(5),}}>
                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                    <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                </View>
                <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <TouchableOpacity 
                        style={{borderRadius: scale(5),backgroundColor: '#aaaaaa',paddingVertical: scale(2),width: scale(65),marginRight: scale(10)}}
                        onPress={() => _removeRequestProfile(item.eval_apply_no, index)}
                    >
                        <Text style={{color: 'white', textAlign: 'center'}}>요청삭제</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{borderRadius: scale(5),backgroundColor: item.eval_yn ? '#e5293e' : '#dddddd',paddingVertical: scale(2),width: scale(65),}}
                        onPress={() => item.eval_yn ? props.navigation.navigate('ProfileReviewDetail', {eval_apply_no: item.eval_apply_no}): null}
                    >
                        <Text style={{color: 'white', textAlign: 'center'}}>{item.eval_yn ? '평가보기' : '검토중'}</Text>
                    </TouchableOpacity>
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
                centerComponent={{text: '평가요청확인', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <View style={{...styles.viewScrollInner}}>
                    <Text style={{fontSize: scale(16),fontWeight: 'bold',color: '#e5293e',}}>{`평가 요청한 오디션 ${dataList.total_count}개`}</Text>
                </View>
                {
                    isEmptyArr(dataList.list) && (
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{fontSize: scale(16), color: '#a4a4a4'}}>내가 평가요청한 감독님들이 없어요 :(</Text>
                            <Text style={{fontSize: scale(16), marginVertical: scale(20), textAlign: 'center'}}>
                                {'마음에 드는 오디션에 지원하여\n내 프로필 평가 요청을 해볼까요?'}
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
                    keyExtractor={(item, index) => `audition_${index}`}
                    contentContainerStyle={{...styles.viewScrollInner, paddingTop: scale(5)}}
                    refreshing={isLoading}
                    onRefresh={() => _getRequestProfileList(true)}
                    onEndReached={() => _getRequestProfileList()}
                    onEndReachedThreshold={0.1}
                />
            </SafeAreaView>
        </View>
    );
};

export default ProfileReview;

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
