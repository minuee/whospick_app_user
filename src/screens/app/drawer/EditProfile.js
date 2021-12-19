import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {ActivityIndicator,Linking,Platform,SafeAreaView,ScrollView,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';

import scale from '../../../common/Scale';
import {AddComma, changeTime, getAge, isEmpty, isEmptyArr, logging, screenWidth} from '../../../common/Utils';
import {apiObject} from '../../../common/API';
import ImageSlider from '../../../Component/ImageSlider';

import {Button, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import UserTokenContext from '../../../Context/UserTokenContext';
import {useFocusEffect} from '@react-navigation/native';

const EditProfile = ({parentsProps}) => {
    const refScrollView = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const {haveProfile, setUserInfo} = useContext(UserTokenContext);
    const [dataList, setDataList] = useState({all_profile: [], keyword: [], career_list: [], detail_info_readable: []});
    const _getMyActorInfo = async () => {
        try {
            const apiResult = await apiObject.getMyActorInfo(loading => setIsLoading(loading));
            setDataList(apiResult);
            setUserInfo({
                actorInfo: {
                    actorType: {actor_type_no: apiResult.actor_type_no, content: apiResult.actor_type},
                    actorImage: apiResult.all_profile,
                    actorName: apiResult.name,
                    actorDesc: apiResult.introduce,
                    actorHeight: apiResult.height,
                    actorWeight: apiResult.weight,
                    actorBirth: apiResult.birth_dt,
                    actorSex: apiResult.gender,
                    actorKeyword: apiResult.keyword,
                    topSize: apiResult.top,
                    bottomSize: apiResult.bottom,
                    footSize: apiResult.shoes,
                    lastSchool: apiResult.education,
                    major: apiResult.major,
                    specialty: apiResult.specialty,
                    agency: apiResult.has_agency,
                    careerHistory: apiResult.career_list,
                    tagList: apiResult.detail_info_list,
                    videoUrl: apiResult.video_url,
                    snsUrl: {
                        facebook: apiResult.facebook,
                        instagram: apiResult.instagram,
                        twitter: apiResult.twitter,
                    },
                },
            });
        } catch (error) {
            logging(error.response?.data, 'my-profile');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (haveProfile) {
                _getMyActorInfo();
            } else {
                setIsLoading(false);
            }
        }, [haveProfile])
    );

    return (
        <View style={{...styles.container}}>
            <SafeAreaView style={{...styles.contents}}>
                {
                    haveProfile ? (
                    <ScrollView ref={refScrollView} bounces={false}>
                        <ImageSlider images={dataList.all_profile} autoSlide={true} />
                        <View style={{...styles.viewActorInfo}}>
                            <Text style={{...styles.txtActorName, flex: 1}}>{dataList.name}</Text>
                            <Text style={{...styles.txtActorDesc, flex: 1}}>{dataList.introduce}</Text>
                            <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
                            <View style={{...styles.viewActorPrivate}}>
                                <View style={{flexDirection: 'row', flex: 0.7, justifyContent: 'space-between'}}>
                                    <Text style={{...styles.txtActorPrivate}}>{getAge(dataList.birth_dt)}세</Text>
                                    <Text style={{...styles.txtActorPrivate}}>{`${dataList.height}cm/${dataList.weight}kg`}</Text>
                                </View>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                                {
                                    dataList.keyword.map((d, i) => (
                                        <Text key={i} style={{...styles.txtActorPrivate, color: '#999999'}}>
                                            {i === dataList.keyword.length - 1 ? `${d}` : `${d}, `}
                                        </Text>
                                    ))
                                }
                                </View>
                            </View>
                        </View>
                        <View style={{...styles.viewScrollInner}}>
                            <View style={{...styles.viewInfoArea}}>
                                <Text style={{...styles.txtInfoLabel}}>주요정보</Text>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel}}>나이</Text>
                                    <Text style={{...styles.txtRowBody}}>
                                        {`${getAge(dataList.birth_dt)}세/${changeTime(dataList.birth_dt)}`}
                                    </Text>
                                </View>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel}}>키/몸무게</Text>
                                    <Text style={{...styles.txtRowBody}}>{`${dataList.height}cm/${dataList.weight}kg`}</Text>
                                </View>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel}}>의상사이즈</Text>
                                    <Text style={{...styles.txtRowBody,}}>
                                        {`상의 ${dataList.top}/하의 ${dataList.bottom}/신발 ${dataList.shoes}`}
                                    </Text>
                                </View>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel}}>학력</Text>
                                    <Text style={{...styles.txtRowBody}}>{`${dataList.education}`}</Text>
                                </View>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel}}>전공</Text>
                                    <Text style={{...styles.txtRowBody}}>{`${dataList.major}`}</Text>
                                </View>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel}}>특기</Text>
                                    <Text style={{...styles.txtRowBody}}>{`${dataList.specialty}`}</Text>
                                </View>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel}}>소속사</Text>
                                    <Text style={{...styles.txtRowBody}}>{`${dataList.has_agency ? '있음' : '없음'}`}</Text>
                                </View> 
                            </View>
                            <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd', marginBottom: scale(20)}} />
                            <View style={{...styles.viewInfoArea}}>
                                <Text style={{...styles.txtInfoLabel}}>활동경력</Text>
                                {
                                    dataList.career_list.map((item, index) =>
                                        item.list.map((d, i) => (
                                        <View style={{...styles.viewInfoRow}} key={`careerHistory${index}_${i}`}>
                                            <Text style={{...styles.txtRowLabel}}>{i === 0 ? item.category : ''}</Text>
                                            <Text style={{...styles.txtRowBody}}>{`${d.year} ${d.title}`}</Text>
                                        </View>
                                        ))
                                    )
                                }
                            </View>
                            <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd', marginBottom: scale(20)}} />
                            <View style={{...styles.viewInfoArea}}>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel, marginRight: scale(10)}}>동영상URL</Text>
                                    <TouchableOpacity
                                        style={{flex: 1}}
                                        onPress={async () => {!isEmpty(dataList.video_url) && (await Linking.openURL(dataList.video_url));}}
                                    >
                                        <Text style={{...styles.txtRowBody, color: '#e5293e', textDecorationLine: 'underline'}} numberOfLines={1}>{`${isEmpty(dataList.video_url) ? '없음' : dataList.video_url}`}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{...styles.viewInfoRow}}>
                                    <Text style={{...styles.txtRowLabel, flex: 1.5}}>SNS주소</Text>
                                    <View style={{flex: 1, flexDirec    tion: 'row', justifyContent: 'space-between'}}>
                                    {
                                        !isEmpty(dataList.facebook) ? (
                                        <TouchableOpacity onPress={async () => await Linking.openURL(dataList.facebook)}>
                                            <FastImage
                                                source={require('../../../../assets/images/drawable-xxxhdpi/facebook.png')}
                                                style={{width: scale(25), height: scale(25)}}
                                            />
                                        </TouchableOpacity>
                                        ) : null
                                    }
                                    {
                                        !isEmpty(dataList.instagram) ? (
                                        <TouchableOpacity onPress={async () => await Linking.openURL(dataList.instagram)}>
                                            <FastImage source={require('../../../../assets/images/drawable-xxxhdpi/instagram.png')}             style={{width: scale(25), height: scale(25)}}/>
                                        </TouchableOpacity>
                                        ) : null
                                    }
                                    {
                                        !isEmpty(dataList.twitter) ? (
                                        <TouchableOpacity onPress={async () => await Linking.openURL(dataList.twitter)}>
                                            <FastImage source={require('../../../../assets/images/drawable-xxxhdpi/twitter.png')} style={{width: scale(25), height: scale(25)}} />
                                        </TouchableOpacity>
                                        ) : null
                                    }
                                </View>
                            </View>
                        </View>
                        <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd', marginBottom: scale(20)}} />
                        <View style={{...styles.viewInfoArea}}>
                            <Text style={{...styles.txtInfoLabel}}>상세정보</Text>
                            {
                                dataList.detail_info_readable.map((item, index) => (
                                <View style={{...styles.viewInfoRow}} key={`tagView_${index}`}>
                                    <Text style={{...styles.txtRowLabel}}>{item.category}</Text>
                                    <Text style={{...styles.txtRowBody}}>{`${!isEmptyArr(item.content) ? item.content.map(d => d) : '없음'}`}</Text>
                                </View>
                                ))
                            }
                        </View>
                        <Button
                            title="프로필 수정"
                            titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                            buttonStyle={{backgroundColor: '#e5293e', borderRadius: scale(35), paddingVertical: scale(15)}}
                            onPress={() => {
                                refScrollView.current.scrollTo({y: 0, animated: true});
                                parentsProps.navigation.navigate('ActorRegister', {isEdit: true});
                            }}
                        />
                    </View>
                </ScrollView>
                ) : (
                    <View style={{...styles.viewAddProfileArea}}>
                        <Icon
                            name="ios-add-circle-outline"
                            type="ionicon"  
                            color="#e5293e"
                            size={scale(85)}
                            onPress={() => parentsProps.navigation.navigate('ActorRegister', {isEdit: false})}
                            delayPressIn={0}
                        />
                        <Text style={{...styles.txtAddProfile}}>배우프로필 등록</Text>
                        <Text style={{...styles.txtAddProfileSub}}>후즈픽 활동을 위해 프로필을 등록해주세요!</Text>
                    </View>
                )}
            </SafeAreaView>
            {
                isLoading ? (
                <View style={{...StyleSheet.absoluteFill,justifyContent: 'center',alignItems: 'center',flex: 1,backgroundColor: 'white',zIndex: 9999,}}>
                    <ActivityIndicator size="large" color="#e5293e" />
                </View> 
                ) : null
            }
        </View>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewHeader: {
        backgroundColor: 'rgba(0, 0, 0, .2)',
        flexDirection: 'row',
        padding: scale(10),
        position: 'absolute',
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
        width: screenWidth,
    },
    viewActorInfo: {
        backgroundColor: 'white',
        borderRadius: scale(5),
        paddingHorizontal: scale(15),
        paddingVertical: scale(15),
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'space-between',
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
        minHeight: scale(100),
        top: scale(-50),
    },
    txtActorName: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#222222',
    },
    txtActorDesc: {
        fontSize: scale(10),
        color: '#222222',
    },
    viewActorPrivate: {
        flexDirection: 'row',
    },
    txtActorPrivate: {
        fontSize: scale(10),    
        color: '#e5293e',
    },
    viewScrollInner: {
        paddingHorizontal: scale(25),
        paddingBottom: scale(25),
    },
    viewInfoArea: {
        marginBottom: scale(20),
    },
    txtInfoLabel: {
        fontSize: scale(16),
        fontWeight: 'bold',
    },
    viewInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(10),
    },
    txtRowLabel: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#555555',
    },
    txtRowBody: {
        color: '#555555',
        flex: 1,
        textAlign: 'right',
    },
    viewAddProfileArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txtAddProfile: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#e5293e',
        marginBottom: scale(5),
    },
    txtAddProfileSub: {
        fontSize: scale(12),
        color: '#999999',
    },
});