import React, {useContext, useEffect, useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View,} from 'react-native';
import scale from '../../../common/Scale';
import {isEmpty, isEmptyArr, screenWidth, getAge, logging} from '../../../common/Utils';
import {Button, Header, Icon, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-picker';
import Modal from 'react-native-modal';
import DatePicker from 'react-native-date-picker';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';
import {apiObject, IMAGE_URL} from '../../../common/API';
import LoadingIndicator from '../../../Component/LoadingIndicator';
import {Storage} from '@psyrenpark/storage';

const ActorRegister = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const {setUserInfo, actorInfo, userEmail} = useContext(UserTokenContext);
    const [dataList, setDataList] = useState([]);
    const [actorTypeIndex, setActorTypeIndex] = useState(null);
    const [actorTypeNum, setActorTypeNum] = useState(null);
    const [requestDataForm, setRequestDataForm] = useState({
        actorType: {actor_type_no: undefined, content: ''},
        actorImage: [''],
        actorName: '',
        actorDesc: '',
        actorHeight: 0,
        actorWeight: 0,
        actorBirth: parseInt(+new Date() / 1000),
        actorSex: 'M',
        topSize: 0,
        bottomSize: 0,
        footSize: 0,
        lastSchool: '',
        major: '',
        specialty: '',
        agency: false,
        careerHistory: [{category: '', list: [{year: '', title: ''}]}],
        tagList: [],
        videoUrl: '',
        snsUrl: {
            facebook: '',
            instagram: '',
            twitter: '',
        },
        actorSongType: {id: '', name: ''},
    });

    const [isOpend, setIsOpend] = useState({
        isActorTypeOpend: false,
        isDatePickerOpend: false,
        isTopSizeOpend: false,
        isBottomSizeOpend: false,
        isShoesSizeOpend: false,
    });

    const [isTagOpend, setIsTagOpend] = useState([]);
    const options = {
        title: '?????? ?????? & ??????',
        cancelButtonTitle: '??????',
        takePhotoButtonTitle: '?????? ??????',
        chooseFromLibraryButtonTitle: '?????? ??????',
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        storageOptions: {
            skipBackup: true,
            cameraRoll: false,
            path: 'images',
        },
    };
    const _onToggleTag = (item, tagArr, cateNum, maxNum) => {
        let tmpArr = [];
        switch (tagArr) {
            case 'tagList':
                tmpArr = [...requestDataForm.tagList];
                if (tmpArr.findIndex(index => index.detail_checkbox_no === item.detail_checkbox_no) > -1) {
                    tmpArr.splice(
                    tmpArr.findIndex(index => index.detail_checkbox_no === item.detail_checkbox_no),1);
                } else {
                    let cnt = 0;
                    for (let i = 0; i < tmpArr.length; i++) {
                        if (tmpArr[i].detail_category_no === cateNum) {
                            cnt += 1;
                        }
                    }
                    if (cnt === maxNum) {
                        return null;
                    }
                    tmpArr.push({...item, direct_input: null});
                }
                setRequestDataForm({...requestDataForm, tagList: tmpArr});
                break;
            case 'actorType':
                setRequestDataForm({...requestDataForm, actorType: item, tagList: []});
                setIsOpend({...isOpend, isActorTypeOpend: !isOpend.isActorTypeOpend});
                break;
            case 'actorSongType':
                setRequestDataForm({...requestDataForm, actorSongType: item});
                setIsOpend({...isOpend, isActorSongTypeOpend: !isOpend.isActorSongTypeOpend});
                break;
        }
    };

    const _onImagePicker = isArr => {
        if (requestDataForm.actorImage.length === 7) {
            Alert.alert(
                '[??????]',
                '?????? ????????? ????????? ??????????????????.\n?????? ?????? ??? ?????? ??????????????????.',
                [{text: '??????', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
                {cancelable: false}
            );
            return null;
        }
        ImagePicker.showImagePicker(options, async image => {
            const userId = userEmail.split('@')[0];
            if (image.didCancel) {
            } else if (image.error) {
                console.log('ImagePicker Error: ', image.error);
                Alert.alert(
                    '[??????]',
                    '????????? ???????????? ?????? ????????? ??????????????????.\n?????? ????????? ?????????.',
                    [{text: '??????', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
                    {cancelable: false}
                );
            } else {
                const result = await fetch(image.uri);
                const blob = await result.blob();
                let fileName = blob._data.name;
                let extensionName = fileName.split('.')[1];
                let now_timestamp = Math.floor(new Date().getTime() / 1000);
                fileName = `${userId}_${now_timestamp}.${extensionName}`;
                try {
                    const storageUrl = await Storage.put({
                        key: `profile/actor/${fileName}`,
                        object: blob,
                        config: {
                            contentType: 'image',
                        },
                        },loading => setIsLoading(loading)
                    );
                    let tmpArr = [...requestDataForm.actorImage];
                    if (isArr) {
                        tmpArr.push(`${IMAGE_URL}${storageUrl.key}`);
                    } else {
                        tmpArr.splice(0, 1, `${IMAGE_URL}${storageUrl.key}`);
                    }
                    setRequestDataForm({...requestDataForm, actorImage: tmpArr});
                } catch (error) {
                    Alert.alert(
                        '[??????]',
                        '????????? ???????????? ?????? ????????? ??????????????????.\n?????? ????????? ?????????.',
                        [{text: '??????', onPress: () => console.log('OK Pressed'), style: 'cancel'}],
                        {cancelable: false}
                    );
                }
            }
        });
    };

    const _onDeleteImagePress = index => {
        Alert.alert(
            '[??????]',
            `${index - 1}?????? ????????? ??????????????????????`,
            [
                {text: '??????', onPress: () => console.log('OK Pressed'), style: 'cancel'},
                {
                    text: '??????',
                    onPress: () => {
                        let tmpArr = [...requestDataForm.actorImage];
                        tmpArr.splice(index - 1, 1);
                        setRequestDataForm({...requestDataForm, actorImage: tmpArr});
                    },
                },
            ],
            {cancelable: false}
        );
    };

    const _onDeleteCareerHistoryPress = (mainIndex, subIndex) => {
        if (isEmpty(subIndex)) {
            Alert.alert('[??????]', `'?????? ${mainIndex + 1}' ????????? ????????????????\n\n??? ????????? ????????? ??? ????????????.`, [
                {
                    text: '??????',
                    style: 'cancel',
                },
                {
                    text: '??????',
                    onPress: () => {
                        let tmpArr = [...requestDataForm.careerHistory];
                        tmpArr.splice(mainIndex, 1);
                        setRequestDataForm({...requestDataForm, careerHistory: tmpArr});
                    },
                },
            ]);
        } else {
            Alert.alert(
                '[??????]',
                `'?????? ${mainIndex + 1}'??? '${subIndex + 1}??????' ????????? ????????????????\n\n??? ????????? ????????? ??? ????????????.`,
                [{
                    text: '??????',
                    style: 'cancel',
                },
                {
                    text: '??????',
                    onPress: () => {
                        let tmpArr = [...requestDataForm.careerHistory];
                        tmpArr[mainIndex].list.splice(subIndex, 1);
                        setRequestDataForm({...requestDataForm, careerHistory: tmpArr});
                    },
                },]
            );
        }
    };

    const _getActorTypeConfig = async () => {
        try {
            const apiResult = await apiObject.getActorTypeConfig(loading => setIsLoading(loading));
            setDataList(apiResult.list);
            setIsOpend({...isOpend, isActorTypeOpend: true});

            if (props.route.params.isEdit) {
                setRequestDataForm({...actorInfo, actorSongType: {id: '', name: ''}});
                for (let i = 0; i < apiResult.list.length; i++) {
                    if (apiResult.list[i].actor_type_no === actorInfo.actorType.actor_type_no) {
                        setActorTypeIndex(i);
                        break;
                    }
                }
                setActorTypeNum(actorInfo.actorType.actor_type_no);
            }
        } catch (error) {
            logging(error.response?.data, 'cdn/actor-types');
            Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getActorTypeConfig();
    }, []);

    const _setMyProfileInfo = async () => {
        try {
            const imageUploadResult = await apiObject.imageUpload({
                url: requestDataForm.actorImage,
                },loading => setIsLoading(loading)
            );
            let subImageArr = [];
            for (let i = 1; i < imageUploadResult.image_no.length; i++) {
                subImageArr.push(imageUploadResult.image_no[i]);
            }
            if (props.route.params.isEdit) {
                await apiObject.editActorProfile({
                    actor_type_no: requestDataForm.actorType.actor_type_no,
                    main_profile: imageUploadResult.image_no[0],
                    introduce: requestDataForm.actorDesc,
                    additional_profile: subImageArr,
                    video_url: requestDataForm.videoUrl,
                    facebook: requestDataForm.snsUrl.facebook,
                    instagram: requestDataForm.snsUrl.instagram,
                    twitter: requestDataForm.snsUrl.twitter,
                    name: requestDataForm.actorName,
                    birth_dt: requestDataForm.actorBirth,
                    gender: requestDataForm.actorSex,
                    height: requestDataForm.actorHeight,
                    weight: requestDataForm.actorWeight,
                    top: requestDataForm.topSize,
                    bottom: requestDataForm.bottomSize,
                    shoes: requestDataForm.footSize,
                    education: requestDataForm.lastSchool,
                    major: requestDataForm.major,
                    specialty: requestDataForm.specialty,
                    has_agency: requestDataForm.agency,
                    career_list: requestDataForm.careerHistory,
                    detail_info_list: requestDataForm.tagList,
                });
            } else {
                await apiObject.applyActorProfile({
                    actor_type_no: requestDataForm.actorType.actor_type_no,
                    main_profile: imageUploadResult.image_no[0],
                    introduce: requestDataForm.actorDesc,
                    additional_profile: subImageArr,
                    video_url: requestDataForm.videoUrl,
                    facebook: requestDataForm.snsUrl.facebook,
                    instagram: requestDataForm.snsUrl.instagram,
                    twitter: requestDataForm.snsUrl.twitter,
                    name: requestDataForm.actorName,
                    birth_dt: requestDataForm.actorBirth,
                    gender: requestDataForm.actorSex,
                    height: requestDataForm.actorHeight,
                    weight: requestDataForm.actorWeight,
                    top: requestDataForm.topSize,
                    bottom: requestDataForm.bottomSize,
                    shoes: requestDataForm.footSize,
                    education: requestDataForm.lastSchool,
                    major: requestDataForm.major,
                    specialty: requestDataForm.specialty,
                    has_agency: requestDataForm.agency,
                    career_list: requestDataForm.careerHistory,
                    detail_info_list: requestDataForm.tagList,
                });
            }
            setUserInfo({haveProfile: true});
            Alert.alert('[??????]', '???????????? ??????????????? ??????(??????)???????????????.\n\n????????? ???????????? ???????????? ???????????? ?????????!', [
                {
                    text: '??????',
                    style: 'cancel',
                    onPress: () => props.navigation.goBack(null),
                },
                ]);
        } catch (error) {
            logging(error.response?.data, 'image||my-profile');
            Toast.show('???????????? ?????? ??? ????????? ??????????????????.\n?????? ??? ?????? ??????????????????.', Toast.SHORT);
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
                centerComponent={{
                    text: props.route.params.isEdit ? '????????? ??????' : '????????? ??????',
                    style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
                }}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewScrollInner}}>
                        <Text style={{fontSize: scale(10),fontWeight: 'bold',color: '#e5293e',textAlign: 'right',marginBottom: scale(15)}}>
                            * ????????????
                        </Text>
                        <ListItem
                            bottomDivider={true}
                            onPress={() => setIsOpend({...isOpend, isActorTypeOpend: !isOpend.isActorTypeOpend})}
                            delayPressIn={0}
                            underlayColor={'white'}
                            containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}
                        >
                            <View style={{flexDirection: 'row'}}>
                                <ListItem.Content>
                                    <ListItem.Title style={{fontSize: scale(14),color: requestDataForm.actorType.content !== '' ? 'black' : '#dddddd'}}>
                                        {requestDataForm.actorType.content !== '' ? requestDataForm.actorType.content : '????????????'}
                                    </ListItem.Title>
                                </ListItem.Content>
                                <ListItem.Chevron 
                                    name={isOpend.isActorTypeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    type="material"
                                    size={scale(25)}
                                    color="#e5293e"
                                />
                            </View>
                            <View style={{...styles.viewCheckArea, paddingTop: isOpend.isActorTypeOpend ? scale(20) : null}}>
                                {
                                    isOpend.isActorTypeOpend &&
                                    dataList.map((item, index) => (
                                        <TouchableOpacity
                                            key={`actorType_${item.actor_type_no}`}
                                            style={{...styles.viewTagButton}}
                                            onPress={() => {
                                                _onToggleTag({actor_type_no: item.actor_type_no, content: item.content}, 'actorType');
                                                setActorTypeIndex(index);
                                                setActorTypeNum(item.actor_type_no);
                                            }}
                                            activeOpacity={0.9}
                                        >
                                            <Icon
                                                name={requestDataForm.actorType.actor_type_no === item.actor_type_no ? 'check-circle'               : 'radio-button-unchecked'}
                                                size={scale(25)}
                                                color={requestDataForm.actorType.actor_type_no === item.actor_type_no ? '#e5293e' : '#dddddd'}
                                                style={{marginRight: scale(5)}}
                                            />
                                            <Text style={{...styles.txtTagLabel}} numberOfLines={1}>
                                                {item.content}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                }
                            </View>
                        </ListItem>
                        {
                            actorTypeNum !== null && actorTypeIndex !== null ? (
                            <>
                                <Text style={{...styles.txtProfileLabel}}>????????????</Text>
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ?????? ????????? ??????<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                </Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: scale(15)}}>
                                    {
                                        isEmpty(requestDataForm.actorImage[0]) ? (
                                        <TouchableOpacity
                                            style={{backgroundColor: '#e5e5e5',height: scale(75),width: scale(75),justifyContent: 'center',marginRight: scale(5),}}
                                            onPress={() => _onImagePicker()}
                                        >
                                            <Icon name="add-a-photo" size={scale(25)} color="white" />
                                        </TouchableOpacity>
                                        ) : (
                                        <TouchableOpacity key={'actorImage_0'} onLongPress={() => _onImagePicker()}>
                                            <FastImage
                                                source={{uri: requestDataForm.actorImage[0]}}
                                                style={{height: scale(75), width: scale(75)}}
                                            />
                                        </TouchableOpacity>
                                        )
                                    }
                                </View>
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ?????? ?????????
                                </Text>
                                <TextInput
                                    style={{...styles.inputEdit, height: scale(90), textAlignVertical: 'top'}}
                                    placeholder="?????? 25??????"
                                    value={requestDataForm.actorDesc}
                                    padding={0}
                                    onChangeText={text => setRequestDataForm({...requestDataForm, actorDesc: text})}
                                    multiline={true}
                                    scrollEnabled={false}
                                    maxLength={25}
                                />
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ?????? ????????? ??????<Text style={{fontSize: scale(12), color: '#e5293e'}}> *(3??? ?????? ??????)</Text>
                                </Text>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity
                                        style={{backgroundColor: '#e5e5e5',height: scale(75),width: scale(75),justifyContent: 'center',marginRight: scale(5),}}
                                        onPress={() => _onImagePicker(true)}
                                    >
                                        <Icon name="add-a-photo" size={scale(25)} color="white" />
                                        <Text style={{fontSize: scale(12),color: '#979797',position: 'absolute',left: scale(3),bottom: scale(3)}}>
                                            {`${requestDataForm.actorImage.length - 1}/6`}
                                        </Text>
                                    </TouchableOpacity>
                                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                        {
                                            requestDataForm.actorImage.map((item, index) =>
                                            index === 0 ? null : (
                                            <TouchableOpacity
                                                key={`actorImage_${index + 1}`}
                                                onLongPress={() => _onDeleteImagePress(index + 1)}
                                            >
                                                <FastImage
                                                    source={{uri: item}}
                                                    style={{height: scale(75), width: scale(75), marginRight: scale(5)}}
                                                />
                                            </TouchableOpacity>
                                            )
                                            )
                                        }
                                    </ScrollView>
                                </View>
                                <Text style={{fontSize: scale(10), color: '#e5293e', marginBottom: scale(15), marginTop: scale(5)}}>
                                    * ???????????? ??????????????? ?????? ???????????????.
                                </Text>
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ????????? URL
                                </Text>
                                <TextInput
                                    style={{...styles.inputEdit}}
                                    placeholder="????????? ????????? ??????????????????."
                                    value={requestDataForm.videoUrl}
                                    padding={0}
                                    onChangeText={text => setRequestDataForm({...requestDataForm, videoUrl: text})}
                                    returnKeyType="done"
                                    keyboardType="url"
                                />
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    SNS??????
                                </Text>
                                <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(10)}}>
                                    <FastImage
                                        source={require('../../../../assets/images/drawable-xxxhdpi/facebook_1.png')}
                                        style={{width: scale(30), height: scale(30)}}
                                    />
                                    <TextInput
                                        style={{...styles.inputEdit, marginBottom: 0, flex: 1, marginLeft: scale(15)}}
                                        placeholder="Facebook"
                                        value={requestDataForm.snsUrl.facebook}
                                        padding={0}
                                        onChangeText={text => setRequestDataForm({...requestDataForm, snsUrl: {...requestDataForm.snsUrl, facebook: text}})}
                                        returnKeyType="done"
                                        keyboardType="url"
                                    />
                                </View>
                                <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(10)}}>
                                    <FastImage
                                        source={require('../../../../assets/images/drawable-xxxhdpi/instagram_1.png')}
                                        style={{width: scale(30), height: scale(30)}}
                                    />
                                    <TextInput
                                        style={{...styles.inputEdit, marginBottom: 0, flex: 1, marginLeft: scale(15)}}
                                        placeholder="Instagram"
                                        value={requestDataForm.snsUrl.instagram}
                                        padding={0}
                                        onChangeText={text => setRequestDataForm({...requestDataForm, snsUrl: {...requestDataForm.snsUrl,instagram: text}})}
                                        returnKeyType="done"
                                        keyboardType="url"
                                    />
                                </View>
                                <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(15)}}>
                                    <FastImage
                                        source={require('../../../../assets/images/drawable-xxxhdpi/twitter.png')}
                                        style={{width: scale(30), height: scale(30)}}
                                    />
                                    <TextInput
                                        style={{...styles.inputEdit, marginBottom: 0, flex: 1, marginLeft: scale(15)}}
                                        placeholder="Twitter"
                                        value={requestDataForm.snsUrl.twitter}
                                        padding={0}
                                        onChangeText={text => setRequestDataForm({...requestDataForm, snsUrl: {...requestDataForm.snsUrl, twitter: text}})}
                                        returnKeyType="done"
                                        keyboardType="url"
                                    />
                                </View>
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ??????<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                </Text>
                                <TextInput
                                    style={{...styles.inputEdit}}
                                    placeholder="????????? ??????????????????."
                                    value={requestDataForm.actorName}
                                    padding={0}
                                    onChangeText={text => setRequestDataForm({...requestDataForm, actorName: text})}
                                    returnKeyType="done"
                                />
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ????????????
                                    <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                </Text>
                                <TouchableOpacity
                                    style={{...styles.viewListBoxContainer, borderColor: '#dddddd'}}
                                    onPress={() => setIsOpend({...isOpend, isDatePickerOpend: true})}
                                >
                                    <Text style={{fontSize: scale(16),textAlign: 'center'}}>
                                        {`${new Date(requestDataForm.actorBirth * 1000).getFullYear()}??? ${new Date(requestDataForm.actorBirth * 1000).getMonth() + 1}??? ${new Date(requestDataForm.actorBirth * 1000).getDate()}???`}
                                    </Text>
                                </TouchableOpacity>
                                {/* ?????? ?????? */}
                                <View style={{...styles.viewSexArea}}>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{...styles.viewSexMale,backgroundColor: requestDataForm.actorSex === 'M' ? '#e5293e' : null}}
                                        onPress={() => setRequestDataForm({...requestDataForm,actorSex: 'M',actorSongType: {id: '', name: ''},})}
                                    >
                                        <Text style={{color: requestDataForm.actorSex === 'M' ? 'white' : 'black'}}>??????</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{...styles.viewSexFemale,backgroundColor: requestDataForm.actorSex === 'F' ? '#e5293e' : null,}}
                                        onPress={() =>setRequestDataForm({...requestDataForm,actorSex: 'F',actorSongType: {id: '', name: ''}})}
                                    >
                                        <Text style={{color: requestDataForm.actorSex === 'F' ? 'white' : 'black'}}>??????</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* ??? ?????? */}
                                <View style={{...styles.viewListBoxContainer,borderColor: '#dddddd',padding: scale(15),}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={{fontSize: scale(12), color: '#999999'}}>
                                            ???<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                        </Text>
                                        <Text style={{fontSize: scale(12),color: '#999999',}}>
                                            {`${requestDataForm.actorHeight} cm`}
                                        </Text>
                                    </View>
                                    <MultiSlider
                                        values={[requestDataForm.actorHeight]}
                                        min={dataList[actorTypeIndex].height.min}
                                        max={dataList[actorTypeIndex].height.max}
                                        step={1}
                                        sliderLength={300}
                                        onValuesChange={e => setRequestDataForm({...requestDataForm, actorHeight: e[0]})}
                                        containerStyle={{alignSelf: 'center'}}
                                        selectedStyle={{backgroundColor: '#e5293e'}}
                                        trackStyle={{height: scale(5)}}
                                        markerStyle={{
                                            width: scale(22),
                                            height: scale(22),
                                            backgroundColor: 'white',
                                            borderWidth: scale(1),
                                            borderColor: '#dddddd',
                                        }}
                                        markerOffsetY={scale(2)}
                                    />
                                </View>
                                {/* ????????? ?????? */}
                                <View style={{...styles.viewListBoxContainer,borderColor: '#dddddd',padding: scale(15),}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={{fontSize: scale(12), color: '#999999'}}>
                                            ?????????<Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                        </Text>
                                        <Text style={{fontSize: scale(12),color: '#999999',}}>
                                            {`${requestDataForm.actorWeight} kg`}
                                        </Text>
                                    </View>
                                    <MultiSlider
                                        values={[requestDataForm.actorWeight]}
                                        min={dataList[actorTypeIndex].weight.min}
                                        max={dataList[actorTypeIndex].weight.max}
                                        step={1}
                                        sliderLength={300}
                                        onValuesChange={e => setRequestDataForm({...requestDataForm, actorWeight: e[0]})}
                                        containerStyle={{alignSelf: 'center'}}
                                        selectedStyle={{backgroundColor: '#e5293e'}}
                                        trackStyle={{height: scale(5)}}
                                        markerStyle={{
                                            width: scale(22),
                                            height: scale(22),
                                            backgroundColor: 'white',
                                            borderWidth: scale(1),
                                            borderColor: '#dddddd',
                                        }}
                                        markerOffsetY={scale(2)}
                                    />
                                </View>
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ???????????????
                                    <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                </Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <View style={{...styles.inputEdit, width: '32%'}}>
                                        <TouchableOpacity
                                            style={{...styles.viewToggleArea}}
                                            onPress={() => {setIsOpend({...isOpend, isTopSizeOpend: !isOpend.isTopSizeOpend});}}
                                        >
                                            <Text style={{fontSize: scale(14),color: requestDataForm.topSize === 0 ? '#dddddd' : 'black'}}>
                                                {requestDataForm.topSize === 0 ? '??????' : requestDataForm.topSize}
                                                <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                                            </Text>
                                            <Icon
                                                name={isOpend.isTopSizeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                                size={scale(25)}
                                                color="#e5293e"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{...styles.inputEdit, width: '32%'}}>
                                        <TouchableOpacity
                                            style={{...styles.viewToggleArea}}
                                            onPress={() => {setIsOpend({...isOpend, isBottomSizeOpend: !isOpend.isBottomSizeOpend});}}
                                        >
                                            <Text style={{fontSize: scale(14),color: requestDataForm.bottomSize === 0 ? '#dddddd' : 'black'}}>
                                                {requestDataForm.bottomSize === 0 ? '??????' : requestDataForm.bottomSize}
                                                <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                                            </Text>
                                            <Icon
                                                name={isOpend.isBottomSizeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                                size={scale(25)}
                                                color="#e5293e"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{...styles.inputEdit, width: '32%'}}>
                                        <TouchableOpacity
                                            style={{...styles.viewToggleArea}}
                                            onPress={() => {setIsOpend({...isOpend, isShoesSizeOpend: !isOpend.isShoesSizeOpend});}}
                                        >
                                            <Text style={{fontSize: scale(14),color: requestDataForm.footSize === 0 ? '#dddddd' : 'black'}}>
                                                {requestDataForm.footSize === 0 ? '??????' : requestDataForm.footSize}
                                                <Text style={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}> *</Text>
                                            </Text>
                                            <Icon
                                                name={isOpend.isShoesSizeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                                size={scale(25)}
                                                color="#e5293e"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* ??????/?????? ?????? */}
                                {
                                    (requestDataForm.actorType.actor_type_no === 0 || requestDataForm.actorType.actor_type_no === 1) && (
                                    <>
                                        <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                            ??????
                                        </Text>
                                        <TextInput
                                            style={{...styles.inputEdit}}
                                            placeholder="????????? ??????????????????."
                                            value={requestDataForm.lastSchool}
                                            padding={0}
                                            onChangeText={text => setRequestDataForm({...requestDataForm, lastSchool: text})}
                                            returnKeyType="done"
                                        />
                                        <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                            ??????
                                        </Text>
                                        <TextInput
                                            style={{...styles.inputEdit}}
                                            placeholder="????????? ??????????????????."
                                            value={requestDataForm.major}
                                            padding={0}
                                            onChangeText={text => setRequestDataForm({...requestDataForm, major: text})}
                                            returnKeyType="done"
                                        />
                                    </>
                                    )
                                }
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ??????
                                    <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                </Text>
                                <TextInput
                                    style={{...styles.inputEdit}}
                                    placeholder="????????? ??????????????????."
                                    value={requestDataForm.specialty}
                                    padding={0}
                                    onChangeText={text => setRequestDataForm({...requestDataForm, specialty: text})}
                                    returnKeyType="done"
                                />
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ?????????
                                    <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                </Text>
                                <View style={{...styles.viewAgencyArea}}>
                                    <TouchableOpacity
                                        style={{flexDirection: 'row', alignItems: 'center', flex: 1}}
                                        onPress={() => setRequestDataForm({...requestDataForm, agency: true})}
                                    >
                                        <Icon
                                            name={requestDataForm.agency ? 'check-circle' : 'radio-button-unchecked'}
                                            size={scale(25)}
                                            color={requestDataForm.agency ? '#e5293e' : '#dddddd'}
                                            style={{marginRight: scale(5)}}
                                        />
                                        <Text style={{...styles.txtTagLabel}}>???</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{flexDirection: 'row', alignItems: 'center', flex: 1}}
                                        onPress={() => setRequestDataForm({...requestDataForm, agency: false})}
                                    >
                                        <Icon
                                            name={!requestDataForm.agency ? 'check-circle' : 'radio-button-unchecked'}
                                            size={scale(25)}
                                            color={!requestDataForm.agency ? '#e5293e' : '#dddddd'}
                                            style={{marginRight: scale(5)}}
                                        />
                                        <Text style={{...styles.txtTagLabel}}>???</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                    ????????????
                                </Text>
                                {
                                    requestDataForm.careerHistory.map((item, index) => (
                                        <View key={`careerHistory_${index}`} style={{marginBottom: scale(15)}}>
                                            <View style={{backgroundColor: '#dddddd',paddingVertical: scale(3),paddingHorizontal: scale(5),marginBottom: scale(5),justifyContent: 'space-between',flexDirection: 'row',alignItems: 'center',}}>
                                                <Text>{`?????? ${index + 1}`}</Text>
                                                {
                                                    index !== 0 ? (
                                                    <TouchableOpacity onPress={() => _onDeleteCareerHistoryPress(index)}>
                                                        <Text style={{color: '#e5293e'}}>????????????</Text>
                                                    </TouchableOpacity>
                                                    ) : null
                                                }
                                            </View>
                                            <TextInput
                                                style={{...styles.inputEdit}}
                                                placeholder="?????? ??? ?????? (???: ??????, ?????????, ?????? ??????)"
                                                value={item.category}
                                                padding={0}
                                                onChangeText={text => {
                                                    let tmpArr = [...requestDataForm.careerHistory];
                                                    tmpArr[index].category = text;
                                                    setRequestDataForm({...requestDataForm, careerHistory: tmpArr});
                                                }}
                                                returnKeyType="done"
                                            />
                                            {
                                                item.list.map((d, i) => (
                                                <View key={`careerHistoryDesc_${i}`}>
                                                    <View style={{...styles.viewCareerHistoryArea}}>
                                                        {
                                                            i !== 0 ? (
                                                            <TouchableOpacity
                                                                style={{marginBottom: scale(10),marginRight: scale(10),flex: 0.4,borderWidth: StyleSheet.hairlineWidth,borderRadius: scale(5),borderColor: '#e5293e',alignItems: 'center',}}
                                                                onPress={() => _onDeleteCareerHistoryPress(index, i)}
                                                            >
                                                                <Text style={{color: '#e5293e'}}>??????</Text>
                                                            </TouchableOpacity>
                                                            ) : null
                                                        }
                                                        <TextInput
                                                            style={{...styles.inputEdit, flex: 1, marginRight: scale(10)}}
                                                            placeholder="??????(2020)"
                                                            value={String(d.year)}
                                                            padding={0}
                                                            onChangeText={text => {
                                                                let tmpArr = [...requestDataForm.careerHistory];
                                                                tmpArr[index].list[i].year = text;
                                                                setRequestDataForm({...requestDataForm, careerHistory: tmpArr});
                                                            }}
                                                            returnKeyType="done"
                                                            keyboardType="number-pad"
                                                            maxLength={4} 
                                                        />
                                                        <TextInput
                                                            style={{...styles.inputEdit, flex: 2}}
                                                            placeholder="??????"
                                                            value={d.title}
                                                            padding={0}
                                                            onChangeText={text => {
                                                                let tmpArr = [...requestDataForm.careerHistory];
                                                                tmpArr[index].list[i].title = text;
                                                                setRequestDataForm({...requestDataForm, careerHistory: tmpArr});
                                                            }}
                                                            returnKeyType="done"
                                                        />
                                                    </View>
                                                    {
                                                        i === requestDataForm.careerHistory[index].list.length - 1 ? (
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                let tmpArr = [...requestDataForm.careerHistory];
                                                                tmpArr[index].list.push({year: '', title: ''});
                                                                setRequestDataForm({...requestDataForm, careerHistory: tmpArr});
                                                            }}
                                                            style={{marginBottom: scale(15)}}
                                                        >
                                                            <Icon name="ios-add-circle-outline" type="ionicon" size={scale(40)} color="#dddddd" />
                                                        </TouchableOpacity>
                                                        ) : null
                                                    }
                                                </View>
                                                ))
                                            }
                                            {
                                                index === requestDataForm.careerHistory.length - 1 ? (
                                                    <Button
                                                        title="????????????"
                                                        titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: 'black'}}
                                                        type="outline"
                                                        buttonStyle={{borderColor: '#dddddd'}}
                                                        icon={{name: 'ios-add', type: 'ionicon', color: '#e5293e'}}
                                                        iconRight={true}
                                                        onPress={() => {
                                                            let tmpArr = [...requestDataForm.careerHistory];
                                                            tmpArr.push({category: '', list: [{year: '', title: ''}]});
                                                            setRequestDataForm({...requestDataForm, careerHistory: tmpArr});
                                                        }}
                                                    />
                                                ) : null
                                             }
                                        </View>
                                    ))
                                }
                            <Text style={{...styles.txtProfileLabel}}>????????????</Text>
                            {
                                dataList[actorTypeIndex].detail_info.map(
                                (item, index) => (item.gender === 'N' || requestDataForm.actorSex === item.gender) && (
                                    <View key={`tagBox_${index}`}>
                                        <Text  style={{fontSize: scale(12), color: '#707070', marginBottom: scale(10), fontWeight: 'bold'}}>
                                            {item.content}
                                            {item.max_choice === -1 ? '' : ` (?????? ${item.max_choice}??????)`}
                                            <Text style={{fontSize: scale(12), color: '#e5293e'}}> *</Text>
                                        </Text>
                                        <ListItem
                                            bottomDivider={true}
                                            onPress={() => {
                                                let tmpArr = [...isTagOpend];
                                                if (tmpArr.includes(index)) {
                                                    tmpArr.splice(tmpArr.indexOf(index), 1);
                                                } else {
                                                    tmpArr.push(index);
                                                }
                                                setIsTagOpend(tmpArr);
                                            }}
                                            delayPressIn={0}
                                            underlayColor={'white'}
                                            containerStyle={{
                                                ...styles.viewListBoxContainer,
                                                flexDirection: 'column',
                                                borderColor: '#dddddd',
                                            }}
                                        >
                                            <View style={{flexDirection: 'row'}}>
                                                <ListItem.Content>
                                                    <ListItem.Title style={{fontSize: scale(14),color: requestDataForm.tagList.some(e => e.detail_category_no === item.detail_category_no) ? 'black': '#dddddd',}}>
                                                        {
                                                            requestDataForm.tagList.some(e => e.detail_category_no === item.detail_category_no) ? requestDataForm.tagList.map((arrData, arrIndex) => arrData.detail_category_no === item.detail_category_no ? `#${arrData.content} ` : null ) 
                                                            : item.content
                                                        }
                                                    </ListItem.Title>
                                                </ListItem.Content>
                                                <ListItem.Chevron
                                                    name={isTagOpend.includes(index) ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                                    type="material"
                                                    size={scale(25)}
                                                    color="#e5293e"
                                                />
                                            </View>
                                            <View style={{...styles.viewCheckArea,paddingTop: isTagOpend.includes(index) ? scale(20) : null}}>
                                                {
                                                    isTagOpend.includes(index) &&
                                                    item.detail_checkbox.map((d, i) => (
                                                        <TouchableOpacity
                                                            key={`tag_${index}${i}`}
                                                            style={{...styles.viewTagButton}}
                                                            onPress={() => _onToggleTag(d, 'tagList', d.detail_category_no, item.max_choice)}
                                                            activeOpacity={0.9}
                                                        >
                                                            <Icon
                                                                name={
                                                                    requestDataForm.tagList.some(e => e.detail_checkbox_no === d.detail_checkbox_no)
                                                                    ? 'check-circle'
                                                                    : 'radio-button-unchecked'
                                                                }
                                                                size={scale(25)}
                                                                color={
                                                                    requestDataForm.tagList.some(e => e.detail_checkbox_no === d.detail_checkbox_no)
                                                                    ? '#e5293e'
                                                                    : '#dddddd'
                                                                }
                                                                style={{marginRight: scale(5)}}
                                                            />
                                                            <Text style={{...styles.txtTagLabel}} numberOfLines={1}>
                                                                {d.content}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))
                                                }
                                                {
                                                    requestDataForm.tagList.some(e => e.detail_category_no === item.detail_category_no && e.direct_yn === true ) ? (
                                                    <TextInput 
                                                        style={{...styles.inputEdit, width: '100%'}}
                                                        placeholder="????????????"
                                                        value={requestDataForm.tagList[requestDataForm.tagList.findIndex(e => e.detail_category_no === item.detail_category_no && e.direct_yn === true)].direct_input}
                                                        padding={0}
                                                        onChangeText={text => {
                                                            let tmpArr = [...requestDataForm.tagList];
                                                            tmpArr[requestDataForm.tagList.findIndex(e => e.detail_category_no === item.        detail_category_no && e.direct_yn === true)].direct_input = text;
                                                            setRequestDataForm({...requestDataForm, tagList: tmpArr});
                                                        }}
                                                        returnKeyType="done"
                                                    />
                                                    ) : null
                                                }
                                            </View>
                                        </ListItem>
                                    </View>
                                )
                                )
                            }
                            {/* ?????? ?????? */}
                            <Button
                                disabled={
                                    !(
                                        !isEmpty(requestDataForm.actorType.actor_type_no) &&
                                        requestDataForm.actorImage.length >= 4 &&
                                        requestDataForm.actorName !== '' &&
                                        requestDataForm.topSize !== 0 &&
                                        requestDataForm.bottomSize !== 0 &&
                                        requestDataForm.footSize !== 0 &&
                                        requestDataForm.specialty !== '' &&
                                        requestDataForm.actorHeight !== 0 &&
                                        requestDataForm.actorWeight !== 0 &&
                                        dataList[actorTypeIndex].detail_info.every(item =>
                                        item.gender === 'N' || item.gender === requestDataForm.actorSex
                                            ? requestDataForm.tagList.some(e => e.detail_category_no === item.detail_category_no)
                                            : true
                                        )
                                    )
                                }
                                title={props.route.params.isEdit ? '????????? ??????' : '????????? ??????'}
                                titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                                buttonStyle={{backgroundColor: '#e5293e',borderRadius: scale(35),paddingVertical: scale(15),}}
                                onPress={() => _setMyProfileInfo()}
                            />
                            </>
                        ) : null
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
        {/* ???????????? ?????? */}
        <Modal
            isVisible={isOpend.isDatePickerOpend}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            onBackdropPress={() => setIsOpend({...isOpend, isDatePickerOpend: !isOpend.isDatePickerOpend})}
            onBackButtonPress={() => setIsOpend({...isOpend, isDatePickerOpend: !isOpend.isDatePickerOpend})}
            coverScreen={false}
            style={{justifyContent: 'flex-end', margin: 0}}
            statusBarTranslucent={true}
        >
            <SafeAreaView style={{maxHeight: scale(200), backgroundColor: 'white'}}>
                <DatePicker
                    date={new Date(requestDataForm.actorBirth * 1000)}
                    mode="date"
                    style={{width: screenWidth}}
                    onDateChange={date =>
                        setRequestDataForm({...requestDataForm, actorBirth: +new Date(date) / 1000,})
                    }
                    maximumDate={new Date()}
                />
            </SafeAreaView>
        </Modal>
        {/* ?????? ?????? */}
        <Modal
            isVisible={isOpend.isTopSizeOpend}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            onBackdropPress={() => setIsOpend({...isOpend, isTopSizeOpend: !isOpend.isTopSizeOpend})}
            onBackButtonPress={() => setIsOpend({...isOpend, isTopSizeOpend: !isOpend.isTopSizeOpend})}
            coverScreen={false}
            style={{justifyContent: 'flex-end', margin: 0}}
            statusBarTranslucent={true}
        >
            <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
                <Text style={{textAlign: 'center', fontSize: scale(16), marginTop: scale(5)}}>?????? ??????</Text>
                <ScrollView>
                {
                    !isEmptyArr(dataList) &&
                    !isEmpty(actorTypeIndex) &&
                    dataList[actorTypeIndex].top.map((item, index) => (
                        <TouchableOpacity
                            key={`topSize_${index}`}
                            style={{marginVertical: scale(6)}}
                            onPress={() => {
                                let tmpArr = {...requestDataForm};
                                tmpArr.topSize = item;
                                setRequestDataForm(tmpArr);
                                setIsOpend({...isOpend, isTopSizeOpend: false});
                            }}
                        >
                            <Text style={{textAlign: 'center',fontSize: scale(20),color: requestDataForm.topSize === item ? '#e5293e' : 'black',}}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))
                }
                </ScrollView>
            </SafeAreaView>
        </Modal>
        {/* ?????? ?????? */}
        <Modal
            isVisible={isOpend.isBottomSizeOpend}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            onBackdropPress={() => setIsOpend({...isOpend, isBottomSizeOpend: !isOpend.isBottomSizeOpend})}
            onBackButtonPress={() => setIsOpend({...isOpend, isBottomSizeOpend: !isOpend.isBottomSizeOpend})}
            coverScreen={false}
            style={{justifyContent: 'flex-end', margin: 0}}
            statusBarTranslucent={true}
        >
            <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
                <Text style={{textAlign: 'center', fontSize: scale(16), marginTop: scale(5)}}>?????? ??????</Text>
                <ScrollView>
                {
                    !isEmptyArr(dataList) &&
                    !isEmpty(actorTypeIndex) &&
                    dataList[actorTypeIndex].bottom.map((item, index) => (
                        <TouchableOpacity
                            key={`bottomSize_${index}`}
                            style={{marginVertical: scale(6)}}
                            onPress={() => {
                                let tmpArr = {...requestDataForm};
                                tmpArr.bottomSize = item;
                                setRequestDataForm(tmpArr);
                                setIsOpend({...isOpend, isBottomSizeOpend: false});
                            }}
                        >
                            <Text style={{textAlign: 'center',fontSize: scale(20),color: requestDataForm.bottomSize === item ? '#e5293e' : 'black'}}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))
                }
                </ScrollView>
            </SafeAreaView>
        </Modal>
        {/* ?????? ?????? */}
        <Modal
            isVisible={isOpend.isShoesSizeOpend}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            onBackdropPress={() => setIsOpend({...isOpend, isShoesSizeOpend: !isOpend.isShoesSizeOpend})}
            onBackButtonPress={() => setIsOpend({...isOpend, isShoesSizeOpend: !isOpend.isShoesSizeOpend})}
            coverScreen={false}
            style={{justifyContent: 'flex-end', margin: 0}}
            statusBarTranslucent={true}
        >
            <SafeAreaView style={{height: scale(200), backgroundColor: 'white'}}>
                <Text style={{textAlign: 'center', fontSize: scale(16), marginTop: scale(5)}}>?????? ??????</Text>
                <ScrollView>
                {
                    !isEmptyArr(dataList) &&
                    !isEmpty(actorTypeIndex) &&
                    dataList[actorTypeIndex].shoes.map((item, index) => (
                    <TouchableOpacity
                        key={`footSize_${index}`}
                        style={{marginVertical: scale(6)}}
                        onPress={() => {
                            let tmpArr = {...requestDataForm};
                            tmpArr.footSize = item;
                            setRequestDataForm(tmpArr);
                            setIsOpend({...isOpend, isShoesSizeOpend: false});
                        }}
                    >
                        <Text style={{textAlign: 'center',fontSize: scale(20),color: requestDataForm.footSize === item ? '#e5293e' : 'black'}}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                    ))
                }
                </ScrollView>
            </SafeAreaView>
        </Modal>
        {
            isLoading ? <LoadingIndicator /> : null
        }
        </KeyboardAvoidingView>
    );
};

export default ActorRegister;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewScrollInner: {
        padding: scale(15),
    },
    viewListBoxContainer: {
        borderRadius: scale(5),
        borderWidth: scale(1),
        borderBottomWidth: scale(1),
        borderColor: '#e5293e',
        paddingVertical: scale(10),
        paddingHorizontal: scale(15),
        marginBottom: scale(15),
    },
    viewCheckArea: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    viewTagButton: {
        width: '49%',
        paddingBottom: scale(15),
        flexDirection: 'row',
        alignItems: 'center',
    },
    txtTagLabel: {
        fontSize: scale(14),
        flex: 1,
    },
    txtProfileLabel: {
        fontSize: scale(16),
        color: '#e5293e',
        fontWeight: 'bold',
        marginBottom: scale(10),
    },
    inputEdit: {
        borderRadius: scale(5),
        borderWidth: scale(1),
        borderColor: '#dddddd',
        paddingVertical: scale(10),
        paddingHorizontal: scale(15),
        marginBottom: scale(15),
        fontSize: scale(14),
    },
    viewSexArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(15),
    },
    viewSexMale: {
        paddingVertical: scale(12),
        alignItems: 'center',
        borderRadius: scale(5),
        borderColor: '#dddddd',
        borderWidth: scale(1),
        width: '49%',
    },
    viewSexFemale: {
        paddingVertical: scale(12),
        alignItems: 'center',
        borderRadius: scale(5),
        borderColor: '#dddddd',
        borderWidth: scale(1),
        width: '49%',
    },
    viewAgencyArea: {
        flexDirection: 'row',
        marginBottom: scale(15),
    },
    viewCareerHistoryArea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewToggleArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});
