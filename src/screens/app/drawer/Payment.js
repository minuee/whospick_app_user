import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, View, SafeAreaView, StatusBar, Alert} from 'react-native';

import IMP from 'iamport-react-native';
import axios from 'axios';

import LoadingIndicator from '../../../Component/LoadingIndicator';
import {apiObject} from '../../../common/API';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

import Toast from 'react-native-simple-toast';
import {isEmpty, replaceEmail, logging, AddComma} from '../../../common/Utils';
import {Header} from 'react-native-elements';
import scale from '../../../common/Scale';

const Payment = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
    const {userName, userPhone, userEmail, setUserInfo, userPoint} = useContext(UserTokenContext);
    const [accessToken, setAccessToken] = useState('');

    const data = {
        pg: props.route.params.TYPE.pgType,
        pay_method: props.route.params.TYPE.paymentType,
        name: `후즈픽 ${AddComma(props.route.params.AMOUNT)} 포인트 결제`,
        merchant_uid: props.route.params.ORDER_NO,
        amount: props.route.params.AMOUNT,
        digital: true,
        // amount: 100,
        buyer_name: userName,
        buyer_tel: userPhone,
        buyer_email: replaceEmail(userEmail),
        app_scheme: 'awesomewhospickapp',
    };

    useEffect(() => {
        const _getToken = async () => {
            await axios.post('https://api.iamport.kr/users/getToken', {
                imp_key: '5187033609230758',
                imp_secret: 'FfmSYF6xNVhPhCumAILErivqdE7GFTGl92e7IlFvgXlxzPU9yFN0XjrbYyREsxZBAdJiypOPm9nWZh5x',
            }).then(response => {
                setAccessToken(response.data.response.access_token);
            });
        };
        _getToken();
    }, []);

    const _getPaymentResult = async (impNum, resp) => {
        await axios.get('https://api.iamport.kr/payments/' + impNum, {headers: {Authorization: accessToken}})
        .then(response => {
            if (response.data.response.status === 'paid' && response.data.response.amount === Number(props.route.params.AMOUNT)) {
                _applyOrder(response.data.response.imp_uid, response.data.response.merchant_uid);
            } else {
                Alert.alert('[오류]', `결제에 실패했습니다.\n${resp.error_msg}`, [
                    {
                        text: '확인',
                        style: 'cancel',
                        onPress: () => props.navigation.goBack(null),
                    },
                ]);
            }
        }).catch(error => {
            console.log(error.data);
        });
    };

    const _applyOrder = async (imp_uid, merchant_uid) => {
        try {
            const apiResult = await apiObject.applyOrder({
                imp_uid: imp_uid,
                merchant_uid: merchant_uid,
                audition_recruit_no: isEmpty(props.route.params.AUDITION_INFO)
                ? undefined
                : [props.route.params.AUDITION_INFO.audition_recruit_no],
            });
            if (isEmpty(props.route.params.AUDITION_INFO)) {
                Toast.showWithGravity('포인트 충전이 완료되었습니다.', Toast.SHORT, Toast.CENTER);
                setUserInfo({userPoint: userPoint + Number(props.route.params.AMOUNT)});
                props.navigation.goBack(null);
            } else {
                if (!apiResult.payable) {
                    Alert.alert('[안내]', '포인트 충전은 완료되었으나\n오디션 지원을 위한 포인트가 부족합니다.', [
                        {
                            text: '확인',   
                            style: 'cancel',
                            onPress: () => props.navigation.goBack(null),
                        },
                    ]);
                } else {
                    Toast.showWithGravity(
                        `포인트 충전 및 '${props.route.params.AUDITION_INFO.role_name}'배역에 오디션 지원되었습니다.`,
                        Toast.SHORT,
                        Toast.CENTER
                    );
                    props.navigation.goBack(null);
                }
            }
        } catch (error) {
            //console.log('🚀 ~ const_applyOrder ~ error', error);
            logging(error.response?.data, 'payments/complete');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

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
                centerComponent={{text: '결제', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.content}}>
                <IMP.Payment
                    userCode={'imp99164079'}
                    loading={<LoadingIndicator />}
                    data={data}
                    callback={response => {
                        _getPaymentResult(response.imp_uid, response);
                    }}
                />
            </SafeAreaView>
        </View>
    );
};

export default Payment;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
    },
});
