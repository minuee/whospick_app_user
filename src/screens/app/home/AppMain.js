import React, {useState, useRef, useEffect, useContext, useCallback} from 'react';
import {StyleSheet,Text,View,SafeAreaView,Platform,TouchableOpacity,RefreshControl,ActivityIndicator} from 'react-native';
import scale from '../../../common/Scale';
import {isEmptyArr, logging, screenWidth, YYYYMMDDHHMM} from '../../../common/Utils';
import {Header, Icon} from 'react-native-elements';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import Animated from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import Clipboard from '@react-native-community/clipboard';
import Share from 'react-native-share';

import LoadingContext from '../../../Context/LoadingContext';
import UserTokenContext from '../../../Context/UserTokenContext';
import {apiObject} from '../../../common/API';
import {useFocusEffect} from '@react-navigation/native';
import LoadingIndicator from '../../../Component/LoadingIndicator';

const SLIDER_WIDTH = screenWidth;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.85);
const HEADER_HEIGHT = scale(150);

const AppMain = props => {

    const {userCode} = useContext(UserTokenContext);
    const [isLoading, setIsLoading] = useState(true);
    const [dataList, setDataList] = useState({actor_of_month: [], deadline: [], popular: []});
    const [activeSlide, setActiveSlide] = useState(0);
    const [modalInvite, setModalInvite] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerY = Animated.interpolate(scrollY, {
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [HEADER_HEIGHT, 0],    
    });

    useEffect(() => {
        const _isFirstTimeOpen = async () => {
            const isFirstTimeOpen = await AsyncStorage.getItem('@whosPick_WelcomeInvite');
            if (!isFirstTimeOpen) {
                setModalInvite(true);
            }
        };
        _isFirstTimeOpen();
    }, []);

    const _getTabOneList = async () => {
        try {
            const apiResult = await apiObject.getTabOneList(loading => setIsLoading(loading));
            setDataList(apiResult);
        } catch (error) {            
            logging(error.response?.data, 'main-page');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useFocusEffect(
        useCallback(() => {
            _getTabOneList();
        }, [])
    );

    const _isFirstTimeOpenDone = async () => {
        await AsyncStorage.setItem('@whosPick_WelcomeInvite', 'DONE');
        setModalInvite(false);
    };
    const _onToggleLike = (index, bool, audition_no) => {
        if (bool) {
            let tmpArr = [...dataList.deadline];
            if (tmpArr[index].dibs_yn) {
                _deleteFavorite(audition_no, index, bool);
            } else {
                _addFavorite(audition_no, index, bool);
            }
        } else {
            let tmpArr = [...dataList.popular];
            if (tmpArr[index].dibs_yn) {
                _deleteFavorite(audition_no, index, bool);
            } else {
                _addFavorite(audition_no, index, bool);
            }
        }
    };

    const _addFavorite = async (audition_no, index, bool) => {
        try {
            await apiObject.addFavorite({audition_no: audition_no});
            if (bool) {
                let tmpArr = [...dataList.deadline];
                tmpArr[index].dibs_yn = true;
                setDataList({...dataList, deadline: tmpArr});
            } else {
                let tmpArr = [...dataList.popular];
                tmpArr[index].dibs_yn = true;
                setDataList({...dataList, popular: tmpArr});
            }
        } catch (error) {
            logging(error.response?.data, 'dibs-audition/...');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _deleteFavorite = async (audition_no, index, bool) => {
        try {
            await apiObject.deleteFavorite({audition_no: audition_no});
            if (bool) {
                let tmpArr = [...dataList.deadline];
                tmpArr[index].dibs_yn = false;
                setDataList({...dataList, deadline: tmpArr});
            } else {
                let tmpArr = [...dataList.popular];
                tmpArr[index].dibs_yn = false;
                setDataList({...dataList, popular: tmpArr});
            }
        } catch (error) {
            logging(error.response?.data, 'undibs-audition');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    const _renderActorList = ({item, index}, parallaxProps) => (
        <TouchableOpacity
            style={{width: ITEM_WIDTH, height: scale(300), marginTop: scale(20)}}
            onPress={() => props.navigation.navigate('ActorDetail', {actor_no: item.actor_no})}
            activeOpacity={1}
        >
            <ParallaxImage
                source={{uri: item.image_url}}
                containerStyle={styles.imageContainer}
                style={styles.image}
                spinnerColor="#e5293e"
                parallaxFactor={0}
                {...parallaxProps}
            />
            <View style={{...styles.viewActorInfo}}>
                <Text style={{...styles.txtActorName, flex: 1}}>{item.name}</Text>
                <Text style={{...styles.txtActorDesc, flex: 1}}>{item.introduce}</Text>
                <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: '#dddddd'}} />
                <View style={{...styles.viewActorPrivate}}>
                    <View style={{flexDirection: 'row', flex: 0.7, justifyContent: 'space-between'}}>
                        <Text style={{...styles.txtActorPrivate}}>{item.age}세</Text>
                        <Text style={{...styles.txtActorPrivate}}>{`${item.height}cm/${item.weight}kg`}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                        {item.keyword.map((d, i) => (
                            <Text key={i} style={{...styles.txtActorPrivate, color: '#999999'}}>
                                {i === item.keyword.length - 1 ? `${d}` : `${d}, `}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
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
                centerComponent={{text: "Who's Pick?", style: {fontSize: scale(18), color: 'white'}}}
                rightComponent={
                    <>
                        <Icon name="search" size={scale(25)} color="white" onPress={() => props.navigation.navigate('Search')} />
                        <Icon
                            name="sliders"
                            type="font-awesome"
                            size={scale(25)}
                            color="white"
                            onPress={() => props.navigation.navigate('AuditionFilter')}
                        />
                    </>
                }
                rightContainerStyle={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: scale(5),
                }}
                containerStyle={{borderBottomWidth: 0}}
            />
            <SafeAreaView style={{...styles.contents}}>
                <Animated.View
                    style={{backgroundColor: '#e5293e', position: 'absolute', height: headerY, width: screenWidth}}
                />
                <Animated.ScrollView
                    bounces={true}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
                        useNativeDriver: true,
                    })}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={() => _getTabOneList()} tintColor="white" />
                    }
                    scrollEventThrottle={16}
                >
                    <View>
                        <Carousel
                            layout={'default'}
                            data={dataList.actor_of_month}
                            renderItem={_renderActorList}
                            sliderWidth={SLIDER_WIDTH}
                            itemWidth={ITEM_WIDTH}
                            hasParallaxImages={true}
                            onSnapToItem={index => setActiveSlide(index)}
                            inactiveSlideOpacity={1}
                        />
                        <Pagination
                            dotsLength={dataList.actor_of_month.length}
                            activeDotIndex={activeSlide}
                            dotStyle={{
                                width: scale(15),
                                height: scale(15),
                                borderRadius: scale(10),
                                backgroundColor: 'white',
                                borderWidth: scale(3),
                                borderColor: '#e5293e',
                            }}
                            inactiveDotStyle={{
                                width: scale(10),
                                height: scale(10),
                                borderRadius: scale(10),
                                backgroundColor: '#cccccc',
                                borderWidth: 0,
                            }}
                            inactiveDotScale={1}
                        />
                    </View>
                    <View style={{...styles.viewInner}}>
                        <TouchableOpacity
                            style={{...styles.viewInviteArea, marginTop: dataList.actor_of_month.length <= 1 ? scale(15) : 0}}
                            onPress={() => setModalInvite(true)}
                        >
                            <Text style={{...styles.txtInviteLabel}}>
                                친구초대하고 <Text style={{color: '#e5293e', fontWeight: 'bold'}}>50원</Text>
                                <Text style={{fontWeight: 'bold'}}>받기!</Text>
                            </Text>
                            <FastImage
                                source={require('../../../../assets/images/drawable-xxxhdpi/coin.png')}
                                style={{width: scale(25), height: scale(25)}}
                            />
                        </TouchableOpacity>
                        {
                            !isEmptyArr(dataList.popular) && (
                                <View style={{...styles.viewAuditionArea}}>
                                    <Text style={{...styles.txtLabel}}>인기 오디션</Text>
                                    <TouchableOpacity onPress={() => props.navigation.navigate('AuditionStack')}>
                                        <Text style={{...styles.txtViewMore}}>{'View More >'}</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        {
                            dataList.popular.map((item, index) => (
                                <TouchableOpacity
                                    style={{...styles.viewAuditionCard}}
                                    key={`popAuditionCard_${index}`}
                                    onPress={() =>
                                        props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})
                                    }
                                >
                                    <View
                                        style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(5),paddingRight: scale(10),}}
                                    >
                                        <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
                                            <FastImage
                                                source={
                                                    item.d_day <= 7
                                                    ? require('../../../../assets/images/drawable-xxxhdpi/flag.png')
                                                    : require('../../../../assets/images/drawable-xxxhdpi/flag_main.png')
                                                }
                                                style={{marginRight: scale(5),paddingLeft: scale(3),paddingRight: scale(10),}}
                                            >
                                                <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}}>{`D-${item.d_day}`}</Text>
                                            </FastImage>
                                            <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                                            <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                                        </View>
                                        <Icon 
                                            name={item.dibs_yn ? 'favorite' : 'favorite-border'} 
                                            color={item.dibs_yn ? '#e5293e' : '#999999'}
                                            size={scale(15)}
                                            containerStyle={{
                                                backgroundColor: 'white',
                                                borderRadius: scale(50),
                                                borderWidth: scale(1),
                                                borderColor: item.dibs_yn ? '#e5293e' : '#eeeeee',
                                                padding: scale(3),
                                            }}
                                            onPress={() => _onToggleLike(index, false, item.audition_no)}
                                        />
                                    </View>
                                    <View style={{paddingHorizontal: scale(10)}}>
                                        <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                                        <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                                        <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
                                        <TouchableOpacity
                                            style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(2),paddingHorizontal: scale(12),alignSelf: 'flex-end',}}
                                            onPress={() =>
                                                props.navigation.navigate('TabAuditionDetail', {
                                                    HEADER: item.category,
                                                    audition_no: item.audition_no,
                                                })
                                            }
                                        >
                                            <Text style={{color: 'white'}}>오디션보기</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                    <View style={{ backgroundColor: '#ffe0e4',marginBottom: scale(30),height: scale(100),justifyContent: 'center',alignItems: 'center',}}>
                        <Text style={{fontSize: scale(20), fontWeight: 'bold'}}>후즈픽 배우</Text>
                    </View>
                    <View style={{...styles.viewInner}}>
                        {
                            !isEmptyArr(dataList.deadline) && (
                                <View style={{...styles.viewAuditionArea}}>
                                    <Text style={{...styles.txtLabel}}>마감임박 오디션</Text>
                                    <TouchableOpacity onPress={() => props.navigation.navigate('AuditionStack')}>
                                        <Text style={{...styles.txtViewMore}}>{'View More >'}</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        {
                            dataList.deadline.map((item, index) => (
                                <TouchableOpacity
                                    style={{...styles.viewAuditionCard}}
                                    key={`deadLineAuditionCard_${index}`}
                                    onPress={() =>
                                        props.navigation.navigate('TabAuditionDetail', {HEADER: item.category, audition_no: item.audition_no})
                                    }
                                >
                                    <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: scale(5),paddingRight: scale(10),}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: scale(10)}}>
                                            <FastImage
                                                source={require('../../../../assets/images/drawable-xxxhdpi/flag.png')}
                                                style={{marginRight: scale(5),paddingLeft: scale(3),paddingRight: scale(10),}}
                                            >
                                                <Text style={{color: 'white', fontSize: scale(11), fontWeight: 'bold'}}>{`D-${item.d_day}`}</Text>
                                            </FastImage>
                                            <Text style={{fontSize: scale(12), color: '#e5293e'}}>{`[${item.category}] `}</Text>
                                            <Text style={{fontSize: scale(10), color: '#bababa'}}>{`${YYYYMMDDHHMM(item.reg_dt)}`}</Text>
                                        </View>
                                        <Icon
                                            name={item.dibs_yn ? 'favorite' : 'favorite-border'}
                                            color={item.dibs_yn ? '#e5293e' : '#99    9999'}
                                            size={scale(15)}
                                            containerStyle={{backgroundColor: 'white',borderRadius: scale(50),borderWidth: scale(1),borderColor: item.dibs_yn ? '#e5293e' : '#eeeeee',padding: scale(3),}}
                                            onPress={() => _onToggleLike(index, true, item.audition_no)}
                                        />
                                    </View>
                                    <View style={{paddingHorizontal: scale(10)}}>
                                        <Text style={{...styles.txtAuditionTitle}}>{item.title}</Text>
                                        <Text style={{...styles.txtAuditionSub}}>{`제작 : ${item.company}`}</Text>
                                        <Text style={{...styles.txtAuditionSub}}>{`배역 : ${item.cast_list.map(d => `${d}`)}`}</Text>
                                        <TouchableOpacity
                                            style={{borderRadius: scale(5),backgroundColor: '#e5293e',paddingVertical: scale(2),paddingHorizontal: scale(12),alignSelf: 'flex-end',}}
                                            onPress={() =>
                                                props.navigation.navigate('TabAuditionDetail', {
                                                    HEADER: item.category,
                                                    audition_no: item.audition_no,
                                                })
                                            }
                                        >
                                            <Text style={{color: 'white'}}>오디션보기</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </Animated.ScrollView>
            </SafeAreaView>
            <Modal
                isVisible={modalInvite}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                statusBarTranslucent={true}
                avoidKeyboard={true}
            >
                <View style={{...styles.viewModalContainer}}>
                    <Icon
                        name={'close'}
                        size={scale(25)}
                        color="#707070"
                        containerStyle={{alignItems: 'flex-end'}}
                        onPress={() => _isFirstTimeOpenDone()}
                    />
                    <FastImage
                        source={require('../../../../assets/images/drawable-xxxhdpi/coin.png')}
                        style={{height: scale(40), marginVertical: scale(15)}}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <Text style={{...styles.txtModalLabel}}>친구초대하고 50원 받기!</Text>
                    <Text style={{...styles.txtModalSubLabel, marginTop: scale(10)}}>친구가 내 추천인코드로 가입하면</Text>
                    <Text style={{...styles.txtModalSubLabel, marginBottom: scale(10)}}>50원을 받을 수 있습니다!</Text>
                    <View style={{...styles.viewModalCodeArea}}>
                        <Text style={{...styles.txtModalCodeLabel}}>내 추천인 코드</Text>
                        <Text style={{...styles.txtModalCode}}>{`${userCode}`}</Text>
                    </View>
                    <View style={{...styles.viewInviteBtnArea}}>
                        <TouchableOpacity
                            style={{...styles.viewInviteBtn}}
                            onPress={() => {
                                const shareOptions = {
                                    title: '[후즈픽] 추천인 코드 공유',
                                    message: `[후즈픽] 추천인 코드 공유\n\n코드 : ${userCode}`,
                                };
                                Share.open(shareOptions)
                                .then(res => {
                                    console.log(res);
                                })
                                .catch(err => {
                                    err && console.log(err);
                                });
                            }}
                        >
                            <FastImage
                                source={require('../../../../assets/images/drawable-xxxhdpi/kaka_logo.png')}
                                style={{width: scale(20), height: scale(20)}}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{...styles.viewInviteBtn}}
                            onPress={() => {
                                Clipboard.setString(`[후즈픽] 추천인 코드 공유\n\n코드 : ${userCode}`);
                                Toast.showWithGravity('클립보드에 복사되었습니다.', Toast.SHORT, Toast.CENTER);
                            }}
                        >
                            <Icon name="link" type="entypo" size={scale(25)} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{marginBottom: scale(20)}} onPress={() => _isFirstTimeOpenDone()}>
                        <Text style={{fontSize: scale(12),color: '#7d7d7d',fontWeight: '500',textDecorationLine: 'underline',textAlign: 'center',}}>다음에할게요</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default AppMain;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderRadius: scale(15),
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },
    viewActorInfo: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: scale(5),
        paddingHorizontal: scale(15),
        paddingVertical: scale(15),
        bottom: scale(15),
        width: '90%',
        height: '30%',
        alignSelf: 'center',
        justifyContent: 'space-between',
    },
    txtActorName: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#222222',
    },
    txtActorDesc: {
        fontSize: scale(10),
        color: '#222222',
    },
    viewActorPrivate: {
        flexDirection: 'row',
    },
    txtActorPrivate: {
        fontSize: scale(10),
        color: '#e5293e',
    },
    viewInner: {
        paddingHorizontal: scale(20),
        paddingBottom: scale(20),
        backgroundColor: 'white',
    },
    viewInviteArea: {
        borderRadius: scale(25),
        borderColor: '#dddddd',
        borderWidth: scale(1.5),
        paddingVertical: scale(10),
        paddingHorizontal: scale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(30),
    },
    txtInviteLabel: {
        fontSize: scale(14),
    },
    txtLabel: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#e5293e',
    },
    viewAuditionArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(20),
    },
    txtViewMore: {
        fontSize: scale(10),
        color: '#ababab',
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
    viewModalContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: scale(5),
        padding: scale(15),
    },
    txtModalLabel: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#e5293e',
        textAlign: 'center',
    },
    txtModalSubLabel: {
        fontSize: scale(10),
        color: '#7d7d7d',
        textAlign: 'center',
    },
    viewModalCodeArea: {
        borderRadius: scale(5),
        backgroundColor: 'white',
        borderColor: '#707070',
        paddingVertical: scale(25),
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: scale(20),
    },
    txtModalCodeLabel: {
        fontSize: scale(14),
        fontWeight: '500',
    },
    txtModalCode: {
        fontSize: scale(25),
        fontWeight: 'bold',
    },
    viewInviteBtnArea: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: scale(30),
    },
    viewInviteBtn: {
        width: scale(45),
        height: scale(45),
        backgroundColor: 'white',
        borderColor: '#dddddd',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: scale(50),
        justifyContent: 'center',
        alignItems: 'center',
    },
});