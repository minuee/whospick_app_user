import {Dimensions, PixelRatio} from 'react-native';
const {width, height} = Dimensions.get('window');
const dimensions = width < height ? width : height;

const guidelineBaseWidth = 360;

const scale = size => {
  return PixelRatio.roundToNearestPixel((dimensions / guidelineBaseWidth) * size);
};

export default scale;
