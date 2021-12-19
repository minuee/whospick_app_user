import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import scale from '../../../common/Scale';

import {Icon, ListItem} from 'react-native-elements';
import FastImage from 'react-native-fast-image';

const AuditionNotice = ({auditionNotice}) => {
  const [opendIndex, setOpendIndex] = useState(null);

  return (
    <View>
      {auditionNotice.map((item, index) => (
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
              <ListItem.Title style={{fontSize: scale(14)}}>{`[${item.type}] ${item.title}`}</ListItem.Title>
              <ListItem.Subtitle style={{fontSize: scale(10), color: '#999999'}}>{item.uploadReg}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron
              name={opendIndex === index ? 'ios-chevron-up' : 'ios-chevron-down'}
              type="ionicon"
              size={scale(25)}
              color="#e5293e"
            />
          </View>
          <View style={{paddingTop: opendIndex === index ? scale(20) : null}}>
            {opendIndex === index && (
              <View>
                <Text style={{fontSize: scale(12)}}>{item.body}</Text>
              </View>
            )}
          </View>
        </ListItem>
      ))}
    </View>
  );
};

export default AuditionNotice;

const styles = StyleSheet.create({});
