import React, {useContext, useEffect, useState} from 'react';
import {FlatList,Platform,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';
import scale from '../../../common/Scale';
import {isEmpty, logging, YYYYMMDDHHMM} from '../../../common/Utils';

import {Avatar, Button, Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import LoadingContext from '../../../Context/LoadingContext';
import {apiObject} from '../../../common/API';

const DirectorPickAudition = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const directorInfo = props.route.params.directorInfo;
    const [dataList, setDataList] = useState({list: []});
    const _getPickDirectorAudition = async () => {
        try {
            const apiResult = await apiObject.getPickDirectorAudition({user_no: directorInfo.user_no});
            setDataList(apiResult);
        } catch (error) {
            logging(error.response?.data, 'director-audition-list/...');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getPickDirectorAudition();
    }, []);

    const _renderAuditionList = ({item, index}) => (
        <TouchableOpacity
            style={{...styles.viewAuditionCard}}
            onPress={() => props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})}
        >
            <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(5),paddingRight: scale(10),}}>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
                    <FastImage
                        source={item.d_day <= 7 ? require('../../../../assets/images/drawable-xxxhdpi/flag.png') : require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')}
                        style={{marginRight: scale(5),paddingLeft: scale(3),paddingRight: scale(10),}}
                    >
                        <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}}>{`D-${item.d_day}`}</Text>
                    </FastImage>
                    <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                    <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                </View>
            </View>
            <View style={{paddingHorizontal: scale(10)}}>
                <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
                <TouchableOpacity
                    style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(2),paddingHorizontal: scale(12),alignSelf: 'flex-end',}}
                    onPress={() => props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})}
                >
                    <Text style={{color: 'white'}}>오디션보기</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
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
                centerComponent={{text: '오디션공고보기', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <View style={{...styles.viewScrollInner, paddingTop: scale(20)}}>
                    <View style={{...styles.viewDirectorBox}}>
                        <Avatar
                            source={isEmpty(directorInfo.url) ? require('../../../../assets/images/drawable-xxxhdpi/profile.png') : {uri: directorInfo.url}}
                            size={scale(50)}
                            rounded={true}
                        />
                        <Text style={{fontSize: scale(14), fontWeight: 'bold'}}>{directorInfo.user_name} 디렉터</Text>
                    </View>
                    <Text style={{fontSize: scale(16), fontWeight: 'bold', color: '#e5293e'}}>디렉터가 등록한 오디션</Text>
                </View>
                <FlatList
                    data={dataList.list}
                    renderItem={_renderAuditionList}
                    keyExtractor={(item, index) => `audition_${index}`}
                    contentContainerStyle={{...styles.viewScrollInner, paddingTop: scale(5)}}
                    refreshing={isLoading}
                    onRefresh={() => _getPickDirectorAudition()}
                />
            </SafeAreaView>
        </View>
    );
};

export default DirectorPickAudition;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewHeader: {
        padding: scale(25),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewScrollInner: {
        padding: scale(20),
        paddingTop: 0,
    },
    viewDirectorBox: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: scale(15),
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
        marginBottom: scale(25),
        borderRadius: scale(5),
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