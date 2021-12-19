import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet,Text,View,StatusBar,SafeAreaView,Platform,ScrollView,TouchableOpacity,KeyboardAvoidingView,Alert,TextInput,} from 'react-native';

import scale from '../../common/Scale';
import LoadingIndicator from '../../Component/LoadingIndicator';
import {isEmpty, isIOS, logging} from '../../common/Utils';
import {apiObject} from '../../common/API';

import LoadingContext from '../../Context/LoadingContext';
import UserTokenContext from '../../Context/UserTokenContext';

import {Icon, ListItem, Button, Input} from 'react-native-elements';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Modal from 'react-native-modal';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';

const AuditionFilter = props => {
const {isLoading, setIsLoading} = useContext(LoadingContext);

const [dataList, setDataList] = useState({work_type: [], role_weight: [], list: [], genre: []});
const [requestData, setRequestData] = useState({
    videoType: {work_type_no: '', content: ''},
    videoDetailType: {work_type_detail_no: '', content: ''},
    actorType: {role_weight_no: '', content: ''},
    sex: '',
    actorAge: {min: 1, max: 90},
    actorHeight: {min: 100, max: 200},
    detail_info_list: [],
    genre_list: [],
});

const [isOpend, setIsOpend] = useState({
    isVideoTypeOpend: false,
    isVideoDetailTypeOpend: false,
    isActorTypeOpend: false,
});

const [videoTypeIndex, setVideoTypeIndex] = useState(null);
const [isTagOpend, setIsTagOpend] = useState([]);

const _onToggleTag = (item, tagArr, maxCnt) => {
    switch (tagArr) {
        case 'videoType':
            if (requestData.videoType === item) {
                setRequestData({...requestData, videoType: {work_type_no: '', content: ''}});
            } else {
                setRequestData({...requestData, videoType: {work_type_no: item.work_type_no, content: item.content}});
            }
            !isEmpty(item.each_list) ? setVideoTypeIndex(maxCnt) : setVideoTypeIndex(null);            
            break;
        case 'videoDetailType':
            if (requestData.videoDetailType === item) {
                setRequestData({...requestData, videoDetailType: {work_type_detail_no: '', content: ''}});
            } else {
                setRequestData({...requestData, videoDetailType: item});
            }
            break;
        case 'actorType':
            if (requestData.actorType === item) {
                setRequestData({...requestData, actorType: {role_weight_no: '', content: ''}});
            } else {
                setRequestData({...requestData, actorType: item});
            }
            break;
        case 'tagList':
            let tmpTagArr = [...requestData.detail_info_list];
            if (tmpTagArr.findIndex(data => data.detail_checkbox_no === item.detail_checkbox_no) > -1) {
                tmpTagArr.splice(tmpTagArr.findIndex(data => data.detail_checkbox_no === item.detail_checkbox_no),1);
            } else {
                let cnt = 0;
                for (let i = 0; i < tmpTagArr.length; i++) {
                    if (tmpTagArr[i].detail_category_no === item.detail_category_no) {
                        cnt += 1;
                    }
                }
                if (cnt === maxCnt) {
                    break;
                }
                tmpTagArr.push({...item, direct_input: null});
            }
            setRequestData({...requestData, detail_info_list: tmpTagArr});
            break;
        case 'genreList':
            let tmpGenreList = [...requestData.genre_list];
            if (tmpGenreList.findIndex(data => data.detail_checkbox_no === item.detail_checkbox_no) > -1) {
                tmpGenreList.splice(tmpGenreList.findIndex(data => data.detail_checkbox_no === item.detail_checkbox_no),1);
            } else {
                if (tmpGenreList.length === maxCnt) {
                    break;
                }
                tmpGenreList.push({...item, direct_input: null});
            }
            setRequestData({...requestData, genre_list: tmpGenreList});
            break;
        }
    };
    const _setMyFilterPress = async () => {
        await AsyncStorage.setItem('@whosPick_SearchFilter_Actor', JSON.stringify(requestData));
        Toast.showWithGravity('필터를 저장했습니다.', Toast.SHORT, Toast.CENTER);
    };
    const _resetMyFilterPress = () => {
        Alert.alert(
            '[안내]',
            '검색 필터를 모두 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.',
            [
                {text: '취소', style: 'cancel'},
                {
                    text: '초기화',
                    style: 'destructive',
                    onPress: async () => {
                        setRequestData({
                            videoType: {work_type_no: '', content: ''},
                            videoDetailType: {work_type_detail_no: '', content: ''},
                            actorType: {role_weight_no: '', content: ''},
                            sex: '',
                            actorAge: {min: 1, max: 90},
                            actorHeight: {min: 100, max: 200},
                            detail_info_list: [],
                            genre_list: [],
                        });
                        await AsyncStorage.removeItem('@whosPick_SearchFilter_Actor');
                        Toast.showWithGravity('필터를 초기화했습니다.', Toast.SHORT, Toast.CENTER);
                    },
                },
            ],
            {cancelable: false}
        );
    };

    const _getAuditionConfigCate = async () => {
        try {
            const apiResult = await apiObject.getAuditionConfigCate(loading => setIsLoading(loading));
            setDataList(apiResult);
        } catch (error) {            
            logging(error.response?.data, 'cdn/audition-custom-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getAuditionConfigCate();
    }, []);

    useEffect(() => {
        _isSettingFilter();
    }, [dataList]);

    const _isSettingFilter = async () => {
        const isSettingFilter = await AsyncStorage.getItem('@whosPick_SearchFilter_Actor');
        if (isSettingFilter) {
            setRequestData(JSON.parse(isSettingFilter));
            let tmpIndex = dataList.work_type.findIndex(
                item => item.work_type_no === JSON.parse(isSettingFilter).videoType.work_type_no
            );
            if (tmpIndex !== -1 && !isEmpty(dataList.work_type[tmpIndex].each_list)) {
                setVideoTypeIndex(tmpIndex);
            }
        }
    };

    return (
        <KeyboardAvoidingView style={{...styles.container}} behavior={isIOS() ? 'padding' : null}>
            <StatusBar translucent={true} backgroundColor={'transparent'} barStyle={'light-content'} animated={true} />
            <SafeAreaView style={{...styles.contents}}>
                <View style={{...styles.viewHeader}}>
                    <Text style={{...styles.txtHeaderLabel}}>맞춤 오디션 설정</Text>
                    <Icon name="close" size={scale(25)} color="#707070" onPress={() => props.navigation.goBack(null)} />
                </View>
                <Text style={{marginLeft: scale(25), fontSize: scale(12), color: '#999999'}}>
                    자신에게 맞는 오디션을 설정해주세요.
                </Text>
                <ScrollView>
                    <View style={{...styles.viewScrollInner}}>
                        {/* 공연분야 */}
                        <ListItem
                            bottomDivider={true}
                            onPress={() => setIsOpend({...isOpend, isVideoTypeOpend: !isOpend.isVideoTypeOpend})}
                            delayPressIn={0}
                            underlayColor={'white'}
                            containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}
                        >
                            <View style={{flexDirection: 'row'}}>
                                <ListItem.Content>
                                    <ListItem.Title
                                        style={{fontSize: scale(14), color: requestData.videoType.content !== '' ? 'black' : '#dddddd'}}
                                    >
                                        {requestData.videoType.content !== '' ? requestData.videoType.content : '공연분야선택'}
                                    </ListItem.Title>
                                </ListItem.Content>
                                <ListItem.Chevron
                                    name={isOpend.isVideoTypeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    type="material"
                                    size={scale(25)}
                                    color="#e5293e"
                                />
                            </View>
                            <View style={{...styles.viewCheckArea, paddingTop: isOpend.isVideoTypeOpend ? scale(20) : null}}>
                                {
                                    isOpend.isVideoTypeOpend &&
                                    dataList.work_type.map((item, index) => (
                                        <TouchableOpacity
                                            key={`videoType_${index}`}
                                            style={{...styles.viewTagButton}}
                                            onPress={() => _onToggleTag(item, 'videoType', index)}
                                        >
                                            <Icon
                                                name={requestData.videoType.content === item.content ? 'check-circle' : 'radio-button-unchecked'}
                                                size={scale(25)}
                                                color={requestData.videoType.content === item.content ? '#e5293e' : '#dddddd'}
                                                style={{marginRight: scale(5)}}
                                            />
                                            <Text style={{...styles.txtTagLabel}} numberOfLines={1}>
                                                {item.content}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        </ListItem>
                        {/* 분야 구분 상세 */}
                        {
                            !isEmpty(videoTypeIndex) && (
                            <ListItem
                                bottomDivider={true}
                                onPress={() => setIsOpend({...isOpend, isVideoDetailTypeOpend: !isOpend.isVideoDetailTypeOpend})}
                                delayPressIn={0}
                                underlayColor={'white'}
                                containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}
                            >
                                <View style={{flexDirection: 'row'}}>
                                    <ListItem.Content>
                                        <ListItem.Title
                                            style={{
                                                fontSize: scale(14),
                                                color: requestData.videoDetailType.content !== '' ? 'black' : '#dddddd',
                                            }}
                                        >
                                            {requestData.videoDetailType.content !== '' ? requestData.videoDetailType.content : '종류 선택'}
                                        </ListItem.Title>
                                    </ListItem.Content>
                                    <ListItem.Chevron
                                        name={isOpend.isVideoDetailTypeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                        type="material"
                                        size={scale(25)}
                                        color="#e5293e"
                                    />
                                </View>
                                <View style={{...styles.viewCheckArea, paddingTop: isOpend.isVideoDetailTypeOpend ? scale(20) : null}}>
                                    {
                                        isOpend.isVideoDetailTypeOpend && !isEmpty(videoTypeIndex) && 
                                        dataList.work_type[videoTypeIndex].each_list.map((item, index) => (
                                            <TouchableOpacity
                                                key={`videoDetailType_${index}`}
                                                style={{...styles.viewTagButton}}
                                                onPress={() => _onToggleTag(item, 'videoDetailType')}
                                            >
                                                <Icon
                                                    name={requestData.videoDetailType.content === item.content
                                                    ? 'check-circle'
                                                    : 'radio-button-unchecked'
                                                    }
                                                    size={scale(25)}
                                                    color={requestData.videoDetailType.content === item.content ? '#e5293e' : '#dddddd'}
                                                    style={{marginRight: scale(5)}}
                                                />
                                                <Text style={{...styles.txtTagLabel}} numberOfLines={1}>
                                                    {item.content}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                </View>
                            </ListItem>
                        )}
                        {/* 역할 비중 */}
                        <ListItem
                            bottomDivider={true}
                            onPress={() => setIsOpend({...isOpend, isActorTypeOpend: !isOpend.isActorTypeOpend})}
                            delayPressIn={0}
                            underlayColor={'white'}
                            containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}
                        >
                            <View style={{flexDirection: 'row'}}>
                                <ListItem.Content>
                                    <ListItem.Title
                                        style={{fontSize: scale(14), color: requestData.actorType.content !== '' ? 'black' : '#dddddd'}}
                                    >
                                        {requestData.actorType.content !== '' ? requestData.actorType.content : '역할 비중'}
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
                                    dataList.role_weight.map((item, index) => (
                                        <TouchableOpacity
                                            key={`actorType_${index}`}
                                            style={{...styles.viewTagButton}}
                                            onPress={() => _onToggleTag(item, 'actorType')}
                                        >
                                            <Icon
                                                name={requestData.actorType.content === item.content ? 'check-circle' : 'radio-button-unchecked'}
                                                size={scale(25)}
                                                color={requestData.actorType.content === item.content ? '#e5293e' : '#dddddd'}
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
                        {/* 성별 */}
                        <View style={{...styles.viewSexArea}}>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{...styles.viewSexMale, backgroundColor: requestData.sex === 'M' ? '#e5293e' : null}}
                                onPress={() => {
                                    if (requestData.sex === 'M') {
                                        setRequestData({...requestData, sex: ''});
                                    } else {
                                        setRequestData({...requestData, sex: 'M'});
                                    }
                                }}
                            >
                                <Text style={{color: requestData.sex === 'M' ? 'white' : 'black'}}>남자</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{...styles.viewSexFemale, backgroundColor: requestData.sex === 'F' ? '#e5293e' : null}}
                                onPress={() => {
                                    if (requestData.sex === 'F') {
                                        setRequestData({...requestData, sex: ''});
                                    } else {
                                        setRequestData({...requestData, sex: 'F'});
                                    }
                                }}
                            >
                                <Text style={{color: requestData.sex === 'F' ? 'white' : 'black'}}>여자</Text>
                            </TouchableOpacity>
                        </View>
                        {/* 나이 */}
                        <View style={{...styles.viewListBoxContainer,padding: scale(15),}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={{fontSize: scale(12), color: '#999999'}}>나이</Text>
                                <Text style={{fontSize: scale(12),color: '#999999',}}>
                                    {`${requestData.actorAge.min}-${requestData.actorAge.max === 90 ? `${requestData.actorAge.max}+` : requestData.actorAge.max} 세`}
                                </Text>
                            </View>
                            <MultiSlider
                                values={[requestData.actorAge.min, requestData.actorAge.max]}
                                min={dataList.age_start}
                                max={dataList.age_end}
                                step={1}
                                sliderLength={300}
                                onValuesChange={e => setRequestData({...requestData, actorAge: {min: e[0], max: e[1]}})}
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
                        {/* 키 */}
                        <View style={{...styles.viewListBoxContainer,padding: scale(15)}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={{fontSize: scale(12), color: '#999999'}}>키</Text>
                                <Text style={{fontSize: scale(12),color: '#999999',}}>
                                    {`${requestData.actorHeight.min}-${requestData.actorHeight.max === 200 ? `${requestData.actorHeight.max}+` : requestData.actorHeight.max} cm`}
                                </Text>
                            </View>
                            <MultiSlider
                                values={[requestData.actorHeight.min, requestData.actorHeight.max]}
                                min={dataList.height_start}
                                max={dataList.height_end}
                                step={1}
                                sliderLength={300}
                                onValuesChange={e => setRequestData({...requestData, actorHeight: {min: e[0], max: e[1]}})}
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
                        {/* 태그 설정 */}
                        {
                            dataList.list.map((item, index) => (
                                <View
                                    style={{...styles.viewListBoxContainer, padding: scale(15)}}
                                    key={`tagList_${item.detail_category_no}`}
                                >
                                    <TouchableOpacity
                                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}
                                        onPress={() => {
                                            let tmpArr = [...isTagOpend];
                                            if (tmpArr.includes(`tagList_${item.detail_category_no}`)) {
                                                tmpArr.splice(tmpArr.indexOf(`tagList_${item.detail_category_no}`), 1);
                                            } else {
                                                tmpArr.push(`tagList_${item.detail_category_no}`);
                                            }
                                            setIsTagOpend(tmpArr);
                                        }}
                                    >
                                        <Text style={{...styles.txtSlideLabel}}>
                                            {item.content}
                                            {item.max_choice === -1 ? '' : ` (최대 ${item.max_choice}가지)`}
                                        </Text>
                                        <Icon
                                            name={isTagOpend.includes(`tagList_${item.detail_category_no}`)
                                            ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                            type="material"
                                            size={scale(25)}
                                            color="#e5293e"
                                        />
                                    </TouchableOpacity>
                                    <View
                                        style={{...styles.viewCheckArea, paddingTop: isTagOpend.includes(`tagList_${item.detail_category_no}`) ? scale(20) : null,}}
                                    >
                                        {
                                            isTagOpend.includes(`tagList_${item.detail_category_no}`) &&
                                            item.detail_checkbox.map((d, i) => (
                                                <TouchableOpacity
                                                    key={`tag_${d.detail_checkbox_no}`}
                                                    style={{...styles.viewTagButton}}
                                                    onPress={() => _onToggleTag(d, 'tagList', item.max_choice)}
                                                >
                                                    <Icon
                                                        name={requestData.detail_info_list.some(e =>
                                                            e.detail_category_no === d.detail_category_no &&
                                                            e.detail_checkbox_no === d.detail_checkbox_no
                                                        )
                                                        ? 'check-circle'
                                                        : 'radio-button-unchecked'
                                                        }
                                                        size={scale(25)}
                                                        color={
                                                            requestData.detail_info_list.some(
                                                            e => e.detail_category_no === d.detail_category_no &&
                                                            e.detail_checkbox_no === d.detail_checkbox_no
                                                            ) ? '#e5293e' : '#dddddd'
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
                                        isTagOpend.includes(`tagList_${item.detail_category_no}`) &&
                                        requestData.detail_info_list.some(
                                            e => e.detail_category_no === item.detail_category_no && e.direct_yn === true
                                        ) ? (
                                            <TextInput
                                                style={{...styles.inputEdit, width: '100%'}}
                                                placeholder="직접입력"
                                                value={
                                                    requestData.detail_info_list[
                                                        requestData.detail_info_list.findIndex(
                                                            e => e.detail_category_no === item.detail_category_no && e.direct_yn === true
                                                        )
                                                    ].direct_input
                                                }
                                                padding={0}
                                                onChangeText={text => {
                                                    let tmpArr = [...requestData.detail_info_list];
                                                    tmpArr[
                                                        requestData.detail_info_list.findIndex(
                                                            e => e.detail_category_no === item.detail_category_no && e.direct_yn === true
                                                        )
                                                    ].direct_input = text;
                                                    setRequestData({...requestData, detail_info_list: tmpArr});
                                                }}
                                                returnKeyType="done"
                                            />
                                        ) : null}
                                    </View>
                                </View>
                            ))
                        }
                        {/* 장르 설정 */}
                        {
                            dataList.genre.map((item, index) => (
                                <View
                                    style={{...styles.viewListBoxContainer, padding: scale(15)}}
                                    key={`tagList_${item.detail_category_no}`}
                                >
                                    <TouchableOpacity
                                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}
                                        onPress={() => {
                                            let tmpArr = [...isTagOpend];
                                            if (tmpArr.includes(`tagList_${item.detail_category_no}`)) {
                                                tmpArr.splice(tmpArr.indexOf(`tagList_${item.detail_category_no}`), 1);
                                            } else {
                                                tmpArr.push(`tagList_${item.detail_category_no}`);
                                            }
                                            setIsTagOpend(tmpArr);
                                        }}
                                    >
                                        <Text style={{...styles.txtSlideLabel}}>
                                            {item.content}
                                            {item.max_choice === -1 ? '' : ` (최대 ${item.max_choice}가지)`}
                                        </Text>
                                        <Icon
                                            name={
                                                isTagOpend.includes(`tagList_${item.detail_category_no}`)
                                                ? 'keyboard-arrow-up'
                                                : 'keyboard-arrow-down'
                                            }
                                            type="material"
                                            size={scale(25)}
                                            color="#e5293e"
                                        />
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                        ...styles.viewCheckArea,
                                        paddingTop: isTagOpend.includes(`tagList_${item.detail_category_no}`) ? scale(20) : null,
                                    }}>
                                        {
                                            isTagOpend.includes(`tagList_${item.detail_category_no}`) &&
                                            item.detail_checkbox.map((d, i) => (
                                                <TouchableOpacity
                                                    key={`tag_${d.detail_checkbox_no}`}
                                                    style={{...styles.viewTagButton}}
                                                    onPress={() => _onToggleTag(d, 'genreList', item.max_choice)}
                                                >
                                                    <Icon
                                                        name={
                                                            requestData.genre_list.some(
                                                                e =>  e.detail_category_no === d.detail_category_no && e.detail_checkbox_no === d.detail_checkbox_no
                                                            )
                                                            ? 'check-circle'
                                                            : 'radio-button-unchecked'
                                                        }
                                                        size={scale(25)}
                                                        color={
                                                            requestData.genre_list.some(
                                                                e =>
                                                                    e.detail_category_no === d.detail_category_no && e.detail_checkbox_no === d.    detail_checkbox_no
                                                            ) ? '#e5293e'  : '#dddddd'
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
                                            isTagOpend.includes(`tagList_${item.detail_category_no}`) &&
                                                requestData.genre_list.some(
                                                    e => e.detail_category_no === item.detail_category_no && e.direct_yn === true
                                                ) ? (
                                                <TextInput
                                                    style={{...styles.inputEdit, width: '100%'}}
                                                    placeholder="직접입력"
                                                    value={
                                                        requestData.genre_list[
                                                            requestData.genre_list.findIndex(
                                                                e => e.detail_category_no === item.detail_category_no && e.direct_yn === true
                                                            )
                                                        ].direct_input
                                                    }
                                                    padding={0}
                                                    onChangeText={text => {
                                                        let tmpArr = [...requestData.genre_list];
                                                        tmpArr[
                                                            requestData.genre_list.findIndex(
                                                                e => e.detail_category_no === item.detail_category_no && e.direct_yn === true
                                                            )
                                                        ].direct_input = text;                                                
                                                        setRequestData({...requestData, genre_list: tmpArr});
                                                    }}
                                                    returnKeyType="done"
                                                />
                                                ) : null}
                                    </View>
                                </View>
                            ))
                        }
                        <Button
                            title="초기화"
                            titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#999999'}}
                            buttonStyle={{backgroundColor: '#dddddd',borderRadius: scale(35),paddingVertical: scale(15),}}
                            containerStyle={{marginBottom: scale(10)}}
                            onPress={() => _resetMyFilterPress()}
                        />
                        <Button
                            title="저장"
                            titleStyle={{fontSize: scale(14), fontWeight: 'bold'}}
                            buttonStyle={{
                                backgroundColor: '#e5293e',
                                borderRadius: scale(35),
                                paddingVertical: scale(15),
                            }}
                            onPress={() => _setMyFilterPress()}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        {isLoading && <LoadingIndicator />}
        </KeyboardAvoidingView>
    );
};

export default AuditionFilter;

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: 'white',
},
contents: {
flex: 1,
},
viewScrollInner: {
padding: scale(25),
},
viewHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
paddingHorizontal: scale(25),
paddingTop: scale(25),
},
txtHeaderLabel: {
fontSize: scale(16),
fontWeight: 'bold',
color: '#e5293e',
},
viewListBoxContainer: {
borderBottomWidth: 0,
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
borderRadius: scale(4),
marginBottom: scale(15),
backgroundColor: 'white',
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
txtSlideLabel: {
fontSize: scale(16),
fontWeight: '500',
},
viewCheckArea: {
// paddingTop: scale(20),
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
},
inputEdit: {
borderRadius: scale(5),
borderWidth: scale(1),
borderColor: '#e5293e',
paddingVertical: scale(10),
paddingHorizontal: scale(15),
marginBottom: scale(15),
fontSize: scale(14),
},
});
