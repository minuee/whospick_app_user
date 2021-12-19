import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import scale from '../../../common/Scale';
import {apiObject} from '../../../common/API';
import {isEmpty, logging} from '../../../common/Utils';

import {Header} from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import LoadingIndicator from '../../../Component/LoadingIndicator';
import LoadingContext from '../../../Context/LoadingContext';

const FAQ = props => {
    const {isLoading, setIsLoading} = useContext(LoadingContext);
    const [dataList, setDataList] = useState({
        cateList: [],
        faqList: [],
    });
    const [inputText, setInputText] = useState('');
    const [cateIndex, setCateIndex] = useState(null);
    const [opendIndex, setOpendIndex] = useState(null);

    const _getFAQCate = async () => {
        try {
            const apiResult = await apiObject.getFAQCate(loading => setIsLoading(loading));
            setDataList({...dataList, cateList: apiResult.list});
        } catch (error) {            
            logging(error.response?.data, 'cdn/faq-types');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };
    const _getFAQList = async (faq_category_no, index) => {
        try {
            const apiResult = await apiObject.getFAQList({
                faq_category_no: isEmpty(faq_category_no) ? '' : faq_category_no,
                search_text: inputText,
            });
            setCateIndex(index);
            setDataList({...dataList, faqList: apiResult.list});
            setOpendIndex(null);
        } catch (error) {
            logging(error.response?.data, 'faq-list/...');
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
        }
    };

    useEffect(() => {
        _getFAQCate();
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
                centerComponent={{text: 'FAQ', style: {fontSize: scale(18), color: 'white', fontWeight: 'bold'}}}
                containerStyle={{borderBottomWidth: 0}}
            />
            <View style={{...styles.viewInputArea}}>
                <TextInput
                    style={{fontSize: scale(14),borderRadius: scale(3.5),backgroundColor: 'white',paddingHorizontal: scale(15),paddingVertical: scale(10),}}
                    placeholder="궁금하신 내용을 검색해주세요."
                    value={inputText}
                    padding={0}
                    onChangeText={text => setInputText(text)}
                    returnKeyType="search"
                    onSubmitEditing={() => _getFAQList()}
                />
            </View>
            <SafeAreaView style={{...styles.contents}}>
                <ScrollView>
                    <View style={{...styles.viewCateArea}}>
                        <View style={{...styles.viewCateRow}}>
                            {
                                dataList.cateList.map((item, index) => (
                                    <TouchableOpacity
                                        key={`cateBtn_${index}`}
                                        style={{...styles.viewCateBtn, ...(cateIndex === index ? {backgroundColor: '#eeeeee'} : null)}}
                                        onPress={() => _getFAQList(item.faq_category_no, index)}
                                    >
                                        <Text style={{...styles.txtCateBtn}}>{item.content}</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    </View>
                    <View style={{...styles.viewFAQArea}}>
                        <Text style={{...styles.txtLabel}}>사용자들이 자주 묻는 질문을 확인해보세요.</Text>
                        {
                            dataList.faqList.map((item, index) => (
                                <TouchableOpacity
                                    key={`faqList_${index}`}
                                    style={{...styles.viewFaqBtn}}
                                    onPress={() => setOpendIndex(opendIndex === index ? null : index)}
                                >
                                    <Text style={{...styles.txtCateBtn}}>{`Q. ${item.question}`}</Text>
                                    <View style={{paddingTop: opendIndex === index ? scale(20) : null}}>
                                        {
                                            opendIndex === index && (
                                            <View>
                                                <Text style={{fontSize: scale(12)}}>{`A. ${item.answer}`}</Text>
                                            </View>
                                            )
                                        }
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </ScrollView>
            </SafeAreaView>
            {isLoading && <LoadingIndicator />}
        </View>
    );
};

export default FAQ;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contents: {
        flex: 1,
    },
    viewInputArea: {
        padding: scale(15),
        backgroundColor: '#e5293e',
    },
    viewCateArea: {
        borderBottomWidth: scale(5),
    borderColor: '#eeeeee',
    },
    viewCateRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    viewCateBtn: {
        width: '33.33%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(15),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#dddddd',
    },
    txtCateBtn: {
        fontSize: scale(12),
    color: '#707070',
    },
    viewFAQArea: {
        padding: scale(15),
    },
    txtLabel: {
        fontSize: scale(10),
        color: '#999999',
    },
    viewFaqBtn: {
        paddingVertical: scale(15),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#dddddd',
    },
});