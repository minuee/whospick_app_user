import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';
import {apiObject} from '../../common/API';

import {Header} from 'react-native-elements';
import WebView from 'react-native-webview';

const TOS = props => {
    const [htmlTOS, setHtmlTOS] = useState('');
    const _getTOS = async () => {
        const apiResult = await apiObject.getTOS();
        setHtmlTOS(apiResult.html);
    };

    useEffect(() => {
        _getTOS();
    }, []);

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
                centerComponent={{text: '이용약관', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <WebView source={{html: htmlTOS}} />
        </View>
    );
};

export default TOS;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});