import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  Alert,
  Platform,
  UIManager,
  LayoutAnimation,
  TouchableOpacity,
  Linking,
} from 'react-native';

import scale from '../../../common/Scale';
import {AddComma, isEmpty, isEmptyArr, logging, screenWidth, YYYYMMDDHHMM} from '../../../common/Utils';
import {apiObject} from '../../../common/API';
import LoadingIndicator from '../../../Component/LoadingIndicator';

import {Button, Divider, Header, Icon, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {Tab, Tabs} from 'native-base';
import Toast from 'react-native-simple-toast';
import {useFocusEffect} from '@react-navigation/native';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

const HEADER_MAX_HEIGHT = scale(400);
const HEADER_MIN_HEIGHT = scale(100);
const IMAGE_MAX_HEIGHT = scale(200);
const IMAGE_MIN_HEIGHT = scale(75);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TabAuditionDetail = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {haveProfile, setUserInfo} = useContext(UserTokenContext);

  const [dataList, setDataList] = useState({
    poster_list: [],
    genre_text_list: [],
    title: '',
    company: '',
    recruit_list_readable: [],
    notice_list: [],
  });

  const [isScrollEnabled, setIsScrollEnabled] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [opendIndex, setOpendIndex] = useState(null);
  const [pointerEvents, setPointerEvents] = useState('auto');

  const [jjimSuccess, setJJimSuccess] = useState(false);

  useEffect(() => {
    if (!haveProfile) {
      Alert.alert(
        '[안내]',
        '배우 프로필을 등록해주세요!\n\n오디션지원, 프로필평가요청, 감독배우노출 등\n후즈픽의 기능을 이용하기 위해 프로필을 등록해주세요!',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '프로필등록',
            onPress: () => props.navigation.navigate('TabEditUser'),
          },
        ]
      );
    }
  }, []);

  const _applyAudition = async (audition_recruit_no, role_name) => {
    try {
      const apiResult = await apiObject.applyAudition({
        audition_recruit_no: audition_recruit_no,
      });

      if (apiResult.already_apply) {
        Toast.show('이미 지원이 완료된 오디션입니다.\n결과를 기다려주세요!', Toast.SHORT);
        return null;
      }

      if (!apiResult.payable) {
        Alert.alert('[안내]', '오디션 지원을 위한 포인트가 부족합니다.', [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '충전하기',
            onPress: () => props.navigation.navigate('BuyPoint', {audition_recruit_no, role_name}),
          },
        ]);
      } else {
        Toast.showWithGravity('지원을 완료했습니다.', Toast.SHORT, Toast.CENTER);
        setUserInfo({userPoint: apiResult.point});
      }
    } catch (error) {
      console.log('_applyAudition -> error', error);
      logging(error.response?.data, 'audition-apply');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onApplyAuditionPress = (audition_recruit_no, role_name) => {
    if (!haveProfile) {
      Alert.alert(
        '[안내]',
        '배우 프로필을 등록해주세요!\n\n오디션지원, 프로필평가요청, 감독배우노출 등\n후즈픽의 기능을 이용하기 위해 프로필을 등록해주세요!',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '프로필등록',
            onPress: () => props.navigation.navigate('TabEditUser'),
          },
        ]
      );

      return null;
    } else {
      Alert.alert('[안내]', `'${role_name}'역에 지원하시겠습니까?\n\n포인트 차감 : 1,000P`, [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '지원하기',
          onPress: () => _applyAudition(audition_recruit_no, role_name),
        },
      ]);
    }
  };

  const _onRolesLikePress = index => {
    let tmpArr = [...dataList.recruit_list];

    tmpArr[index].dibs_yn = !tmpArr[index].dibs_yn;

    setDataList({...dataList, recruit_list: tmpArr});

    if (tmpArr[index].dibs_yn) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setJJimSuccess(true);
      setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setJJimSuccess(false);
      }, 1000);
    }
  };

  const animation = useRef(new Animated.ValueXY({x: 0, y: HEADER_MAX_HEIGHT})).current;
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (
        (isScrollEnabled && scrollOffset <= 0 && gestureState.dy > 20) ||
        (!isScrollEnabled && gestureState.dy < -20)
      ) {
        return true;
      } else {
        return false;
      }
    },
    onPanResponderGrant: (evt, gestureState) => {
      animation.extractOffset();
    },
    onPanResponderMove: (evt, gestureState) => {
      animation.setValue({x: 0, y: gestureState.dy});
    },
    onPanResponderRelease: (evt, gestureState) => {
      setPointerEvents('none');
      if (Number(JSON.stringify(animation.y)) < HEADER_MIN_HEIGHT) {
        Animated.spring(animation.y, {
          toValue: 0,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      } else if (Number(JSON.stringify(animation.y)) > HEADER_MAX_HEIGHT) {
        Animated.spring(animation.y, {
          toValue: 0,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      } else if (gestureState.dy < -20) {
        setIsScrollEnabled(true);
        Animated.spring(animation.y, {
          toValue: -HEADER_MAX_HEIGHT + HEADER_MIN_HEIGHT,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      } else if (gestureState.dy > 20) {
        setIsScrollEnabled(false);
        Animated.spring(animation.y, {
          toValue: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
          tension: 1,
          useNativeDriver: false,
        }).start(() => setPointerEvents('auto'));
      }
    },
  });

  const animatedHeight = {
    transform: animation.getTranslateTransform(),
  };

  const headerY = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageHeight = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [IMAGE_MIN_HEIGHT, IMAGE_MAX_HEIGHT],
    extrapolate: 'clamp',
  });
  const imageTranslateX = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [-screenWidth / 2.8, 0],
    extrapolate: 'clamp',
  });

  const opacityValue = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MIN_HEIGHT + HEADER_MIN_HEIGHT / 2, HEADER_MAX_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const textOpacityValue = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MIN_HEIGHT + HEADER_MIN_HEIGHT / 2, HEADER_MAX_HEIGHT],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const textTranslateX = animation.y.interpolate({
    inputRange: [HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT],
    outputRange: [0, HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  const _getAuditionInfo = async () => {
    try {
      const apiResult = await apiObject.getAuditionInfo(
        {
          audition_no: props.route.params.audition_no,
        },
        loading => setIsLoading(loading)
      );

      setDataList(apiResult);
    } catch (error) {
      console.log('_getAuditionInfo -> error', error);
      logging(error.response?.data, 'audition/...');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useFocusEffect(
    useCallback(() => {
      _getAuditionInfo();
    }, [])
  );

  const _addFavorite = async () => {
    try {
      await apiObject.addFavorite({audition_no: props.route.params.audition_no});

      setDataList({...dataList, dibs_yn: true});
    } catch (error) {
      console.log('_addFavorite -> error', error);
      logging(error.response?.data, 'dibs-audition/...');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _deleteFavorite = async () => {
    try {
      await apiObject.deleteFavorite({audition_no: props.route.params.audition_no});

      setDataList({...dataList, dibs_yn: false});
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      logging(error.response?.data, 'undibs-audition');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _addActorFavorite = async (audition_recruit_no, index) => {
    try {
      await apiObject.addActorFavorite({audition_recruit_no: audition_recruit_no});

      _onRolesLikePress(index);
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      logging(error.response?.data, 'dibs-audition-recruit/...');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _deleteActorFavorite = async (audition_recruit_no, index) => {
    try {
      await apiObject.deleteActorFavorite({audition_recruit_no: audition_recruit_no});

      _onRolesLikePress(index);
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      logging(error.response?.data, 'undibs-audition-recruit');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _onToggleRolesFavoritePress = (audition_recruit_no, index) => {
    if (dataList.recruit_list[index].dibs_yn) {
      _deleteActorFavorite(audition_recruit_no, index);
    } else {
      _addActorFavorite(audition_recruit_no, index);
    }
  };

  const _onToggleAuditionFavoritePress = () => {
    if (dataList.dibs_yn) {
      Alert.alert('[안내]', '해당 오디션을 찜에서 삭제할까요?', [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => _deleteFavorite(),
        },
      ]);
    } else {
      _addFavorite();
    }
  };

  return (
    <View style={{...styles.container}} pointerEvents={pointerEvents}>
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
          text: props.route.params.HEADER,
          style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <Animated.View
          style={{
            height: headerY,
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: scale(15),
          }}>
          <Animated.View
            style={{
              height: imageHeight,
              width: imageHeight,
              transform: [{translateX: imageTranslateX}],
              // height: IMAGE_MIN_HEIGHT,
              // width: IMAGE_MIN_HEIGHT,
            }}>
            <FastImage
              source={{uri: !isEmptyArr(dataList.poster_list) ? dataList.poster_list[0].url : ''}}
              style={{flex: 1, width: null, height: null, borderRadius: scale(10)}}
            />
          </Animated.View>
          <Animated.View style={{opacity: opacityValue}}>
            <Text style={{fontSize: scale(20), color: '#e5293e', fontWeight: 'bold'}}>{`[${dataList.company}]`}</Text>
          </Animated.View>
          <Animated.View style={{opacity: opacityValue}}>
            <Text style={{fontSize: scale(20), fontWeight: 'bold', textAlign: 'center'}}>{`${dataList.title}`}</Text>
          </Animated.View>
          <Animated.View style={{opacity: opacityValue}}>
            <Button
              title={dataList.dibs_yn ? '찜해제' : '찜하기'}
              titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}
              buttonStyle={{
                backgroundColor: 'white',
                paddingVertical: scale(5),
                paddingHorizontal: scale(30),
                borderRadius: scale(35),
                borderColor: '#e5293e',
                borderWidth: scale(1),
              }}
              onPress={() => _onToggleAuditionFavoritePress()}
              icon={{
                name: dataList.dibs_yn ? 'ios-heart' : 'ios-heart-outline',
                type: 'ionicon',
                size: scale(18),
                color: '#e5293e',
              }}
              iconRight={true}
              containerStyle={{alignItems: 'center'}}
            />
          </Animated.View>
        </Animated.View>
        <Animated.View
          style={{
            transform: [{translateX: textTranslateX}],
            marginLeft: scale(20) + IMAGE_MIN_HEIGHT,
            position: 'absolute',
            marginTop: scale(15),
            alignItems: 'center',
            flexDirection: 'row',
            paddingRight: scale(10),
            opacity: textOpacityValue,
          }}>
          <View style={{flex: 1, height: IMAGE_MIN_HEIGHT, justifyContent: 'space-evenly'}}>
            <Text style={{fontSize: scale(10), color: '#e5293e', fontWeight: 'bold'}}>{`[${dataList.company}]`}</Text>
            <Text numberOfLines={2}>{dataList.title}</Text>
          </View>
          <Icon
            name="ios-heart-circle-outline"
            type="ionicon"
            size={scale(35)}
            color={dataList.dibs_yn ? '#e5293e' : '#c2c2c2'}
            onPress={() => _onToggleAuditionFavoritePress()}
          />
        </Animated.View>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            animatedHeight,
            // {...StyleSheet.absoluteFill, height: screenHeight - HEADER_MIN_HEIGHT - scale(50) - getBottomSpace()},
            {...StyleSheet.absoluteFill, height: '83%'},
          ]}>
          <Tabs tabBarUnderlineStyle={{backgroundColor: '#e5293e'}} locked={true}>
            <Tab
              heading="오디션정보"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <ScrollView
                scrollEnabled={isScrollEnabled}
                scrollEventThrottle={16}
                onScroll={event => {
                  setScrollOffset(event.nativeEvent.contentOffset.y);
                }}>
                <View style={{...styles.viewTabInner}}>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>작품종류</Text>
                    <Text style={{...styles.txtInfo}}>
                      {dataList.work_type_detail_text ? dataList.work_type_detail_text : dataList.work_type_text}
                    </Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>장르</Text>
                    <Text style={{...styles.txtInfo}}>
                      {dataList.genre_text_list.map((item, index) =>
                        index === dataList.genre_text_list.length - 1 ? `${item}` : `${item}, `
                      )}
                    </Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>제작사</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.company}</Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>감독</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.director_name}</Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>담당자</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.manager}</Text>
                  </View>
                  {!isEmpty(dataList.shoot_start) && (
                    <View style={{...styles.viewListItem}}>
                      <Text style={{...styles.txtLabel}}>촬영시작</Text>
                      <Text style={{...styles.txtInfo}}>{YYYYMMDDHHMM(dataList.shoot_start)}</Text>
                    </View>
                  )}
                  {!isEmpty(dataList.shoot_end) && (
                    <View style={{...styles.viewListItem}}>
                      <Text style={{...styles.txtLabel}}>촬영종료</Text>
                      <Text style={{...styles.txtInfo}}>{YYYYMMDDHHMM(dataList.shoot_end)}</Text>
                    </View>
                  )}
                  {!isEmpty(dataList.shoot_place) && (
                    <View style={{...styles.viewListItem}}>
                      <Text style={{...styles.txtLabel}}>촬영장소</Text>
                      <Text style={{...styles.txtInfo}}>{dataList.shoot_place}</Text>
                    </View>
                  )}
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>출연료</Text>
                    <Text style={{...styles.txtInfo}}>
                      {isNaN(Number(dataList.fee)) ? dataList.fee : AddComma(Number(dataList.fee))}
                    </Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>모집성별</Text>
                    <Text
                      style={{
                        ...styles.txtInfo,
                      }}>{`남자 ${dataList.male_count} / 여자 ${dataList.female_count}`}</Text>
                  </View>
                  <View style={{...styles.viewListItem}}>
                    <Text style={{...styles.txtLabel}}>모집마감일</Text>
                    <Text style={{...styles.txtInfo}}>{YYYYMMDDHHMM(dataList.deadline)}</Text>
                  </View>
                  <View style={{...styles.viewListItem, flexDirection: 'column'}}>
                    <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>오디션내용</Text>
                    <Text style={{...styles.txtInfo}}>{dataList.content}</Text>
                  </View>
                </View>
              </ScrollView>
            </Tab>
            <Tab
              heading="모집배역"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <ScrollView
                scrollEnabled={isScrollEnabled}
                scrollEventThrottle={16}
                onScroll={event => {
                  setScrollOffset(event.nativeEvent.contentOffset.y);
                }}>
                <View
                  style={{
                    borderBottomWidth: scale(1),
                    borderColor: '#dddddd',
                    alignItems: 'center',
                    paddingVertical: scale(15),
                  }}>
                  <Text style={{fontSize: scale(13.5), fontWeight: 'bold'}}>
                    모집배역수 : <Text style={{color: '#e5293e'}}>{dataList.recruit_list_readable.length}</Text>
                  </Text>
                </View>
                <View style={{...styles.viewTabInner}}>
                  {dataList.recruit_list_readable.map((item, index) => (
                    <View key={`rolesList_${index}`}>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel, color: '#e5293e'}}>{`모집배역 ${index + 1}`}</Text>
                        <Text style={{...styles.txtInfo}} />
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>역할</Text>
                        <Text style={{...styles.txtInfo}}>{item.role_name}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>역할 비중</Text>
                        <Text style={{...styles.txtInfo}}>{item.role_weight}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>성별</Text>
                        <Text style={{...styles.txtInfo}}>{item.gender === 'M' ? '남자' : '여자'}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>나이</Text>
                        <Text style={{...styles.txtInfo}}>{item.age}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>키</Text>
                        <Text style={{...styles.txtInfo}}>{item.height}</Text>
                      </View>
                      <View style={{...styles.viewListItem}}>
                        <Text style={{...styles.txtLabel}}>몸무게</Text>
                        <Text style={{...styles.txtInfo}}>{item.weight}</Text>
                      </View>
                      {item.detail_info_list.map((d, i) => (
                        <View style={{...styles.viewListItem}} key={`tag_${i}`}>
                          <Text style={{...styles.txtLabel}}>{d.category}</Text>
                          <Text style={{...styles.txtInfo}}>
                            {d.content.map((dd, ii) => (ii === d.content.length - 1 ? `${dd}` : `${dd}, `))}
                          </Text>
                        </View>
                      ))}
                      <View style={{...styles.viewListItem, flexDirection: 'column'}}>
                        <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>캐릭터소개</Text>
                        <Text style={{...styles.txtInfo}}>{item.introduce}</Text>
                      </View>
                      <View style={{...styles.viewListItem, justifyContent: 'space-between'}}>
                        <Button
                          title={dataList.recruit_list[index].dibs_yn ? '찜해제' : '찜하기'}
                          titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}
                          buttonStyle={{
                            backgroundColor: 'white',
                            paddingHorizontal: scale(30),
                            borderRadius: scale(35),
                            borderColor: '#e5293e',
                            borderWidth: scale(1),
                          }}
                          onPress={() => _onToggleRolesFavoritePress(item.audition_recruit_no, index)}
                          icon={{
                            name: dataList.recruit_list[index].dibs_yn ? 'ios-heart' : 'ios-heart-outline',
                            type: 'ionicon',
                            size: scale(18),
                            color: '#e5293e',
                          }}
                          iconRight={true}
                          containerStyle={{width: '49%'}}
                        />
                        <Button
                          title="오디션지원"
                          titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: 'white'}}
                          buttonStyle={{
                            backgroundColor: '#e5293e',
                            paddingHorizontal: scale(30),
                            borderRadius: scale(35),
                            borderColor: '#e5293e',
                            borderWidth: scale(1),
                          }}
                          onPress={() => _onApplyAuditionPress(item.audition_recruit_no, item.role_name)}
                          icon={
                            <FastImage
                              source={require('../../../../assets/images/drawable-xxxhdpi/noun_finger_2579783.png')}
                              style={{width: scale(15), height: scale(15), marginLeft: scale(5)}}
                            />
                          }
                          iconRight={true}
                          containerStyle={{width: '49%'}}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
              {jjimSuccess && (
                <View
                  style={{
                    ...StyleSheet.absoluteFill,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    zIndex: 9999,
                  }}>
                  <FastImage
                    source={require('../../../../assets/images/drawable-xxxhdpi/like_jjim.png')}
                    style={{width: scale(150), height: scale(150)}}
                  />
                </View>
              )}
            </Tab>
            <Tab
              heading="공지사항"
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}
              activeTextStyle={{color: '#e5293e'}}>
              <ScrollView
                scrollEnabled={isScrollEnabled}
                scrollEventThrottle={16}
                onScroll={event => {
                  setScrollOffset(event.nativeEvent.contentOffset.y);
                }}>
                <View>
                  {dataList.notice_list.map((item, index) => (
                    <ListItem
                      key={`notice_${index}`}
                      bottomDivider={true}
                      onPress={() => setOpendIndex(opendIndex === index ? null : index)}
                      delayPressIn={0}
                      underlayColor={'white'}
                      containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}>
                      <View style={{flexDirection: 'row'}}>
                        <FastImage
                          source={require('../../../../assets/images/drawable-xxxhdpi/megaphone.png')}
                          style={{width: scale(15), height: scale(15), marginRight: scale(5)}}
                        />
                        <ListItem.Content>
                          <ListItem.Title
                            style={{
                              fontSize: scale(14),
                            }}>{`[${item.audition_notice_level_text}] ${item.title}`}</ListItem.Title>
                          <ListItem.Subtitle style={{fontSize: scale(10), color: '#999999'}}>
                            {YYYYMMDDHHMM(item.reg_dt)}
                          </ListItem.Subtitle>
                        </ListItem.Content>
                        <ListItem.Chevron
                          name={opendIndex === index ? 'ios-chevron-up' : 'ios-chevron-down'}
                          type="ionicon"
                          size={scale(25)}
                          color="#e5293e"
                        />
                      </View>
                      {opendIndex === index && (
                        <View
                          style={{
                            paddingTop: opendIndex === index ? scale(20) : null,
                            width: '100%',
                          }}>
                          <Text style={{fontSize: scale(12)}}>{item.content}</Text>
                          {!isEmpty(item.file_url) && (
                            <TouchableOpacity
                              style={{marginTop: scale(10), flexDirection: 'row', alignItems: 'center'}}
                              onPress={async () => {
                                await Linking.openURL(item.file_url);
                              }}>
                              <Text style={{fontSize: scale(12), flex: 1}} numberOfLines={1}>
                                첨부파일 :{' '}
                                {String(item.file_url).split('/')[String(item.file_url).split('/').length - 1]}
                              </Text>
                              <Icon name="ios-attach" type="ionicon" color="#dddddd" />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </ListItem>
                  ))}
                </View>
              </ScrollView>
            </Tab>
          </Tabs>
        </Animated.View>
        {isLoading && <LoadingIndicator />}
      </SafeAreaView>
    </View>
  );
};

export default TabAuditionDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewListItem: {
    flexDirection: 'row',
    paddingVertical: scale(15),
  },
  viewTabInner: {
    padding: scale(15),
  },
  txtLabel: {
    flex: 1,
    fontSize: scale(13.5),
    fontWeight: 'bold',
  },
  txtInfo: {
    flex: 1,
    fontSize: scale(13.5),
    color: '#707070',
  },
});
