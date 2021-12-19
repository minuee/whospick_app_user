import React, {useContext, useState} from 'react';
import {SafeAreaView,StyleSheet,TextInput,View,Text,ScrollView,KeyboardAvoidingView,Platform,} from 'react-native';
import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';
import {Button, Header} from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import {isIOS, logging} from '../../../common/Utils';

const QnAWrite = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const [requestData, setRequestData] = useState({
        title: '',
        body: '',
    });
    const _onWritePress = async () => {
        try {
            await apiObject.addMyQnA({
                title: requestData.title,
                content: requestData.body,
                },loading => setIsLoading(loading)
            );

            let tmpArr = [...props.route.params.DATA_LIST.list];
            tmpArr.unshift({
                a_content: '',
                a_title: '',
                answer_yn: false,
                q_content: requestData.body,
                q_title: requestData.title,
                reg_dt: +new Date() / 1000,
            });
            Toast.showWithGravity('문의가 등록되었습니다.', Toast.SHORT, Toast.CENTER);
            props.route.params.SET_DATA_LIST({...props.route.params.DATA_LIST, list: tmpArr});
            props.navigation.goBack();
        } catch (error) {
            logging(error.response?.data, 'qna');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    return (
        <KeyboardAvoidingView style={{...styles.container}} behavior={isIOS() ? 'padding' : null}>
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
                centerComponent={{text: '문의하기', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewInner}}>
                        <View style={{...styles.viewInputArea}}>
                            <TextInput
                                placeholder="문의 제목"
                                padding={0}
                                style={{fontSize: scale(14)}}
                                value={requestData.title}
                                onChangeText={text => setRequestData({...requestData, title: text})}
                                maxLength={30}
                            />
                        </View>
                        <Text>문의내용</Text>
                        <View style={{...styles.viewInputArea, height: scale(300), marginTop: scale(10)}}>
                            <TextInput
                                multiline={true}
                                placeholder="내용을 입력하세요."
                                style={{fontSize: scale(14), flex: 1}}
                                textAlignVertical="top"
                                padding={0}
                                value={requestData.body}
                                onChangeText={text => setRequestData({...requestData, body: text})}
                            />
                        </View>
                        <Button
                            disabled={!(requestData.title !== '' && requestData.body !== '')}
                            title="문의하기"
                            titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                            buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
                            onPress={() => _onWritePress()}
                            loading={isLoading}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default QnAWrite;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewInner: {
        padding: scale(25),
    },
    viewInputArea: {
        borderRadius: scale(3),
        borderWidth: scale(1),
        borderColor: '#dddddd',
        marginBottom: scale(20),
        padding: scale(10),
    },
});