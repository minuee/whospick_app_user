import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

import scale from '../../../common/Scale';
import {isEmpty, logging} from '../../../common/Utils';

import {AirbnbRating, Header, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import {apiObject} from '../../../common/API';

const ProfileReviewDetail = props => {
    const [dataList, setDataList] = useState({
        age: 0,
        direct_input: '',
        director_image: '',
        director_name: '',
        feedback_content: null,
        height: 0,
        image_url: '',
        keyword: [],
        name: '',
        star: 0,
        weight: 0,
        work_title: '',
    });

    const _getRequestProfileDetail = async () => {
        try {
            const apiResult = await apiObject.getRequestProfileDetail({eval_apply_no: props.route.params.eval_apply_no});
            setDataList(apiResult);
        } catch (error) {
            logging(error.response?.data, 'eval-me/...');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getRequestProfileDetail();
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
                centerComponent={{text: '평가보기', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewUpActorArea}}>
                        <FastImage
                            source={{uri: dataList.image_url}}
                            style={{...styles.imgUpActor}}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                        <View style={{...styles.viewUpActorInfo}}>
                            <Text style={{...styles.txtActorName, fontSize: scale(15), flex: 1}}>{dataList.name}</Text>
                            <Text style={{...styles.txtActorPrivate,fontSize: scale(12),flex: 1,}}>
                                {`${dataList.age}세     ${dataList.height}cm/${dataList.weight}kg`}
                            </Text>
                            <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
                            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap'}}>
                                {
                                    dataList.keyword.map((d, i) => (
                                        <Text key={i} style={{...styles.txtActorPrivate, color: '#999999', fontSize: scale(12)}}>
                                            {i === dataList.keyword.length - 1 ? `${d}` : `${d}, `}
                                        </Text>
                                    ))
                                }
                            </View>
                        </View>
                    </View>
                    <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
                    <View style={{...styles.viewActorStarArea}}>
                        <Text style={{...styles.txtStarTitle}}>아트디렉터평점</Text>
                        <Text style={{fontSize: scale(65), textAlign: 'center'}}>{dataList.star}</Text>
                        <AirbnbRating
                            showRating={false}
                            defaultRating={Number(dataList.star)}
                            size={scale(40)}
                            starStyle={{marginVertical: scale(10)}}
                            isDisabled={true}
                            selectedColor="#e5293e"
                        />
                        <FastImage
                            source={isEmpty(dataList.director_image) ? require('../../../../assets/images/drawable-xxxhdpi/profile.png') : {uri: dataList.director_image}}
                            style={{width: scale(60), height: scale(60), borderRadius: scale(50), alignSelf: 'center'}}
                        />
                        <Text style={{...styles.txtStarTitle, marginVertical: scale(10)}}>{dataList.director_name}</Text>
                        <Text style={{...styles.txtActorPrivate,textAlign: 'center',}}>{`[${dataList.work_title}]`}</Text>
                    </View>
                    <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
                    <View style={{...styles.viewActorStarArea}}>
                        <Text style={{...styles.txtStarTitle}}>피드백 내용</Text>
                        <ListItem
                            bottomDivider={true}
                            delayPressIn={0}
                            underlayColor={'white'}
                            containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}
                        >
                            <View style={{flexDirection: 'row'}}>
                                <ListItem.Content>
                                    <ListItem.Title style={{fontSize: scale(14)}}>{dataList.feedback_content}</ListItem.Title>
                                </ListItem.Content>
                            </View>
                        </ListItem>
                    </View>
                    <View style={{height: scale(5), backgroundColor: '#eeeeee'}} />
                    <View style={{...styles.viewActorStarArea}}>
                        <Text style={{...styles.txtStarTitle}}>추가 피드백</Text>
                        <Text style={{fontSize: scale(14),borderRadius: scale(3.5),backgroundColor: '#f5f5f5',borderWidth: StyleSheet.airlineWidth,borderColor: '#707070',paddingHorizontal: scale(15),paddingVertical: scale(10),marginVertical: scale(10)}}>
                            {dataList.direct_input}
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default ProfileReviewDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewUpActorArea: {
        flexDirection: 'row',
        flex: 1,
        borderRadius: scale(5),
        backgroundColor: 'white',
        padding: scale(15),
    },
    imgUpActor: {
        flex: 1,
        height: scale(100),
        borderRadius: scale(5),
    },
    viewUpActorInfo: {
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
    viewActorStarArea: {
        padding: scale(25),
    },
    txtStarTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    txtStarSubTitle: {
        fontSize: scale(12),
        color: '#888888',
        textAlign: 'center',
    },
    viewListBoxContainer: {
        borderWidth: scale(1),
        borderBottomWidth: scale(1),
        borderRadius: scale(4),
        borderColor: '#dddddd',
        marginBottom: scale(15),
        backgroundColor: 'white',
        marginTop: scale(10),
    },
    viewTagButton: {
        marginBottom: scale(15),
        flexDirection: 'row',
        alignItems: 'center',
    },
    txtTagLabel: {
        fontSize: scale(14),
    },
    viewFeedBackPointArea: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: scale(15),
        paddingVertical: scale(10),
    },
    txtFeedBackPoint: {
        fontSize: scale(15),
        marginLeft: scale(10),
    },
});