import React, {useContext, useEffect, useState} from 'react';
import {FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';
import {changeTime, isEmpty, isEmptyArr, logging} from '../../../common/Utils';

import {Header, Icon} from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';

const PartnerMain = props => {
  const {isLoading, setIsLoading} = useContext(LoadingContext);

  const [cateList, setCateList] = useState([{affiliate_category_no: '', content: '전체'}]);
  const [partnerList, setPartnerList] = useState({list: []});

  const [videoType, setVideoType] = useState({affiliate_category_no: '', content: '전체'});
  const [isPartnerTypeOpend, setIsPartnerTypeOpend] = useState(false);

  const _getPartnerCate = async () => {
    try {
      const apiResult = await apiObject.getPartnerCate();
      let tmpArr = [];
      tmpArr.push({affiliate_category_no: '', content: '전체'});
      tmpArr.push(...apiResult.actor_list);
      setCateList(tmpArr);
      _getPartnerList();
    } catch (error) {
      console.log('_getPartnerCate -> error', error);
      logging(error.response?.data, 'affiliate-categories');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _getPartnerList = async affiliate_category_no => {
    try {
      const apiResult = await apiObject.getPartnerList({
        affiliate_category_no: !isEmpty(affiliate_category_no) ? affiliate_category_no : '',
      });
      setPartnerList({
        list: apiResult.list,
        has_next: apiResult.has_next,
        next_token: apiResult.next_token,
      });
    } catch (error) {
      console.log('_getPartnerList -> error', error);
      logging(error.response?.data, 'affiliate-list/...');
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  const _getPartnerListMore = async affiliate_category_no => {
    if (!partnerList.has_next) {
      return null;
    }
    const apiResult = await apiObject.getPartnerList({
      affiliate_category_no: !isEmpty(affiliate_category_no) ? affiliate_category_no : '',
      next_token: partnerList.next_token,
    });
    setPartnerList({
      list: [...partnerList.list, ...apiResult.list],
      has_next: apiResult.has_next,
      next_token: apiResult.next_token,
    });
  };

  useEffect(() => {
    _getPartnerCate();
  }, []);

  const _renderPartnerList = ({item, index}) => (
    <View style={{...styles.viewAuditionCard}}>
      <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category_text}] `}</Text>
      <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="comment-dots" type="font-awesome-5" size={scale(15)} color="#e5293e" />
          <Text style={{fontSize: scale(12), fontWeight: 'bold', color: '#e5293e'}}>{` ${item.comment_count}  `}</Text>
          <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${changeTime(item.reg_dt)}`}</Text>
        </View>
        <TouchableOpacity
          style={{
            borderRadius: scale(5),
            backgroundColor: '#999999',
            paddingVertical: scale(3),
            paddingHorizontal: scale(10),
            alignSelf: 'flex-end',
          }}
          onPress={() =>
            props.navigation.navigate('PartnerDetail', {
              partnerType: item.category_text,
              title: item.title,
              uploadReg: item.reg_dt,
              affiliate_no: item.affiliate_no,
            })
          }>
          <Text style={{color: 'white'}}>자세히보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        centerComponent={{text: '제휴업체', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
        rightComponent={
          <Icon name="search" size={scale(25)} color="white" onPress={() => props.navigation.navigate('Search')} />
        }
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewVideoTypeArea}} />
        <View style={{...styles.viewListBoxContainer}}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}
            onPress={() => setIsPartnerTypeOpend(!isPartnerTypeOpend)}>
            <Text style={{...styles.txtSlideLabel}}>{videoType.content}</Text>
            <Icon
              name={isPartnerTypeOpend ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              type="material"
              size={scale(25)}
              color="#e5293e"
            />
          </TouchableOpacity>
          <View style={{...styles.viewCheckArea}}>
            {isPartnerTypeOpend &&
              cateList.map((item, index) =>
                videoType.content !== item.content ? (
                  <TouchableOpacity
                    key={`partnerType_${index}`}
                    style={{...styles.viewTagButton}}
                    onPress={() => {
                      setVideoType(item);
                      _getPartnerList(item.affiliate_category_no);
                      setIsPartnerTypeOpend(false);
                    }}>
                    <Text style={{...styles.txtTagLabel}} numberOfLines={1}>
                      {item.content}
                    </Text>
                  </TouchableOpacity>
                ) : null
              )}
          </View>
        </View>
        {isEmptyArr(partnerList.list) && (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: scale(18), color: '#a4a4a4'}}>제휴업체가 없어요 :(</Text>
          </View>
        )}
        <FlatList
          keyExtractor={(item, index) => `auditionCard_${index}`}
          data={partnerList.list}
          renderItem={_renderPartnerList}
          style={{marginTop: scale(5)}}
          contentContainerStyle={{padding: scale(15)}}
          refreshing={isLoading}
          onRefresh={() => _getPartnerList()}
          onEndReached={() => _getPartnerListMore()}
          onEndReachedThreshold={0.1}
        />
      </SafeAreaView>
    </View>
  );
};

export default PartnerMain;

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
    marginTop: scale(18),
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
    padding: scale(10),
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
    marginVertical: scale(10),
  },
  txtAuditionSub: {
    fontSize: scale(11),
    color: '#666666',
  },
});
