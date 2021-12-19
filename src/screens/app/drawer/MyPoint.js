import React, {useCallback, useContext, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import scale from '../../../common/Scale';
import {AddComma, isEmptyArr, logging, YYYYMMDDHHMM} from '../../../common/Utils';

import {Button, Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import {useFocusEffect} from '@react-navigation/native';

import UserTokenContext from '../../../Context/UserTokenContext';
import {apiObject} from '../../../common/API';

const MyPoint = props => {
    const {userName, setUserInfo} = useContext(UserTokenContext);
    const [dataList, setDataList] = useState({use_list: [], charge_list: [], point: '0', point_list: []});
    const _getPointHistory = async () => {
        try {
            const apiResult = await apiObject.getPointHistory();
            setDataList(apiResult);
            setUserInfo({userPoint: apiResult.point});
        } catch (error) {
            //console.log('🚀 ~ _getPointHistory= ~ error', error);
            logging(error.response?.data, 'payments/main-page');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };
    useFocusEffect(
        useCallback(() => {
            _getPointHistory();
        }, [])
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
                centerComponent={{text: '포인트 결제/관리', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewScrollInner}}>
                        <Text style={{...styles.txtUserName}}>{`${userName} 님`}</Text>
                        <Text style={{...styles.txtPointLabel}}>지금 사용 가능한 포인트</Text>
                        <View style={{...styles.viewPointArea}}>
                            <View style={{...styles.viewPoint}}>
                                <Text style={{...styles.txtPoint}}>{AddComma(dataList.point)}</Text>
                                <Icon name="parking" type="font-awesome-5" size={scale(25)} color="#e5293e" />
                            </View>
                            <Button
                                title="포인트 반환내역"
                                buttonStyle={{backgroundColor: 'black', paddingVertical: scale(5), paddingHorizontal: scale(15)}}
                                onPress={() => props.navigation.navigate('PointRefundHistory')}
                            />
                        </View>
                        <Button
                            title="포인트 충전"
                            titleStyle={{marginLeft: scale(5), fontSize: scale(14)}}
                            buttonStyle={{backgroundColor: '#e5293e', paddingVertical: scale(10)}}
                            icon={
                                <FastImage
                                    source={require('../../../../assets/images/drawable-xxxhdpi/coin.png')}
                                    style={{width: scale(20), height: scale(20)}}
                                />
                            }
                            onPress={() => props.navigation.navigate('BuyPoint')}
                            containerStyle={{marginBottom: scale(20)}}
                        />
                        {
                            !isEmptyArr(dataList.use_list) && (
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate('PointUsedHistory')}
                                style={{marginBottom: scale(10)}}
                            >
                                <Text style={{...styles.txtUserName}}>{'최근 포인트 사용내역 >'}</Text>
                            </TouchableOpacity>
                            )
                        }
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginBottom: scale(20)}}>
                            {
                                dataList.use_list.map((item, index) => (
                                    <View style={{...styles.viewPointUsedHistory}} key={`usedPoint_${index}`}>
                                    {
                                        item.image_url !== null ? (
                                            <FastImage style={{...styles.imgAutidionPoster}} source={{uri: item.image_url}} />
                                        ) : (
                                        <View style={{...styles.imgAutidionPoster,backgroundColor: '#dddddd',justifyContent: 'center',alignItems: 'center',}}>
                                            <Text>이미지 없음</Text>
                                        </View>
                                        )
                                    }
                                        <Text style={{...styles.txtPointUsedType}}>{'공고 지원'}</Text>
                                        <Text style={{...styles.txtDecreasePoint}}>
                                            {`-${AddComma(item.use_point)}`}
                                            <Text style={{color: 'black'}}> P</Text>
                                        </Text>
                                    </View>
                                ))
                            }
                        </ScrollView>
                        {
                            !isEmptyArr(dataList.charge_list) && (
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate('PointBuyHistory')}
                                style={{marginBottom: scale(10)}}
                            >
                                <Text style={{...styles.txtUserName}}>{'최근 포인트 구매내역 >'}</Text>
                            </TouchableOpacity>
                            )
                        }
                        {
                            dataList.charge_list.map((item, index) => (
                                <View style={{...styles.viewPointBuyHistory}} key={`buyPoint_${index}`}>
                                    <Text style={{...styles.txtBuyDate}}>{YYYYMMDDHHMM(item.reg_dt)}</Text>
                                    <Text style={{...styles.txtIncreasePoint}}>
                                        {`+${AddComma(item.charge_point)}`}
                                        <Text style={{color: 'black'}}> P</Text>
                                    </Text>
                                </View>
                            ))
                        }
                        {
                            !isEmptyArr(dataList.point_list) && (
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate('PointSaveUpHistory')}
                                style={{marginBottom: scale(10)}}
                            >
                                <Text style={{...styles.txtUserName}}>{'최근 포인트 적립내역 >'}</Text>
                            </TouchableOpacity>
                            )
                        }
                        {
                            dataList.point_list.map((item, index) => (
                                <View style={{...styles.viewPointBuyHistory}} key={`saveUpPoint_${index}`}>
                                    <Text style={{...styles.txtBuyDate}}>{YYYYMMDDHHMM(item.reg_dt)}</Text>
                                    <Text style={{...styles.txtIncreasePoint}}>
                                        {`+${AddComma(item.charge_point)}`}
                                        <Text style={{color: 'black'}}> P</Text>
                                    </Text>
                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default MyPoint;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewScrollInner: {
        paddingHorizontal: scale(15),
        paddingVertical: scale(20),
    },
    txtUserName: {
        fontSize: scale(14),
        fontWeight: 'bold',
    },
    txtPointLabel: {
        fontSize: scale(10),
        color: '#dddddd',
    },
    viewPointArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: scale(20),
    },
    viewPoint: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    txtPoint: {
        fontSize: scale(35),
        fontWeight: 'bold',
        marginRight: scale(5),
    },
    viewPointUsedHistory: {
        marginRight: scale(10),
        alignItems: 'center',
    },
    imgAutidionPoster: {
        width: scale(110),
        height: scale(110),
        borderRadius: scale(5),
        borderColor: '#dddddd',
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: scale(5),
    },
    txtPointUsedType: {
        fontSize: scale(10),
        color: '#dddddd',
    },
    txtDecreasePoint: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#e5293e',
    },
    txtIncreasePoint: {
        fontSize: scale(12),
        fontWeight: 'bold',
        color: '#e5293e',
    },
    viewPointBuyHistory: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: scale(15),
        borderBottomColor: '#dddddd',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    txtBuyDate: {
        fontSize: scale(13.5),
        fontWeight: 'bold',
    },
});
