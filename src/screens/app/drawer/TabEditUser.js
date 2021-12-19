import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import scale from '../../../common/Scale';

import {Tab, Tabs} from 'native-base';
import {Header, Icon} from 'react-native-elements';

import EditProfile from './EditProfile';
import EditUserInfo from './EditUserInfo';

const TabEditUser = props => {
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
                centerComponent={{text: '회원정보', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <Tabs tabBarUnderlineStyle={{backgroundColor: '#e5293e'}}>
                    <Tab
                        heading="회원정보"
                        tabStyle={{backgroundColor: 'white'}}
                        activeTabStyle={{backgroundColor: 'white'}}
                        activeTextStyle={{color: '#e5293e'}}
                    >
                        <EditUserInfo parentsProps={props} />
                    </Tab>
                    <Tab
                        heading="배우프로필정보"
                        tabStyle={{backgroundColor: 'white'}}
                        activeTabStyle={{backgroundColor: 'white'}}
                        activeTextStyle={{color: '#e5293e'}}
                    >
                        <EditProfile parentsProps={props} />
                    </Tab>
                </Tabs>
            </SafeAreaView>
        </View>
    );
};

export default TabEditUser;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
});
