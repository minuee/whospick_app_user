import React, {useContext, useEffect, useRef, useState} from 'react';
import {FlatList,Platform,SafeAreaView,StyleSheet,Text,View,LayoutAnimation,UIManager,Alert,TouchableOpacity,} from 'react-native';
import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';
import {isEmpty, isEmptyArr, logging} from '../../../common/Utils';

import {Avatar, Button, Header, Icon} from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DirectorPick = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const {haveProfile} = useContext(UserTokenContext);
    const [dataList, setDataList] = useState({list: [], total_count: 0});
    const [isEdit, setIsEdit] = useState(false);
    const _getPickDirector = async bool => {
        if (dataList.has_next === false && !bool) {
            return null;
        }
        try {
            const apiResult = await apiObject.getPickDirector({
                next_token: bool ? null : dataList.next_token,
            },
                loading => setIsLoading(loading)
            );
            if (bool) {
                setDataList(apiResult);
            } else {
                setDataList({
                    list: [...dataList.list, ...apiResult.list],
                    has_next: apiResult.has_next,
                    next_token: apiResult.next_token,
                    total_count: apiResult.total_count,
                });
            }
        } catch (error) {
            logging(error.response?.data, 'pick-me-director-list');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _removePickDirector = (audition_ask_no, index) => {
        Alert.alert('[안내]', '나를 픽한 디렉터를 삭제할까요?\n\n이 작업은 되돌릴 수 없습니다.', [
        {
            text: '취소',
            style: 'cancel',
        },
        {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
                try {
                    await apiObject.removePickDirector({audition_ask_no: [audition_ask_no]});
                    let tmpArr = [...dataList.list];
                    tmpArr.splice(index, 1);
                    setDataList({
                        ...dataList,
                        list: tmpArr,
                        total_count: dataList.total_count > 0 ? dataList.total_count - 1 : 0,
                    });
                } catch (error) {
                    logging(error.response?.data, 'remove-pick-me-director');
                    Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
                }
            },
        },
        ]);
    };

    useEffect(() => {
        _getPickDirector();
    }, []);

    const _renderDirectorPick = ({item, index}) => (
        <View style={{...styles.viewDirectorBox}}>
            <Avatar
                source={isEmpty(item.url) ? require('../../../../assets/images/drawable-xxxhdpi/profile.png') : {uri: item.url}}
                size={scale(50)}
                rounded={true}
            />
            <Text style={{fontSize: scale(14), fontWeight: 'bold'}}>{item.user_name} 디렉터</Text>
            <Button
                title={'오디션공고보기'}
                titleStyle={{fontSize: scale(11), color: '#e5293e'}}
                type="outline"
                onPress={() => props.navigation.navigate('DirectorPickAudition', {directorInfo: item})}
            />
            {
                isEdit ? (
                <Icon
                    name="ios-remove-circle"
                    type="ionicon"
                    color="#e5293e"
                    size={scale(25)}
                    onPress={() => _removePickDirector(item.audition_ask_no, index)}
                />
                ) : null
            }
        </View>
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
                centerComponent={{text: '나를 픽한 디렉터', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                rightComponent={
                    !isEmptyArr(dataList.list) && {
                        text: 'Edit',
                        onPress: () => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setIsEdit(!isEdit);
                        },
                    style: {fontSize: scale(18), color: 'white'},
                    }
                }
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <View style={{...styles.viewInner}}>
                    <Text style={{fontSize: scale(16),fontWeight: 'bold',color: '#e5293e',}}>
                        {`나를 픽한 디렉터 ${dataList.total_count}명`}
                    </Text>
                </View>
                {
                    !haveProfile && (
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scale(16), textAlign: 'center', marginBottom: scale(10)}}>
                            {'프로필을 작성을 통해\n나의 매력을 감독님들께 발산해주세요!'}
                        </Text>
                        <TouchableOpacity
                            style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(5),paddingHorizontal: scale(12),}}
                            onPress={() => props.navigation.replace('TabEditUser')}
                        >
                            <Text style={{color: 'white', fontSize: scale(16)}}>내 프로필 작성하기</Text>
                        </TouchableOpacity>
                    </View>
                    )
                }
                {
                    isEmptyArr(dataList.list) && (
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scale(16), textAlign: 'center', marginBottom: scale(10), color: '#a4a4a4'}}>
                            {'아직 나를 픽한 감독님들이 없어요.\n곧 엄청난 감독님들의 픽을 받을거에요! :)'}
                        </Text>
                    </View>
                    )
                }
                <FlatList
                    data={dataList.list}
                    renderItem={_renderDirectorPick}
                    keyExtractor={(item, index) => `director_${index}`}
                    contentContainerStyle={{...styles.viewInner, paddingTop: 0}}
                    refreshing={isLoading}
                    onRefresh={() => _getPickDirector(true)}
                    onEndReached={() => _getPickDirector()}
                    onEndReachedThreshold={0.1}
                />
            </SafeAreaView>
        </View>
    );
};

export default DirectorPick;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewInner: {
        padding: scale(25),
    },
    viewDirectorBox: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        marginBottom: scale(15),
        borderRadius: scale(5),
    },
});
