import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-elements';
import FastImage from 'react-native-fast-image';

import scale from '../../../common/Scale';

const AuditionRoles = ({auditionRoles}) => {
  return (
    <View style={{...styles.viewTabInner}}>
      {auditionRoles.map((item, index) => (
        <View key={`rolesList_${index}`}>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel, color: '#e5293e'}}>{`모집배역 ${index + 1}`}</Text>
            <Text style={{...styles.txtInfo}} />
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>역할</Text>
            <Text style={{...styles.txtInfo}}>{item.rolesName}</Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>역할 비중</Text>
            <Text style={{...styles.txtInfo}}>{item.roles}</Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>성별</Text>
            <Text style={{...styles.txtInfo}}>
              {item.sex.map((d, i) => (i === item.sex.length - 1 ? `${d}` : `${d}, `))}
            </Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>나이</Text>
            <Text style={{...styles.txtInfo}}>
              {item.age.map((d, i) => (i === item.age.length - 1 ? `${d}대` : `${d}-`))}
            </Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>키</Text>
            <Text style={{...styles.txtInfo}}>{item.height}</Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>몸무게</Text>
            <Text style={{...styles.txtInfo}}>{item.weight}</Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>사투리</Text>
            <Text style={{...styles.txtInfo}}>
              {item.accent.map((d, i) => (i === item.accent.length - 1 ? `${d}` : `${d}, `))}
            </Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>외국어</Text>
            <Text style={{...styles.txtInfo}}>
              {item.language.map((d, i) => (i === item.language.length - 1 ? `${d}` : `${d}, `))}
            </Text>
          </View>
          <View style={{...styles.viewListItem}}>
            <Text style={{...styles.txtLabel}}>이미지</Text>
            <Text style={{...styles.txtInfo}}>
              {item.image.map((d, i) => (i === item.image.length - 1 ? `${d}` : `${d}, `))}
            </Text>
          </View>
          <View style={{...styles.viewListItem, flexDirection: 'column'}}>
            <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>캐릭터소개</Text>
            <Text style={{...styles.txtInfo}}>{item.desc}</Text>
          </View>
          {item.isLike ? (
            <View
              style={{
                ...StyleSheet.absoluteFill,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <FastImage
                source={require('../../../../assets/images/drawable-xxxhdpi/like_jjim.png')}
                style={{width: scale(150), height: scale(150)}}
              />
            </View>
          ) : null}
          <View style={{...styles.viewListItem, justifyContent: 'space-between'}}>
            <Button
              title="찜하기"
              titleStyle={{fontSize: scale(14), fontWeight: 'bold', color: '#e5293e'}}
              buttonStyle={{
                backgroundColor: 'white',
                paddingHorizontal: scale(30),
                borderRadius: scale(35),
                borderColor: '#e5293e',
                borderWidth: scale(1),
              }}
              onPress={() => {}}
              icon={{
                name: item.isLike ? 'ios-heart' : 'ios-heart-outline',
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
              onPress={() => {}}
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
  );
};

export default AuditionRoles;

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
