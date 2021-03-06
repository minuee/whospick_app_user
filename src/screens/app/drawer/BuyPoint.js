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
            //console.log('π ~ const_getPayUnitList= ~ error', error);
            Toast.show('λ€νΈμν¬ ν΅μ  μ€ μ€λ₯κ° λ°μνμ΅λλ€.\nμ μ ν λ€μ μλν΄μ£ΌμΈμ.', Toast.SHORT);
            logging(error.response?.data, 'pay-unit-list');
        }
    };

    const _getPayMethodList = async () => {
        try {
            const apiResult = await apiObject.getPayMethodList();
            setPaymentArr(apiResult.list);
        } catch (error) {
            //console.log('π ~ const_getPayMethodList= ~ error', error);
            Toast.show('λ€νΈμν¬ ν΅μ  μ€ μ€λ₯κ° λ°μνμ΅λλ€.\nμ μ ν λ€μ μλν΄μ£ΌμΈμ.', Toast.SHORT);
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
            //console.log('π ~ _createOrderNo= ~ error', error);
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
            centerComponent={{text: 'ν¬μΈνΈ μΆ©μ ', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
            containerStyle={{borderBottomWidth: 0}}
        />
        <SafeAreaView style={{...styles.contents}}>
            <ScrollView>
                <View style={{...styles.viewScrollInner}}>
                    <Input
                        editable={false}
                        placeholder="κΈμ‘μ μ νν΄μ£ΌμΈμ."
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
                        1. κ΄λ¦¬μκ° νλ¨νμ¬ μ¬λ°λ₯΄μ§ λͺ»ν μ€λμμΌ κ²½μ° μ€λμ κ³΅κ³  μ­μ μ‘°μΉ λ° μλ νλΆμ²λ¦¬ λ©λλ€.
                    </Text>
                    <Text style={{fontSize: scale(12), color: '#999999'}}>
                        2.νλΆ μ²λ¦¬κΉμ§ μΉ΄λμ¬μ μ μ±μλ°λΌ νλ¬ μ λ μμλ©λλ€.
                    </Text>
                    <Text style={{fontSize: scale(12), color: '#999999'}}>
                        3.λ°°μ°λμ μ€μλ‘ μΈν κ²°μ λ νλΆμ λμλλ¦¬κΈ° μ΄λ €μ°λ μ μ€ν κ²ν  ν μ΄μ©λ°λλλ€.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
        <Button
            disabled={!(!isEmpty(paymentType) && !isEmpty(payAmount) && Number(payAmount) >= 100)}
            title="κ²°μ μμ²­"
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
