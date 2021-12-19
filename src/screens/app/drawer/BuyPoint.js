import React, {useEffect, useState} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

import scale from '../../../common/Scale';
import {AddComma, isEmpty, logging} from '../../../common/Utils';
import {apiObject} from '../../../common/API';

import {Button, Header, Input} from 'react-native-elements';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';

const BuyPoint = props => {
    const [payAmount, setPayAmount] = useState('');
    const [paymentType, setPaymentType] = useState({});
    const [payUnitList, setPayUnitList] = useState([]);
    const [paymentArr, setPaymentArr] = useState([]);
    const [isKeyboardShowing, setKeyboardShowing] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'ios') {
            const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => setKeyboardShowing(true));
            const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => setKeyboardShowing(false));
            return () => {
                keyboardWillShowListener.remove();
                keyboardWillHideListener.remove();
            };
        }
    }, []);

    useEffect(() => {
        _getPayUnitList();
        _getPayMethodList();
    }, []);

    const _getPayUnitList = async () => {
        try {
            const apiResult = await apiObject.getPayUnitList();
            setPayUnitList(apiResult.list);
        } catch (error) {
            //console.log('🚀 ~ const_getPayUnitList= ~ error', error);
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
            logging(error.response?.data, 'pay-unit-list');
        }
    };

    const _getPayMethodList = async () => {
        try {
            const apiResult = await apiObject.getPayMethodList();
            setPaymentArr(apiResult.list);
        } catch (error) {
            //console.log('🚀 ~ const_getPayMethodList= ~ error', error);
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
            logging(error.response?.data, 'pay-method-list');
        }
    };

    const _createOrderNo = async () => {
        try {
            const apiResult = await apiObject.createOrderNo({
                pay_point: payAmount,
                pay_method: paymentType.paymentType,
            });
            //console.log(apiResult.merchant_uid);
            props.navigation.replace('Payment', {
                TYPE: paymentType,
                AMOUNT: payAmount,
                ORDER_NO: apiResult.merchant_uid,
                AUDITION_INFO: isEmpty(props.route.params) ? undefined : props.route.params,
            });
        } catch (error) {
            //console.log('🚀 ~ _createOrderNo= ~ error', error);
            logging(error.response?.data, 'actor/merchant-uid');
        }
    };

    return (
        <KeyboardAvoidingView style={{...styles.container}} behavior={Platform.OS === 'ios' ? 'padding' : null}>
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
            centerComponent={{text: '포인트 충전', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
            containerStyle={{borderBottomWidth: 0}}
        />
        <SafeAreaView style={{...styles.contents}}>
            <ScrollView>
                <View style={{...styles.viewScrollInner}}>
                    <Input
                        editable={false}
                        placeholder="금액을 선택해주세요."
                        inputStyle={{fontSize: scale(20), textAlign: 'center'}}
                        keyboardType="number-pad"
                        value={AddComma(payAmount)}
                        onChangeText={text => setPayAmount(text.replace(/,/gi, ''))}
                    />
                    <View style={{...styles.viewIncreaseArea}}>
                        {
                            payUnitList.map((item, index) =>item.use_yn && (
                            <Button
                                key={`payUnit_${index}`}
                                title={item.content}
                                titleStyle={{color: 'black', fontSize: scale(14), fontWeight: 'bold'}}
                                type="outline"
                                buttonStyle={{backgroundColor: 'white', borderColor: '#707070'}}
                                containerStyle={{width: `${parseInt(100 / payUnitList.length - 1, 10)}%`}}
                                onPress={() => setPayAmount(Number(payAmount) + item.money)}
                            />
                            ))
                        }
                    </View>
                    <View style={{flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between'}}>
                        {
                            paymentArr.map((item, index) => (
                            <Button
                                key={`payment_${index}`}
                                title={item.label}
                                titleStyle={{color: paymentType.label === item.label ? 'white' : 'black', fontSize: scale(12)}}
                                type="outline"
                                buttonStyle={{
                                    backgroundColor: paymentType.label === item.label ? '#e5293e' : 'white',
                                    borderColor: '#707070',
                                    paddingVertical: scale(8),
                                }}
                                containerStyle={{width: '32%', marginBottom: scale(10)}}
                                onPress={() => setPaymentType(item)}
                            />
                            ))
                        }
                    </View>
                    <Text style={{fontSize: scale(12), color: '#999999'}}>
                        1. 관리자가 판단하여 올바르지 못한 오디션일 경우 오디션 공고 삭제조치 및 자동 환불처리 됩니다.
                    </Text>
                    <Text style={{fontSize: scale(12), color: '#999999'}}>
                        2.환불 처리까지 카드사의 정책에따라 한달 정도 소요됩니다.
                    </Text>
                    <Text style={{fontSize: scale(12), color: '#999999'}}>
                        3.배우님의 실수로 인한 결제는 환불을 도와드리기 어려우니 신중히 검토 후 이용바랍니다.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
        <Button
            disabled={!(!isEmpty(paymentType) && !isEmpty(payAmount) && Number(payAmount) >= 100)}
            title="결제요청"
            containerStyle={{borderRadius: 0}}
            buttonStyle={{
                borderRadius: 0,
                paddingBottom: isIphoneX() ? (isKeyboardShowing ? scale(15) : getBottomSpace()) : scale(15),
                paddingTop: scale(15),
                backgroundColor: '#e5293e',
            }}
            onPress={() => _createOrderNo()}
        />
    </KeyboardAvoidingView>
    );
};

export default BuyPoint;

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
    viewIncreaseArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(25),
    },
});
