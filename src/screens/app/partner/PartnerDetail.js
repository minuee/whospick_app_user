import React, {useContext, useEffect, useRef, useState} from 'react';
import {SafeAreaView,ScrollView,StyleSheet,Text,TouchableOpacity,View,TextInput,KeyboardAvoidingView,Platform,} from 'react-native';
import scale from '../../../common/Scale';
import {changeTime, isEmpty, logging, timeForToday} from '../../../common/Utils';
import {apiObject} from '../../../common/API';
import {Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import UserTokenContext from '../../../Context/UserTokenContext';

const PartnerDetail = props => {
    const {userName, userImage} = useContext(UserTokenContext);
    const refTextInput = useRef(null);
    const postInfo = {
        partnerType: props.route.params.partnerType,
        title: props.route.params.title,
        uploadReg: props.route.params.uploadReg,
        affiliate_no: props.route.params.affiliate_no,
    };
    const [dataList, setDataList] = useState({
        comment: [],
        content: '',
        comment_count: 0,
    });
    const [inputText, setInputText] = useState('');
    const [inputSubIndex, setInputSubIndex] = useState(null);
    const [inputSubActorName, setInputSubActorName] = useState('');

    const _getPartnerDetail = async () => {
        try {
            const apiResult = await apiObject.getPartnerDetail({
                affiliate_no: postInfo.affiliate_no,
            });
            setDataList(apiResult);
        } catch (error) {
            logging(error.response?.data, 'affiliate/...');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _addPartnerComment = async affiliate_comment_no => {
        await apiObject.addPartnerComment({
            affiliate_no: postInfo.affiliate_no,
            content: inputText,
            affiliate_comment_no: affiliate_comment_no ? affiliate_comment_no : '',
        });
        _getPartnerDetail();
    };

    const _onSubCommentPress = index => {
        setInputSubActorName(dataList.comment[index].user_name);
        setInputSubIndex(index);
        refTextInput.current.focus();
    };

    const _onPostComment = () => {
        if (inputText.replace(/\s+/g, '').length === 0) {
            return null;
        }
        let tmpArr = [...dataList.comment];
        if (!isEmpty(inputSubIndex)) {
            try {
                _addPartnerComment(tmpArr[inputSubIndex].affiliate_comment_no);
            } catch (error) {
                logging(error.response?.data, 'affiliate/.../comment');
                Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
            }
        } else {
            try {
                _addPartnerComment();
            } catch (error) {
                logging(error.response?.data, 'affiliate/.../comment');
                Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
            }
        }
        setInputText('');
    };

    useEffect(() => {
        _getPartnerDetail();
    }, []);

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
                centerComponent={{text: '자세히보기', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewScrollInner}}>
                        <Text style={{...styles.txtPartnerType}}>{`[${postInfo.partnerType}]`}</Text>
                        <Text style={{...styles.txtTitle}}>{`${postInfo.title}`}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{fontSize: scale(10),color: '#bababa',}}>{`${changeTime(postInfo.uploadReg)}`}</Text>
                        </View>
                        <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd', marginVertical: scale(20)}} />
                        {
                            !isEmpty(dataList.image_url) && (
                            <FastImage source={{uri: dataList.image_url}} style={{height: scale(200), marginBottom: scale(15)}} />
                            )
                        }
                        <Text style={{...styles.txtPostDesc}}>{`${dataList.content}`}</Text>
                        <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd', marginVertical: scale(20)}} />
                        <View style={{...styles.viewCommentRefreshArea}}>
                            <Text style={{...styles.txtCommentLabel}}>{`댓글 (${dataList.comment_count})`}</Text>
                            <Icon name="ios-reload" type="ionicon" color="#e5293e" onPress={() => _getPartnerDetail()} />
                        </View>
                        {
                            dataList.comment.map((item, index) => (
                            <View key={`comment_${index}`}>
                                <View style={{...styles.viewCommentArea}}>
                                    <FastImage
                                        source={isEmpty(item.profile_image)? require('../../../../assets/images/drawable-xxxhdpi/profile.png'): {uri: item.profile_image}}
                                        style={{width: scale(35), height: scale(35), borderRadius: scale(50), marginRight: scale(10)}}
                                    />
                                <View style={{flex: 1}}>
                                    <Text style={{...styles.txtCommentUserName}}>{`${item.user_name}`}</Text>
                                    <Text style={{...styles.txtCommentDesc}}>{`${item.content}`}</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={{...styles.txtCommentUploadReg, marginRight: scale(10)}}>
                                            {`${timeForToday(item.reg_dt)}`}
                                        </Text>
                                        <TouchableOpacity onPress={() => _onSubCommentPress(index)}>
                                            <Text style={{...styles.txtCommentUploadReg}}>답글달기</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            {
                                item.reply.map((d, i) => (
                                <View style={{...styles.viewCommentArea}} key={`subComment_${i}`}>
                                    <Icon
                                        name="subdirectory-arrow-right"
                                        color="#dddddd"
                                        style={{width: scale(35), height: scale(35)}}
                                    />
                                    <FastImage
                                        source={isEmpty(d.profile_image)? require('../../../../assets/images/drawable-xxxhdpi/profile.png'): {uri: d.profile_image}}
                                        style={{width: scale(35), height: scale(35), borderRadius: scale(50), marginRight: scale(10)}}
                                    />
                                    <View style={{flex: 1}}>
                                        <Text style={{...styles.txtCommentUserName}}>{`${d.user_name}`}</Text>
                                        <Text style={{...styles.txtCommentDesc}}>{`${d.content}`}</Text>
                                        <Text style={{...styles.txtCommentUploadReg, marginRight: scale(10)}}>
                                            {`${timeForToday(d.reg_dt)}`}
                                        </Text>
                                    </View>
                                </View>
                                ))
                            }
                            </View>
                            ))
                        }
                    </View>
                </ScrollView>
                <View style={{...styles.viewInputArea}}>
                    {
                        !isEmpty(inputSubIndex) ? (
                            <View style={{...styles.viewInputSubArea}}>
                                <Text>
                                    <Text style={{fontWeight: 'bold'}}>{`${inputSubActorName}`}</Text>
                                    {'님에게 답글 남기는 중 • '}
                                </Text>
                                <TouchableOpacity onPress={() => {setInputSubIndex(null);setInputSubActorName('');}}>
                                    <Text>취소</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TextInput 
                            ref={refTextInput}
                            placeholder="바르고 고운 말을 씁시다."
                            style={{backgroundColor: '#f7f7f7', flex: 1, marginRight: scale(10)}}
                            placeholderTextColor="#b0b0b0"
                            padding={scale(10)}
                            onChangeText={text => setInputText(text)}
                            value={inputText}
                        />
                        <Icon
                            name="send"
                            size={scale(25)}
                            color={inputText.replace(/\s+/g, '').length === 0 ? '#b0b0b0' : '#e5293e'}
                            onPress={() => _onPostComment()}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default PartnerDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewScrollInner: {
        padding: scale(20),
    },
    txtPartnerType: {
        fontSize: scale(12),
        color: '#e5293e',
        marginBottom: scale(5),
    },
    txtTitle: {
        fontSize: scale(14),
        fontWeight: 'bold',
        marginBottom: scale(5),
    },
    txtPostDesc: {
        fontSize: scale(12),
        lineHeight: scale(20),
    },
    txtCommentLabel: {
        fontSize: scale(16),
        fontWeight: 'bold',
    },
    viewCommentArea: {
        flexDirection: 'row',
        paddingVertical: scale(10),
    },
    viewCommentRefreshArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    txtCommentUserName: {
        fontSize: scale(12),
        fontWeight: 'bold',
    },
    txtCommentDesc: {
        fontSize: scale(12),
        color: '#555555',
        marginVertical: scale(5),
    },
    txtCommentUploadReg: {
        fontSize: scale(10),
        color: '#999999',
    },
    viewInputArea: {
        paddingHorizontal: scale(15),
        paddingVertical: scale(10),
        borderTopWidth: scale(1),
        borderColor: '#d7d7d7',
    },
    viewInputSubArea: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(10),
    },
});
