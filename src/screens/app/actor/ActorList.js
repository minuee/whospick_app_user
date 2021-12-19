import React, {useEffect, useState} from 'react';
import {FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';
import {logging} from '../../../common/Utils';

import {Header} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

const ActorList = props => {
    const [dataList, setDataList] = useState({list: []});
    const _getActorList = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            let apiResult;
            switch (props.route.params.HEADER) {
                case '급상승 배우':
                    apiResult = await apiObject.getRisingActorList({
                        next_token: bool ? null : dataList.next_token,
                    });
                    break;
                case '인기 배우':
                    apiResult = await apiObject.getPopularActorList({
                        next_token: bool ? null : dataList.next_token,
                    });
                    break;
                case '실시간 배우':
                    apiResult = await apiObject.getRealTimeActorList({
                        next_token: bool ? null : dataList.next_token,
                    });
                    break;
            }
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
            logging(error.response?.data, 'popular||rising||realtime-actor-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getActorList(true);
    }, []);

    const _renderActorList = ({item, index}) => (
        <TouchableOpacity
            style={{...styles.viewActorArea}}
            activeOpacity={1}
            onPress={() => props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}
        >
            <FastImage source={{uri: item.image_url}} style={{...styles.imgActor}} resizeMode={FastImage.resizeMode.cover} />
            <View style={{...styles.viewActorInfo}}>
                <Text style={{...styles.txtActorName, fontSize: scale(15), flex: 1}}>{item.name}</Text>
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
                centerComponent={{
                    text: props.route.params.HEADER,
                    style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
                }}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <FlatList
                    keyExtractor={(item, index) => `actorList_${index}`}
                    data={dataList.list}
                    renderItem={_renderActorList}
                    refreshing={false}
                    onRefresh={() => _getActorList(true)}
                    onEndReached={() => _getActorList()}
                    onEndReachedThreshold={0.1}
                    style={{marginTop: scale(5)}}
                    contentContainerStyle={{padding: scale(15)}}
                />
            </SafeAreaView>
        </View>
    );
};

export default ActorList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewActorArea: {
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
    imgActor: {
        flex: 1,
        height: scale(100),
        borderTopLeftRadius: scale(5),
        borderBottomLeftRadius: scale(5),
    },
    viewActorInfo: {
        flex: 2,
        paddingVertical: scale(10),
        paddingHorizontal: scale(20),
        justifyContent: 'space-between',
    },
    viewActorTagArea: {
        flexDirection: 'row',
    },
    txtActorPrivate: {
        fontSize: scale(10),
        color: '#e5293e',
    },
});