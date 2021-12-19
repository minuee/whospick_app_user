import React, {useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';
import {isEmpty, isEmptyArr, logging, YYYYMMDDHHMM} from '../../../common/Utils';

import {Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';

import LoadingContext from '../../../Context/LoadingContext';

const AuditionMain = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);

  const [dataList, setDataList] = useState({work_type: []});
  const [auditionList, setAuditionList] = useState({list: []});

  const [videoType, setVideoType] = useState({work_type_no: '', content: '전체'});
  const [orderBy, setOrderBy] = useState('new');

  const [isVideoTypeOpend, setIsVideoTypeOpend] = useState(false);

  const _onToggleLike = (index, audition_no) => {
    let tmpArr = [...auditionList.list];

    if (tmpArr[index].dibs_yn) {
      _deleteFavorite(audition_no, index);
    } else {
      _addFavorite(audition_no, index);
    }
  };

  const _addFavorite = async (audition_no, index) => {
    try {
      await apiObject.addFavorite({audition_no: audition_no});

      let tmpArr = [...auditionList.list];

      tmpArr[index].dibs_yn = true;

      setAuditionList({...auditionList, list: tmpArr});
    } catch (error) {
      console.log('_addFavorite -> error', error);
      logging(error.response?.data, 'dibs-audition/...');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _deleteFavorite = async (audition_no, index) => {
    try {
      await apiObject.deleteFavorite({audition_no: audition_no});

      let tmpArr = [...auditionList.list];

      tmpArr[index].dibs_yn = false;

      setAuditionList({...auditionList, list: tmpArr});
    } catch (error) {
      console.log('_deleteFavorite -> error', error);
      logging(error.response?.data, 'undibs-audition');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _renderAuditionList = ({item, index}) => (
    <TouchableOpacity
      style={{...styles.viewAuditionCard}}
      onPress={() =>
        props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})
      }>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: scale(5),
          paddingRight: scale(10),
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
          <FastImage
            source={
              item.d_day <= 7
                ? require('../../../../assets/images/drawable-xxxhdpi/flag.png')
                : require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')
            }
            style={{
              // width: scale(41),
              marginRight: scale(5),
              paddingLeft: scale(3),
              paddingRight: scale(10),
            }}>
            <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}}>{`D-${item.d_day}`}</Text>
          </FastImage>
          <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
          <Text style={{fontSize: scale(10), color: '#bababa'}}>{YYYYMMDDHHMM(item.reg_dt)}</Text>
        </View>
        <Icon
          name={item.dibs_yn ? 'favorite' : 'favorite-border'}
          color={item.dibs_yn ? '#e5293e' : '#999999'}
          size={scale(15)}
          containerStyle={{
            backgroundColor: 'white',
            borderRadius: scale(50),
            borderWidth: scale(1),
            borderColor: item.dibs_yn ? '#e5293e' : '#eeeeee',
            padding: scale(3),
          }}
          onPress={() => _onToggleLike(index, item.audition_no)}
        />
      </View>
      <View style={{paddingHorizontal: scale(10)}}>
        <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
        <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.director_name}`}</Text>
        <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
        <TouchableOpacity
          style={{
            borderRadius: scale(5),
            backgroundColor: '#e5293e',
            paddingVertical: scale(2),
            paddingHorizontal: scale(12),
            alignSelf: 'flex-end',
          }}
          onPress={() =>
            props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})
          }>
          <Text style={{color: 'white'}}>오디션보기</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const _getAuditionCate = async () => {
    try {
      const apiResult = await apiObject.getAuditionCate(loading => setIsLoading(loading));

      let tmpArr = [...apiResult.work_type];
      tmpArr.unshift({work_type_no: '', content: '전체'});

      setDataList({...apiResult, work_type: tmpArr});
    } catch (error) {
      console.log('_getAuditionCate -> error', error);
      logging(error.response?.data, 'cdn/audition-category-list');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _getTabTwoList = async bool => {
    if (auditionList.has_next === false && !bool) {
      return null;
    }
    try {
      const isSettingFilter = await AsyncStorage.getItem('@whosPick_SearchFilter_Actor');
      const isSettingFilterParse = JSON.parse(isSettingFilter);

      const apiResult = await apiObject.getTabTwoList(
        {
          next_token: bool ? null : auditionList.next_token,
          order: orderBy,
          category_work_type_no: !isEmpty(videoType.work_type_no) ? videoType.work_type_no : null,
          work_type_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.videoType.work_type_no : null,
          work_type_detail_no: !isEmpty(isSettingFilterParse)
            ? isSettingFilterParse.videoDetailType.work_type_detail_no
            : null,
          role_weight_no: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorType.role_weight_no : null,
          gender: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.sex : null,
          age_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.min : null,
          age_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorAge.max : null,
          height_start: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.min : null,
          height_end: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.actorHeight.max : null,
          detail_info_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.detail_info_list : null,
          genre_list: !isEmpty(isSettingFilterParse) ? isSettingFilterParse.genre_list : null,
        },
        loading => setIsLoading(loading)
      );

      if (bool) {
        setAuditionList(apiResult);
      } else {
        setAuditionList({
          list: [...auditionList.list, ...apiResult.list],
          has_next: apiResult.has_next,
          next_token: apiResult.next_token,
        });
      }
    } catch (error) {
      console.log('_getTabTwoList -> error', error);
      logging(error.response?.data, 'search/audition');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  useEffect(() => {
    _getAuditionCate();
  }, []);

  useEffect(() => {
    _getTabTwoList(true);
  }, [videoType, orderBy]);

  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="#e5293e"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'light-content', animated: true}}
        leftComponent={{
          icon: 'ios-menu',
          type: 'ionicon',
          size: scale(25),
          color: 'white',
          onPress: () => props.navigation.toggleDrawer(),
        }}
        centerComponent={{text: '오디션', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        rightComponent={
          <>
            <Icon name="search" size={scale(25)} color="white" onPress={() => props.navigation.navigate('Search')} />
            <Icon
              name="sliders"
              type="font-awesome"
              size={scale(25)}
              color="white"
              onPress={() => props.navigation.navigate('AuditionFilter')}
            />
          </>
        }
        rightContainerStyle={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: scale(5),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewVideoTypeArea}} />
        <View style={{...styles.viewListBoxContainer}}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}
            onPress={() => setIsVideoTypeOpend(!isVideoTypeOpend)}>
            <Text style={{...styles.txtSlideLabel}}>{videoType.content}</Text>
            <Icon
              name={isVideoTypeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              type="material"
              size={scale(25)}
              color="#e5293e"
            />
          </TouchableOpacity>
          <View style={{...styles.viewCheckArea}}>
            {isVideoTypeOpend &&
              dataList.work_type.map(item =>
                videoType.content !== item.content ? (
                  <TouchableOpacity
                    key={`videoType_${item.work_type_no}`}
                    style={{...styles.viewTagButton}}
                    onPress={() => {
                      setVideoType(item);
                      setIsVideoTypeOpend(false);
                    }}>
                    <Text style={{...styles.txtTagLabel}} numberOfLines={1}>
                      {item.content}
                    </Text>
                  </TouchableOpacity>
                ) : null
              )}
          </View>
        </View>
        <View style={{flex: 1}}>
          {!isEmptyArr(auditionList.list) && (
            <View style={{...styles.viewOrderByArea}}>
              <TouchableOpacity onPress={() => setOrderBy('new')}>
                <Text style={{...styles.txtOrderBy, color: orderBy === 'new' ? '#e5293e' : '#999999'}}>최신순</Text>
              </TouchableOpacity>
              <Text style={{...styles.txtOrderBy}}> ・ </Text>
              <TouchableOpacity onPress={() => setOrderBy('popular')}>
                <Text style={{...styles.txtOrderBy, color: orderBy === 'popular' ? '#e5293e' : '#999999'}}>인기순</Text>
              </TouchableOpacity>
              <Text style={{...styles.txtOrderBy}}> ・ </Text>
              <TouchableOpacity onPress={() => setOrderBy('deadline')}>
                <Text style={{...styles.txtOrderBy, color: orderBy === 'deadline' ? '#e5293e' : '#999999'}}>
                  마감임박순
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isEmptyArr(auditionList.list) && (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: scale(18), color: '#a4a4a4'}}>오디션 공고가 없어요 :(</Text>
            </View>
          )}
          <FlatList
            keyExtractor={(item, index) => `auditionCard_${index}`}
            data={auditionList.list}
            renderItem={_renderAuditionList}
            refreshing={isLoading}
            onRefresh={() => _getTabTwoList(true)}
            onEndReached={() => _getTabTwoList()}
            onEndReachedThreshold={0.1}
            style={{marginTop: scale(5)}}
            contentContainerStyle={{padding: scale(15)}}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AuditionMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewVideoTypeArea: {
    backgroundColor: '#e5293e',
    height: scale(60),
    marginBottom: scale(10),
  },
  viewListBoxContainer: {
    padding: scale(10),
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
    borderRadius: scale(10),
    backgroundColor: 'white',
    width: '90%',
    alignSelf: 'center',
    position: 'absolute',
    zIndex: 99999,
  },
  txtSlideLabel: {
    fontSize: scale(14),
  },
  viewCheckArea: {
    justifyContent: 'space-between',
  },
  viewTagButton: {
    paddingTop: scale(18),
  },
  txtTagLabel: {
    fontSize: scale(14),
  },
  viewOrderByArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: scale(15),
  },
  txtOrderBy: {
    fontSize: scale(12),
    color: '#999999',
  },
  viewScrollInner: {
    padding: scale(15),
  },
  viewAuditionCard: {
    paddingVertical: scale(10),
    backgroundColor: 'white',
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
    marginBottom: scale(15),
    borderRadius: scale(5),
  },
  txtAuditionTitle: {
    fontSize: scale(14),
    fontWeight: 'bold',
  },
  txtAuditionSub: {
    fontSize: scale(11),
    color: '#666666',
  },
});
