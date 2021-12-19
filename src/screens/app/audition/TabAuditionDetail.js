import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Text, View, Alert, Linking} from 'react-native';

import scale from '../../../common/Scale';
import {AddComma, isEmpty, isEmptyArr, isIOS, screenHeight, YYYYMMDDHHMM} from '../../../common/Utils';
import {apiObject} from '../../../common/API';
import LoadingContext from '../../../Context/LoadingContext';
import LoadingIndicator from '../../../Component/LoadingIndicator';
import UserTokenContext from '../../../Context/UserTokenContext';

import {Button, Divider, Header, Icon, ListItem} from 'react-native-elements';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';

const TabAuditionDetail = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const {haveProfile, setUserInfo} = useContext(UserTokenContext);

  const scrollViewRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [opendIndex, setOpendIndex] = useState(null);
  const [fixedScrollOffsetY, setFixedScrollOffsetY] = useState(0);
  const [visibleFixedHeader, setVisibleFixedHeader] = useState(false);

  const [dataList, setDataList] = useState({
    poster_list: [],
    genre_text_list: [],
    title: '',
    company: '',
    recruit_list_readable: [],
    notice_list: [],
  });

  const _getAuditionInfo = async () => {
    try {
      const apiResult = await apiObject.getAuditionInfo(
        {
          audition_no: props.route.params.audition_no,
        },
        setIsLoading
      );

      setDataList(apiResult);
    } catch (error) {
      console.log('_getAuditionInfo -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const TabA = () => (
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
  );

  const TabB = () => (
    <>
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
    </>
  );

  const TabC = () => {
    return (
      <View style={{minHeight: screenHeight}}>
        {isEmptyArr(dataList.notice_list) ? (
          <View style={{flex: 1, alignItems: 'center', paddingTop: scale(50)}}>
            <Text style={{fontSize: scale(20)}}>등록된 공지사항이 없습니다!</Text>
          </View>
        ) : (
          dataList.notice_list.map((item, index) => (
            <ListItem
              key={`notice_${index}`}
              bottomDivider={true}
              onPress={() => setOpendIndex(opendIndex === index ? null : index)}
              delayPressIn={0}
              underlayColor={'white'}
              containerStyle={{...styles.viewListBoxContainer, flexDirection: 'column'}}>
              <View style={{flexDirection: 'row'}}>
                {!dataList.notice_public_yn ? (
                  <Icon
                    name="ios-lock-closed"
                    type="ionicon"
                    color="black"
                    size={scale(15)}
                    style={{marginRight: scale(5)}}
                  />
                ) : (
                  <FastImage
                    source={require('../../../../assets/images/drawable-xxxhdpi/megaphone.png')}
                    style={{width: scale(15), height: scale(15), marginRight: scale(5)}}
                  />
                )}
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
                        첨부파일 : {String(item.file_url).split('/')[String(item.file_url).split('/').length - 1]}
                      </Text>
                      <Icon name="ios-attach" type="ionicon" color="#dddddd" />
                    </TouchableOpacity>
                  )}
                  <Divider style={{marginVertical: scale(10)}} />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}>
                    <Button
                      title="삭제"
                      titleStyle={{fontSize: scale(12), fontWeight: 'bold', color: 'white'}}
                      buttonStyle={{
                        backgroundColor: '#e5293e',
                        paddingVertical: scale(5),
                        borderRadius: scale(35),
                      }}
                      onPress={() => _onDeleteNoticePress(item.audition_notice_no, props.route.params.audition_no)}
                      containerStyle={{marginRight: scale(15)}}
                    />
                    <Button
                      title="수정"
                      titleStyle={{fontSize: scale(12), fontWeight: 'bold', color: 'white'}}
                      buttonStyle={{
                        backgroundColor: '#e5293e',
                        paddingVertical: scale(5),
                        borderRadius: scale(35),
                      }}
                      onPress={() =>
                        props.navigation.navigate('NoticeWrite', {
                          isEdit: true,
                          audition_no: props.route.params.audition_no,
                          info: item,
                        })
                      }
                    />
                  </View>
                </View>
              )}
            </ListItem>
          ))
        )}
      </View>
    );
  };

  const _renderTab = () => {
    switch (tabIndex) {
      case 0:
        return <TabA />;

      case 1:
        return <TabB />;

      case 2:
        return <TabC />;

      default:
        return <TabA />;
    }
  };

  const _onRolesLikePress = index => {
    let tmpArr = [...dataList.recruit_list];

    tmpArr[index].dibs_yn = !tmpArr[index].dibs_yn;

    if (tmpArr[index].dibs_yn) {
      setIsVisible(true);
    }
    setDataList({...dataList, recruit_list: tmpArr});
  };

  const _addActorFavorite = async (audition_recruit_no, index) => {
    try {
      await apiObject.addActorFavorite({audition_recruit_no: audition_recruit_no});

      _onRolesLikePress(index);
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _deleteActorFavorite = async (audition_recruit_no, index) => {
    try {
      await apiObject.deleteActorFavorite({audition_recruit_no: audition_recruit_no});

      _onRolesLikePress(index);
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
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
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _addFavorite = async () => {
    try {
      await apiObject.addFavorite({audition_no: props.route.params.audition_no});

      setDataList({...dataList, dibs_yn: true});
    } catch (error) {
      console.log('_addFavorite -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _deleteFavorite = async () => {
    try {
      await apiObject.deleteFavorite({audition_no: props.route.params.audition_no});

      setDataList({...dataList, dibs_yn: false});
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
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

  useEffect(() => {
    fixedScrollOffsetY !== 0 && scrollViewRef.current.scrollTo({x: 0, y: fixedScrollOffsetY, animated: true});
  }, [tabIndex]);

  useFocusEffect(
    useCallback(() => {
      _getAuditionInfo();
    }, [])
  );

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
        centerComponent={{
          text: props.route.params.HEADER,
          style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'},
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        {visibleFixedHeader && (
          <View
            style={{
              backgroundColor: 'white',
              flexDirection: 'row',
              alignItems: 'center',
              padding: scale(10),
              height: scale(100),
              position: 'absolute',
              width: '100%',
              zIndex: 999999,
            }}>
            <FastImage
              source={{uri: !isEmptyArr(dataList.poster_list) ? dataList.poster_list[0].url : ''}}
              style={{
                width: scale(75),
                height: scale(75),
                marginRight: scale(10),
                borderRadius: scale(10),
              }}
            />
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: scale(10),
                  color: '#e5293e',
                  fontWeight: 'bold',
                  marginBottom: scale(10),
                }}>{`[${dataList.company}]`}</Text>
              <Text numberOfLines={2}>{dataList.title}</Text>
            </View>
            <Icon
              name="ios-heart-circle-outline"
              type="ionicon"
              size={scale(35)}
              color={dataList.dibs_yn ? '#e5293e' : '#c2c2c2'}
              onPress={() => _onToggleAuditionFavoritePress()}
            />
          </View>
        )}
        <ScrollView
          ref={scrollViewRef}
          stickyHeaderIndices={[1]}
          onScroll={e => {
            if (e.nativeEvent.contentOffset.y >= fixedScrollOffsetY - 10) {
              setVisibleFixedHeader(true);
            } else {
              setVisibleFixedHeader(false);
            }
          }}
          scrollEventThrottle={16}>
          <View style={{alignItems: 'center', paddingTop: scale(20)}}>
            <FastImage
              source={{uri: !isEmptyArr(dataList.poster_list) ? dataList.poster_list[0].url : ''}}
              style={{
                width: scale(200),
                height: scale(200),
                borderRadius: scale(15),
                marginBottom: scale(25),
              }}
            />
            <Text
              style={{
                fontSize: scale(20),
                color: '#e5293e',
                fontWeight: 'bold',
                marginBottom: scale(25),
              }}>{`[${dataList.company}]`}</Text>
            <Text
              style={{
                fontSize: scale(20),
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: scale(25),
              }}>{`${dataList.title}`}</Text>
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
          </View>
          <View onLayout={e => setFixedScrollOffsetY(e.nativeEvent.layout.y)}>
            <View style={{backgroundColor: 'white', height: scale(100)}} />
            <View style={{backgroundColor: 'white', flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth}}>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{paddingVertical: scale(15)}} onPress={() => setTabIndex(0)}>
                  <Text style={{textAlign: 'center', fontSize: scale(14), color: tabIndex === 0 ? '#e5293e' : 'black'}}>
                    오디션 정보
                  </Text>
                </TouchableOpacity>
                {tabIndex === 0 && <View style={{height: scale(5), backgroundColor: '#e5293e'}} />}
              </View>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{paddingVertical: scale(15)}} onPress={() => setTabIndex(1)}>
                  <Text style={{textAlign: 'center', fontSize: scale(14), color: tabIndex === 1 ? '#e5293e' : 'black'}}>
                    모집배역
                  </Text>
                </TouchableOpacity>
                {tabIndex === 1 && <View style={{height: scale(5), backgroundColor: '#e5293e'}} />}
              </View>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{paddingVertical: scale(15)}} onPress={() => setTabIndex(2)}>
                  <Text style={{textAlign: 'center', fontSize: scale(14), color: tabIndex === 2 ? '#e5293e' : 'black'}}>
                    공지사항
                  </Text>
                </TouchableOpacity>
                {tabIndex === 2 && <View style={{height: scale(5), backgroundColor: '#e5293e'}} />}
              </View>
            </View>
          </View>
          {_renderTab()}
        </ScrollView>
      </SafeAreaView>
      <Modal
        isVisible={isVisible}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        onBackdropPress={() => setIsVisible(false)}
        onBackButtonPress={() => setIsVisible(false)}
        statusBarTranslucent={true}
        hasBackdrop={false}
        onModalShow={() => {
          setTimeout(() => {
            setIsVisible(false);
          }, 1000);
        }}>
        <View style={{...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <FastImage
            source={require('../../../../assets/images/drawable-xxxhdpi/like_jjim.png')}
            style={{width: scale(150), height: scale(150)}}
          />
        </View>
      </Modal>
      {isLoading && <LoadingIndicator />}
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
