import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';
import {apiObject} from '../../common/API';

import {Header} from 'react-native-elements';
import WebView from 'react-native-webview';

const PP = props => {
    const [htmlPP, setHtmlPP] = useState('');
    const _getPP = async () => {
        const apiResult = await apiObject.getPP();
        setHtmlPP(apiResult.html);
    };

    useEffect(() => {
        _getPP();
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
                centerComponent={{text: '개인정보처리방침', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <WebView source={{html: htmlPP}} />
        </View>
    );
};

export default PP;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});