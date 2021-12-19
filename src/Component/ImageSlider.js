import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity} from 'react-native';

import scale from '../common/Scale';
import {screenWidth} from '../common/Utils';

import {Badge} from 'react-native-elements';
import FastImage from 'react-native-fast-image';

import PropTypes from 'prop-types';

const ImageSlider = ({images, imageBoxSize, activeBadgeColor, autoSlide, pressList}) => {
    const refImageSlide = useRef(null);
    const [pageIndex, setPageIndex] = useState(0);
    useEffect(() => {
        let autoSlideInterval;
        let index = 0;
        const _autoSlide = () => {
            refImageSlide.current.scrollTo({x: screenWidth * index, animated: true});
            setPageIndex(index);
            index++;
            if (index === images.length) {
                index = 0;
            }
        };
        if (autoSlide) {
            autoSlideInterval = setInterval(_autoSlide, 3000);
        }
        return () => {
            clearInterval(autoSlideInterval);
        };
    }, [autoSlide, images]);

    return (
        <View style={{...styles.container}}>
            <ScrollView
                ref={refImageSlide}
                bounces={false}
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={({nativeEvent}) => setPageIndex(Math.round(nativeEvent.contentOffset.x / screenWidth))}
                scrollEventThrottle={16}>
                {
                    images.map((item, index) => {
                    return (
                        <TouchableOpacity key={`imgSlider_${index}`} onPress={pressList[index]} activeOpacity={1}>
                            <FastImage
                                source={{uri: item}}    
                                style={{...styles.bgImg, height: imageBoxSize}}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        </TouchableOpacity>
                    );
                    })
                }
            </ScrollView>
            <View style={{...styles.viewBadge}}>
                {
                    images.map((item, index) => (
                        <Badge
                            key={`imgSliderPage_${index}`}
                            badgeStyle={{
                                backgroundColor: pageIndex === index ? activeBadgeColor : '#cccccc',
                                borderWidth: pageIndex === index ? scale(2) : null,
                                borderColor: pageIndex === index ? '#e5293e' : 'white',
                                width: scale(10),
                                height: scale(10),
                                borderRadius: scale(50),
                            }}
                            containerStyle={{marginHorizontal: scale(2)}}
                        />
                    ))
                }
            </View>
        </View>
    );
};

export default ImageSlider;

ImageSlider.propTypes = {
    imageBoxSize: PropTypes.number,
    activeBadgeColor: PropTypes.string,
    images: PropTypes.array.isRequired,
    autoSlide: PropTypes.bool,
    pressList: PropTypes.array,
};

ImageSlider.defaultProps = {
    imageBoxSize: 600,
    activeBadgeColor: 'transparent',
    autoSlide: false,
    pressList: [],
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
    },
    bgImg: {
        width: screenWidth,
    },
    viewBadge: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: scale(10),
        position: 'absolute',
        bottom: scale(70),
        alignSelf: 'center',
    },  
});