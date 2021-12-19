import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {AddComma, isEmptyArr, logging, YYYYMMDDHHMM} from '../../../common/Utils';

import {Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import Toast from 'react-native-simple-toast';

import {apiObject} from '../../../common/API';

const PointUsedHistory = props => {
    const [dataList, setDataList] = useState({list: [], year_list: []});
    const [year, setYear] = useState('');
    const [isModalYearOpend, setIsModalYearOpend] = useState(false);
    const _getPointUsedHistory = async () => {
        try {
            const apiResult = await apiObject.getPointUsedHistory({
                year: year,
            }); 
            setDataList(apiResult);
            setYear(apiResult.year_list[0]);
        } catch (error) {
            //console.log('🚀 ~ _getPointUsedHistory= ~ error', error);
            logging(error.response?.data, 'payments/pay-list/use');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getPointUsedHistory();
    }, [year]);
    
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
                    text: '최근 포인트 사용내역',
                    style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
                }}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                {
                    !isEmptyArr(dataList.list) && (
                    <TouchableOpacity
                        onPress={() => setIsModalYearOpend(true)}
                        style={{borderRadius: scale(5),borderColor: '#dddddd',borderWidth: scale(1),alignSelf: 'flex-end',paddingHorizontal: scale15),paddingVertical: scale(5),marginTop: scale(15),marginRight: scale(15),flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',width: scale(120),}}
                    >
                        <Text>{year}</Text>
                        <Icon name="keyboard-arrow-down" size={scale(25)} color="#dddddd" />
                    </TouchableOpacity>
                    )
                }
                <ScrollView>
                {
                    dataList.list.map((item, index) => (
                    <View style={{...styles.viewScrollInner}} key={`month_${index}`}>
                        <Text style={{...styles.txtUserName, marginBottom: scale(10)}}>{`${item.reg_month}월 사용내역`}</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginBottom: scale(20)}}>
                            {
                                item.each_list.map((d, i) => (
                                <View style={{...styles.viewPointUsedHistory}} key={`usedPoint_${i}`}>
                                    {
                                        d.image_url !== null ? (
                                        <FastImage style={{...styles.imgAutidionPoster}} source={{uri: d.image_url}} />
                                        ) : (
                                        <View style={{...styles.imgAutidionPoster,backgroundColor: '#dddddd',justifyContent: 'center',alignItems: 'center',}}>
                                            <Text>이미지 없음</Text>
                                        </View>
                                        )
                                    }
                                    <Text style={{...styles.txtPointUsedType}}>{'공고 지원'}</Text>
                                    <Text style={{...styles.txtDecreasePoint}}>
                                        {`-${AddComma(d.use_point)}`}
                                        <Text style={{color: 'black'}}> P</Text>
                                    </Text>
                                </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                    ))
                }
                </ScrollView>
            </SafeAreaView>
            <Modal
                isVisible={isModalYearOpend}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                onBackdropPress={() => setIsModalYearOpend(false)}
                onBackButtonPress={() => setIsModalYearOpend(false)}
                coverScreen={false}
                style={{justifyContent: 'flex-end', margin: 0}}
                statusBarTranslucent={true}
            >
                <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
                    <Text style={{textAlign: 'center', fontSize: scale(16), marginTop: scale(5)}}>연도 선택</Text>
                    <ScrollView>
                        {
                            dataList.year_list.map((item, index) => (
                            <TouchableOpacity
                                key={`topSize_${index}`}
                                style={{marginVertical: scale(6)}}
                                onPress={() => {setYear(item);setIsModalYearOpend(false);}}
                            >
                                <Text style={{textAlign: 'center',fontSize: scale(20),color: year === item ? '#e5293e' : 'black',}}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

export default PointUsedHistory;

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
    },
    txtUserName: {
        fontSize: scale(14),
        fontWeight: 'bold',
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
});