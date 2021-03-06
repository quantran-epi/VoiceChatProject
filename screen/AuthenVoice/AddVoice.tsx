import { Button, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState, useCallback, useEffect } from 'react';
var axios = require('axios');
import VoiceScreen from './VoiceScreen';
import { useRef } from "react";
var RNFS = require('react-native-fs');
import AsyncStorage from '@react-native-community/async-storage'
import PagerView from 'react-native-pager-view';
import { Dimensions } from "react-native";
import BaseView from "../BaseView";

type TypePamrams = {
    id: number,
    url: string
}

interface AddVoiceResult {
    url: string;
    success: boolean;
    error?: string
}

interface VerifyVoiceResult {
    url: string;
    success: boolean;
    error?: string
}

const STORAGE_KEY = "STORAGE_KEY_SAVE"

const AuthenVoiceScreen = ({ route, navigation }) => {
    const { token } = route.params; console.log("token", token);
    const [disableBtnAddVoice, setDisableBtnAddVoice] = useState(false);
    const [visible, setVisible] = useState(false);
    const [verifyVoiceModalVisible, setVerifyVoiceModalVisible] = useState(false);
    const [idVoice, setIdVoice] = useState();
    const [btnVerifyVoiceEnable, setBtnVerifyVoiceEnable] = useState(true);
    const [_pagerIndex, _setPagerIndex] = useState(0);
    const pagerRef = useRef(null);
    const [_encodeKey, _setEncodeKey] = useState();
    const [_addVoiceResults, _setAddVoiceResults] = useState<AddVoiceResult[]>([]);
    const [_verifyVoiceResults, _setVerifyVoiceResults] = useState<VerifyVoiceResult[]>([]);
    const [addVoiceResultModalVisible, setAddVoiceResultModalVisible] = useState<boolean>(false);
    const [verifyVoiceResultModalVisible, setVerifyVoiceResultModalVisible] = useState<boolean>(false);
    const [addingVoice, setAddingVoice] = useState<boolean>(false);
    const [verifyingVoice, setVerifyingVoice] = useState<boolean>(false);

    const type = useRef(1)
    const dataParams = useRef<TypePamrams[]>([{
        id: 1,
        url: ""
    },
    {
        id: 2,
        url: ""
    },
    {
        id: 3,
        url: ""
    }])

    useEffect(() => {
        saveData("61c293a6087ed0be55d43e8b")
    }, [])

    const hideModel = () => {
        setVisible(false)
    }

    const hideVerifyVoiceModal = () => {
        setVerifyVoiceModalVisible(false);
    }

    const showVerifyVoiceModal = () => {
        setVerifyVoiceModalVisible(true);
    }

    const verifyVoice = () => {
        if (!idVoice && !_encodeKey) {
            alert('Vui l??ng th??m voice tr?????c khi x??c th???c');
            return;
        }
        showVerifyVoiceModal();
    }

    const onVerify = async (type, result) => {
        setVerifyingVoice(true);
        let verifyFptResult = await verifyFpt(type, result);
        let verifyVioneResult = await verifyVione(type, result);
        setVerifyingVoice(false);
        let results: VerifyVoiceResult[] = [];
        results.push(verifyFptResult);
        results.push(verifyVioneResult);
        _setVerifyVoiceResults(results);
        setVerifyVoiceResultModalVisible(true);
    }

    const verifyFpt = async (type, result): Promise<VerifyVoiceResult | undefined> => {
        setBtnVerifyVoiceEnable(false);
        const base64 = await RNFS.readFile(result, 'base64');
        const params = { 'audio': base64, 'id': idVoice + "" }; console.log("VERIFY PARAMS", params);
        var configV = {
            method: 'post',
            url: 'https://api-services.nextg.team/api/v1/voices/verify',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: params
        };
        console.log(axios(configV));

        try {
            let response = await axios(configV);
            hideVerifyVoiceModal();
            if (response.data && response.data.pass) {
                return {
                    url: "Service A",
                    success: true
                }
            } else {
                return {
                    url: "Service A",
                    success: false,
                    error: response.data.reason
                }
            }
        } catch (error) {
            return {
                url: "Service A",
                success: false,
                error: error
            }
        }
        finally {
            setBtnVerifyVoiceEnable(true);
        }
    }

    const verifyVione = async (type, result): Promise<VerifyVoiceResult | undefined> => {
        // setBtnVerifyVoiceEnable(false);
        // const base64 = await RNFS.readFile(result, 'base64');
        // const params = { 'audio': base64, 'id': idVoice + "" }; console.log("params", params);
        const body = new FormData();
        body.append("encode_key", _encodeKey);
        body.append('audios', {
            uri: result,
            name: "bse64_1.wav",
            type: "audio/wav"
        } as any);
        var configV = {
            method: 'post',
            url: 'https://sre.vais.vn/api/sre/verify/check',
            headers: {
                "api-key": "9935ddac-6f8e-11ec-9405-0242ac120008",
                'Content-Type': 'multipart/form-data'
            },
            data: body
        };

        try {
            let response = await axios(configV);
            hideVerifyVoiceModal();
            if (response.data && response.data.pass) {
                return {
                    url: "Service B",
                    success: true
                }
            } else {
                return {
                    url: "Service B",
                    success: false,
                    error: response.data.reason
                }
            }
        } catch (error) {
            return {
                url: "Service B",
                success: false,
                error: error
            }
        }
    }

    const addVoice = async (): Promise<AddVoiceResult | undefined> => {
        if (dataParams.current[0].url && dataParams.current[1].url
            && dataParams.current[2].url) {
            setDisableBtnAddVoice(true)
            const base64_1 = await RNFS.readFile(dataParams.current[0].url, 'base64')
            const base64_2 = await RNFS.readFile(dataParams.current[1].url, 'base64')
            const base64_3 = await RNFS.readFile(dataParams.current[2].url, 'base64')
            // const params = { 'audios': [base64_1, base64_2, base64_3], 'code': (new Date()).getTime(), 'name': 'shbbank' }
            const params = { 'audios': [base64_1, base64_2, base64_3], 'code': ((new Date()).getTime()) + "", 'name': 'shbbank' }; console.log("ADD VOICE PARAMS", params);
            var config = {
                method: 'post',
                url: 'https://api-services.nextg.team/api/v1/voices',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: params
            };

            try {
                let response = await axios(config);
                const data = response.data; console.log('add voice success');
                if (data.status == "ACTIVE") {
                    setIdVoice(data.id);
                    // navigation.navigate("Home", {
                    //     idVoice: data.id,
                    //     token: token
                    // })
                    return {
                        url: "Service A",
                        success: true
                    }
                } else {
                    return {
                        url: "Service A",
                        success: false
                    }
                }
            } catch (error) {
                console.log('add voice error');
                return {
                    url: "Service A",
                    success: false,
                    error: error
                }
            }
            finally {
                setDisableBtnAddVoice(false);
            }
        } else {
            alert("B???n c???n t???o ?????y ????? 3 voice")
        }

    }

    const addVoiceVione = async (): Promise<AddVoiceResult | undefined> => {
        if (dataParams.current[0].url && dataParams.current[1].url
            && dataParams.current[2].url) {
            setDisableBtnAddVoice(true)
            const body = new FormData();
            body.append('audios', {
                uri: dataParams.current[0].url,
                name: "bse64_1.wav",
                type: "audio/wav"
            } as any);
            body.append('audios', {
                uri: dataParams.current[1].url,
                name: "bse64_2.wav",
                type: "audio/wav"
            } as any);
            body.append('audios', {
                uri: dataParams.current[2].url,
                name: "bse64_3.wav",
                type: "audio/wav"
            } as any);
            var config = {
                method: 'post',
                url: 'https://sre.vais.vn/api/sre/verify/extract',
                headers: {
                    "api-key": "9935ddac-6f8e-11ec-9405-0242ac120008",
                    'Content-Type': 'multipart/form-data'
                },
                data: body
            };

            try {
                let response = await axios(config);
                const data = response.data.data
                if (data.encode_key) {
                    _setEncodeKey(data.encode_key);
                    return {
                        url: "Service B",
                        success: true
                    }
                }
                else {
                    return {
                        url: "Service B",
                        success: false
                    }
                }
            } catch (error) {
                return {
                    url: "Service B",
                    success: false,
                    error: error
                }
            }
            finally {
                setDisableBtnAddVoice(false);
            }
        } else {
            alert("B???n c???n t???o ?????y ????? 3 voice");
            return;
        }
    }

    const _hasVoiceAdded = (): boolean => {
        return idVoice || _encodeKey;
    }

    const saveData = async (text: string) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, text)
        } catch (e) {
        }
    }

    const readData = async (): Promise<string> => {
        try {
            const userAge = await AsyncStorage.getItem(STORAGE_KEY)

            return userAge
        } catch (e) {
            alert('Failed to fetch the data from storage')
        }
        return ""
    }

    const onPressUrlVoice = (type, result) => {
        if (pagerRef && pagerRef.current) {
            _setPagerIndex(_pagerIndex + 1);
            pagerRef.current.setPage(_pagerIndex + 1);
        }

        dataParams.current.map((item) => {
            if (item.id == type) {
                item.url = result
            }
        })

        if (_pagerIndex === 2) onAddVoice();
    }

    const onPressNext = async () => {
        const id = await readData()
        if (id) {
            navigation.navigate("Home", {
                idVoice: id,
                token: token
            })
        } else {
            alert("B???n ch??a c?? id")
        }
    }

    const onAddVoice = async () => {
        setAddingVoice(true);
        let fptResult = await addVoice();
        let vioneResult = await addVoiceVione();
        setAddingVoice(false);
        let results: AddVoiceResult[] = [];
        results.push(fptResult);
        results.push(vioneResult);
        _setAddVoiceResults(results);
        setAddVoiceResultModalVisible(true);
    }

    return (
        <BaseView loading={addingVoice || verifyingVoice}>
            <View style={{
                backgroundColor: 'white',
                elevation: 2,
                height: 55,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12
            }}>
                <TouchableOpacity onPress={() => {
                    navigation.goBack()
                }}>
                    <Image
                        source={require('../Demo/image_back.png')}
                        style={{
                            width: 25,
                            height: 25
                        }}
                    />
                </TouchableOpacity>

                <Text style={{
                    fontSize: 18,
                    marginLeft: 8
                }}>{"X??c th???c gi???ng n??i"}</Text>

                <TouchableOpacity
                    onPress={onPressNext}
                    style={{
                        marginLeft: "auto"
                    }}
                >
                    <Text style={{ fontWeight: "bold" }}>{"B??? qua"}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.addVoiceContainer}>

                {!_hasVoiceAdded() ? <Text style={{
                    marginHorizontal: 35,
                    alignSelf: 'center',
                    textAlign: 'center',
                    marginTop: 50,
                    fontSize: 18,
                }}>{"N??i 1 c??u b???t k??? kho???ng 5s"}</Text> :
                    <Text style={{
                        marginHorizontal: 35,
                        alignSelf: 'center',
                        textAlign: 'center',
                        marginTop: 50,
                        fontSize: 18,
                    }}>{"X??c th???c gi???ng n??i"}</Text>}

                {!_hasVoiceAdded() && <PagerView style={styles.pagerView} initialPage={0} ref={pagerRef} scrollEnabled={false}>
                    <View key="1" style={styles.addVoicePage}>
                        <TouchableOpacity
                            onPress={() => {
                                type.current = 1
                                setVisible(true)
                            }}
                            style={{
                                ...styles.addVoiceStepButton,
                                backgroundColor: dataParams.current[0].url ? "#4ADE7B" : "#0066ff"
                            }}
                        >
                            <Image
                                style={styles.styleImage1}
                                source={dataParams.current[0].url ? require("../Demo/check-mark.png") : require("../Demo/speaker-lg.png")}
                            />
                            {/* {dataParams.current[0].url ? <Image
                                style={styles.styleImage}
                                source={require("../Demo/icon_tick.png")}
                            /> : null} */}
                        </TouchableOpacity>
                        {dataParams.current[0].url ? <Text style={styles.addVoiceMessageSuccess}>L???n th??? nh???t</Text> :
                            <Text style={styles.addVoiceMessage}>L???n th??? nh???t</Text>}
                    </View>
                    <View key="2" style={styles.addVoicePage}>
                        <TouchableOpacity
                            onPress={() => {
                                type.current = 2
                                setVisible(true)
                            }}
                            style={{
                                ...styles.addVoiceStepButton,
                                backgroundColor: dataParams.current && dataParams.current[1] && dataParams.current[1].url ? "#4ADE7B" : "#0066ff"
                            }}
                        >
                            <Image
                                style={styles.styleImage1}
                                source={dataParams.current && dataParams.current[1] && dataParams.current[1].url ? require("../Demo/check-mark.png") : require("../Demo/speaker-lg.png")}
                            />
                            {/* {dataParams.current && dataParams.current[1] && dataParams.current[1].url ? <Image
                                style={styles.styleImage}
                                source={require("../Demo/icon_tick.png")}
                            /> : null} */}
                        </TouchableOpacity>
                        {dataParams.current && dataParams.current[1] && dataParams.current[1].url
                            ? <Text style={styles.addVoiceMessageSuccess}>L???n th??? hai</Text> :
                            <Text style={styles.addVoiceMessage}>L???n th??? hai</Text>}
                    </View>
                    <View key="3" style={styles.addVoicePage}>
                        <TouchableOpacity
                            onPress={() => {
                                type.current = 3
                                setVisible(true)
                            }}
                            style={{
                                ...styles.addVoiceStepButton,
                                backgroundColor: dataParams.current && dataParams.current[2] && dataParams.current[2].url ? "#4ADE7B" : "#0066ff"
                            }}
                        >
                            <Image
                                style={styles.styleImage1}
                                source={dataParams.current && dataParams.current[2] && dataParams.current[2].url ? require("../Demo/check-mark.png") : require("../Demo/speaker-lg.png")}
                            />
                            {/* {dataParams.current && dataParams.current[2] && dataParams.current[2].url ? <Image
                                style={styles.styleImage}
                                source={require("../Demo/icon_tick.png")}
                            /> : null} */}
                        </TouchableOpacity>
                        {dataParams.current && dataParams.current[2] && dataParams.current[2].url
                            ? <Text style={styles.addVoiceMessageSuccess}>L???n th??? ba</Text> :
                            <Text style={styles.addVoiceMessage}>L???n th??? ba</Text>}
                    </View>
                </PagerView>}

                {/* <View style={{
                    flexDirection: 'row',
                    paddingHorizontal: 12,
                    justifyContent: "space-between"
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            type.current = 1
                            setVisible(true)
                        }}
                        style={styles.viewButtonAdd}
                    >
                        <Text style={{ color: 'white' }}>{"L???n 1"}</Text>
                        <Image
                        style={styles.styleImage1}
                        source={require("../Demo/image_voice.png")}
                    />
                        {dataParams.current[0].url ? <Image
                            style={styles.styleImage}
                            source={require("../Demo/icon_tick.png")}
                        /> : null}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            type.current = 2
                            setVisible(true)
                        }}
                        style={styles.viewButtonAdd}
                    >
                        <Text style={{ color: 'white' }}>{"L???n 2"}</Text>
                        {dataParams.current && dataParams.current[1] && dataParams.current[1].url ? <Image
                            style={styles.styleImage}
                            source={require("../Demo/icon_tick.png")}
                        /> : null}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            type.current = 3
                            setVisible(true)
                        }}
                        style={styles.viewButtonAdd}
                    >
                        <Text style={{ color: 'white' }}>{"L???n 3"}</Text>
                        {dataParams.current && dataParams.current[2] && dataParams.current[2].url ? <Image
                            style={styles.styleImage}
                            source={require("../Demo/icon_tick.png")}
                        /> : null}
                    </TouchableOpacity>
                </View> */}

                {_hasVoiceAdded() && <View style={{
                    paddingHorizontal: 12,
                    flexDirection: "row",
                    justifyContent: "center",
                    width: Dimensions.get('window').width,
                    paddingVertical: 30,
                }}>
                    <TouchableOpacity
                        onPress={verifyVoice}
                        style={styles.btnVerifyContainer}>
                        <View style={styles.btnVerify}>
                            <Image source={require("../Demo/microphone.png")} style={{ width: 35, height: 35, tintColor: "white" }} />
                        </View>
                        <Text style={{ fontWeight: "bold", color: "#000" }}>Gi???ng th???t</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={verifyVoice}
                        style={styles.btnVerifyContainer}>
                        <View style={styles.btnVerify}>
                            <Image source={require("../Demo/microphone.png")} style={{ width: 35, height: 35, tintColor: "white" }} />
                        </View>
                        <Text style={{ fontWeight: "bold" }}>Gi???ng gi???</Text>
                    </TouchableOpacity>
                </View>}

                <Modal transparent visible={visible} animationType={'fade'}>
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `rgba(0, 0, 0, ${0.6})`,
                    }}>

                        <VoiceScreen
                            onResultData={onPressUrlVoice}
                            hideModel={hideModel}
                            type={type.current}
                            token={token}
                        />
                    </View>
                </Modal>

                <Modal transparent visible={verifyVoiceModalVisible} animationType={'fade'}>
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `rgba(0, 0, 0, ${0.6})`,
                    }}>

                        <VoiceScreen
                            onResultData={onVerify}
                            hideModel={hideVerifyVoiceModal}
                            type={4}
                            token={token}
                        />
                    </View>
                </Modal>

                <Modal
                    transparent
                    visible={addVoiceResultModalVisible}
                    animationType={'fade'}
                    onRequestClose={() => setAddVoiceResultModalVisible(false)} >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `rgba(0, 0, 0, ${0.6})`,
                    }}>
                        <View style={styles.addVoiceResultModalContent}>
                            <Text style={styles.addVoiceResultModalTitle}>K???t qu??? th??m gi???ng n??i</Text>
                            {_addVoiceResults.map((e, i) =>
                                <Text key={i} style={styles.addVoiceModalResultItem}>
                                    <Text style={e.success ? styles.addVoiceResultMessageSuccess : styles.addVoiceResultMessageError}>
                                        {e.url}: {' '}
                                    </Text>
                                    {e.error ? <Text style={styles.addVoiceResultMessage}>{e.error?.toString()}</Text> :
                                        <Text style={styles.addVoiceResultMessageSuccess}>Th??nh c??ng</Text>}
                                </Text>)}
                            <TouchableOpacity
                                onPress={() => setAddVoiceResultModalVisible(false)}
                                style={{ ...styles.viewStyles, alignSelf: "flex-end" }}>
                                <Text style={{ color: 'white' }}>????ng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    transparent
                    visible={verifyVoiceResultModalVisible}
                    animationType={'fade'}
                    onRequestClose={() => setVerifyVoiceResultModalVisible(false)} >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `rgba(0, 0, 0, ${0.6})`,
                    }}>
                        <View style={styles.addVoiceResultModalContent}>
                            <Text style={styles.addVoiceResultModalTitle}>K???t qu??? x??c th???c</Text>
                            {_addVoiceResults.map((e, i) =>
                                <Text key={i} style={styles.addVoiceModalResultItem}>
                                    <Text style={e.success ? styles.addVoiceResultMessageSuccess : styles.addVoiceResultMessageError}>
                                        {e.url}: {' '}
                                    </Text>
                                    {e.error ? <Text style={styles.addVoiceResultMessage}>{e.error?.toString()}</Text> :
                                        <Text style={styles.addVoiceResultMessageSuccess}>Th??nh c??ng</Text>}
                                </Text>)}
                            <TouchableOpacity
                                onPress={() => setVerifyVoiceResultModalVisible(false)}
                                style={{ ...styles.viewStyles, alignSelf: "flex-end" }}>
                                <Text style={{ color: 'white' }}>????ng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </BaseView>
    );
};

const styles = StyleSheet.create({
    addVoiceStepButton: {
        borderRadius: 10000,
        backgroundColor: "#0066ff",
        padding: 20,
        width: 150,
        height: 150,
        justifyContent: "center",
        alignItems: "center"
    },
    viewButtonAdd: {
        width: "31%",
        backgroundColor: "#0066ff",
        alignSelf: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    viewStyles: {
        backgroundColor: "#0066ff",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 15,
        width: "100%"
    },
    styleImage: {
        width: 20, height: 20, tintColor: "white",
        marginLeft: 12
    },
    styleImage1: {
        width: 80, height: 80,
        tintColor: "white"
    },
    addVoiceContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255,255, 0.9)"
    },
    pagerView: {
        flex: 1,
        width: Dimensions.get('window').width,
    },
    addVoicePage: {
        alignItems: "center",
        justifyContent: "center"
    },
    addVoiceMessage: {
        marginTop: 20,
        fontWeight: "bold",
        fontSize: 24,
        color: "#0066ff"
    },
    addVoiceMessageSuccess: {
        marginTop: 20,
        fontWeight: "bold",
        fontSize: 24,
        color: "#4ADE7B"
    },
    addVoiceResultModalContent: {
        width: Dimensions.get('window').width * 0.9,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12
    },
    addVoiceResultModalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10
    },
    addVoiceModalResultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5
    },
    addVoiceResultMessageSuccess: {
        color: "#17c964"
    },
    addVoiceResultMessageError: {
        color: "#f21361"
    },
    addVoiceResultMessage: {
    },
    btnVerify: {
        backgroundColor: "#0066ff",
        borderRadius: 1000,
        alignItems: 'center',
        width: 80,
        height: 80,
        justifyContent: "center",
        marginVertical: 10,
        marginHorizontal: 20
    },
    btnVerifyContainer: {
        alignItems: "center"
    }
})

export default AuthenVoiceScreen