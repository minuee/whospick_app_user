import React from 'react';
import {StyleSheet, View, ActivityIndicator, StatusBar} from 'react-native';

const LoadingIndicator = props => {
    return (
        <View style={{...styles.container}}>
            <StatusBar translucent={true} backgroundColor="transparent" animated={true} />
            <ActivityIndicator size="large" color="#e5293e" />
        </View>
    );
};

export default LoadingIndicator;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .6)',
        zIndex: 9999,
    },
});
