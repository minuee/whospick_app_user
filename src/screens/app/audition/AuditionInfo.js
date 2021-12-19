import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import scale from '../../../common/Scale';

const AuditionInfo = ({auditionInfo}) => {
  return (
    <View style={{...styles.viewTabInner}}>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>작품종류</Text>
        <Text style={{...styles.txtInfo}}>{auditionInfo.type}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>장르</Text>
        <Text style={{...styles.txtInfo}}>
          {auditionInfo.genre.map((item, index) => (index === auditionInfo.genre.length - 1 ? `${item}` : `${item}, `))}
        </Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>제작사</Text>
        <Text style={{...styles.txtInfo}}>
          {auditionInfo.producer.map((item, index) =>
            index === auditionInfo.producer.length - 1 ? `${item}` : `${item}, `
          )}
        </Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>감독</Text>
        <Text style={{...styles.txtInfo}}>
          {auditionInfo.director.map((item, index) =>
            index === auditionInfo.director.length - 1 ? `${item}` : `${item}, `
          )}
        </Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>담당자</Text>
        <Text style={{...styles.txtInfo}}>
          {auditionInfo.manager.map((item, index) =>
            index === auditionInfo.manager.length - 1 ? `${item}` : `${item}, `
          )}
        </Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>촬영시작</Text>
        <Text style={{...styles.txtInfo}}>{auditionInfo.recordStart}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>촬영종료</Text>
        <Text style={{...styles.txtInfo}}>{auditionInfo.recordEnd}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>촬영장소</Text>
        <Text style={{...styles.txtInfo}}>{auditionInfo.recordPlace}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>출연료</Text>
        <Text style={{...styles.txtInfo}}>{auditionInfo.price}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>모집성별</Text>
        <Text style={{...styles.txtInfo}}>{`남자 ${auditionInfo.sex.male} / 여자 ${auditionInfo.sex.female}`}</Text>
      </View>
      <View style={{...styles.viewListItem}}>
        <Text style={{...styles.txtLabel}}>모집마감일</Text>
        <Text style={{...styles.txtInfo}}>{auditionInfo.endPoster}</Text>
      </View>
      <View style={{...styles.viewListItem, flexDirection: 'column'}}>
        <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>오디션내용</Text>
        <Text style={{...styles.txtInfo}}>{auditionInfo.desc}</Text>
      </View>
    </View>
  );
};

export default AuditionInfo;

const styles = StyleSheet.create({
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
