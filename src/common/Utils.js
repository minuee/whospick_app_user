import {Dimensions, Platform} from 'react-native';
import {apiObject} from './API';

export const screenWidth = Math.round(Dimensions.get('window').width);
export const screenHeight = Math.round(Dimensions.get('window').height);
export const logging = async (error, desc) => {
    try {
        await apiObject.logging({
            error: error,
            desc: desc,
        });
    } catch (e) {
        console.log('🚀 _logging ~ e', e);
    }
};

export const isIOS = () => {
    return Platform.OS === 'ios';
};

export const AddComma = num => {
    let regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
};

export const getWeekCnt = (startDate, endDate) => {
    const day = 1000 * 60 * 60 * 24;
    const week = day * 7;
    return parseInt((endDate - startDate) / week, 10);
};

// '', null, undefinded, 빈객체{} 체크
export const isEmpty = str => {
    return (
        str === null ||
        str === undefined ||
        str === '' ||
        (typeof str === 'object' && Array.isArray(str) === false && Object.keys(str).length === 0)
    );
};

export const isEmptyArr = arr => {
    return Array.isArray(arr) && arr.length === 0;
};

export const changeTime = timestamp => {
    const tmpTime = new Date(timestamp * 1000);
    const timeNow = new Date();

    let hour =
    tmpTime.getHours() > 12
    ? `오후 ${tmpTime.getHours() - 12}`
    : tmpTime.getHours() === 0
    ? '오전 12'
    : `오전 ${tmpTime.getHours()}`;
    let minute = tmpTime.getMinutes().toString().length === 1 ? `0${tmpTime.getMinutes()}` : tmpTime.getMinutes();

    if (
        tmpTime.getFullYear() === timeNow.getFullYear() &&
        tmpTime.getMonth() + 1 === timeNow.getMonth() + 1 &&
        tmpTime.getDate() === timeNow.getDate()
    ) {
        return `${hour}:${minute}`;
    } else if (tmpTime.getFullYear() === timeNow.getFullYear() && tmpTime.getMonth() + 1 === timeNow.getMonth() + 1) {
        return `${tmpTime.getMonth() + 1}월 ${tmpTime.getDate()}일`;
    } else {
        return `${tmpTime.getFullYear()}. ${tmpTime.getMonth() + 1}. ${tmpTime.getDate()}`;
    }
};

export const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 10;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

export const timeForToday = value => {
    const today = new Date();
    const timeValue = new Date(value * 1000);

    const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
    if (betweenTime < 1) {
        return '방금전';
    }
    if (betweenTime < 60) {
        return `${betweenTime}분전`;
    }

    const betweenTimeHour = Math.floor(betweenTime / 60);
        if (betweenTimeHour < 24) {
            return `${betweenTimeHour}시간전`;
        }
    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    // if (betweenTimeDay < 365) {
    //   return `${betweenTimeDay}일전`;
    // }
    if (betweenTimeDay === 1) {
        return '어저께';
    }
    if (betweenTimeDay === 2) {
        return '그저께';
    }

    // return `${Math.floor(betweenTimeDay / 365)}년전`;
    return `${timeValue.getFullYear()}. ${timeValue.getMonth() + 1}. ${timeValue.getDate()}`;
};

export const YYYYMMDDHHMM = timestamp => {
    const timeValue = new Date(timestamp * 1000);
    return `${timeValue.getFullYear()}. ${timeValue.getMonth() + 1}. ${timeValue.getDate()}`;
};

export const getAge = birthDay => {
    const today = new Date();
    const birthDate = new Date(birthDay * 1000);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const _chkEmail = text => {
    if (/^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/.test(text) && text !== '') {
        return true;
    } else {
        return false;
    }
};
export const _chkPwd = text => {
    if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()_+|<>?:{}`~=.,^/])[A-Za-z\d~!@#$%^&*()_+|<>?:{}`~=.,^/]{8,16}$/.test(text) && text !== '' ) {
        return true;
    } else {
        return false;
    }
};

export const _chkPhone = text => {
    if (/(01[016789])([1-9]{1}[0-9]{2,3})([0-9]{4})$/.test(text) && text !== '') {
        return true;
    } else {
        return false;
    }
};

export const replaceEmail = text => {
    let result = String(text).replace('naver_', '');
    result = String(result).replace('apple_', '');
    result = String(result).replace('google_', '');
    result = String(result).replace('kakao_', '');

    return result;
};

export const isSNS = text => {
    return (
        String(text).includes('naver_') ||
        String(text).includes('apple_') ||
        String(text).includes('google_') ||
        String(text).includes('kakao_')
    );
};
