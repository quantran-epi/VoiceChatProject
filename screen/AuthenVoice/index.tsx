import { Button, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState, useCallback, useEffect } from 'react';
var axios = require('axios');
import VoiceScreen from './VoiceScreen';
import { useRef } from "react";
import useAppContext from "../app-context/useAppContext";
import { uuidv4 } from "../../util";
import GlobalDataHelper from "../helpers/GlobalDataHelper";
import StringeeChat from "../Chat/StringeeChat";
var RNFS = require('react-native-fs');

type TypePamrams = {
    id: number,
    url: string
}

const AuthenVoiceScreen = ({ route, navigation }) => {
    const [token, setToken] = useState("")
    const [disableButton, setDisableButton] = useState(false)
    const [disableBtnAddVoice, setDisableBtnAddVoice] = useState(false)
    const [visible, setVisible] = useState(false);
    const [textUser, settextUser] = useState("shbbank");
    const [textPass, settextPass] = useState("51el9#2TilXO");
    const { context } = useAppContext({});
    const [ip, setIp] = useState("http://13.214.25.203:7001");

    const eventHandlers = useRef({
        onConnect: () => { },
        onDisConnect: () => { },
        onFailWithError: () => { },
        onRequestAccessToken: () => { },
        onCustomMessage: () => { },
        onObjectChange: () => { },
        onTimeoutInQueue: () => { },
        onConversationEnded: () => { },
        onUserBeginTyping: () => { },
        onUserEndTyping: () => { },
    })

    useEffect(() => {
        _initData();
    }, [])

    const _initData = async () => {
        let ip = await GlobalDataHelper.getIp();
        if (ip) setIp(ip);
    }

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

    const getConfig = (url, data) => {
        return {
            method: 'post',
            url: 'https://api-services.nextg.team/api/v1/' + url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
    }

    const getToken = async () => {
        await GlobalDataHelper.saveIp(ip);
        context.changeUuid(uuidv4());
        setDisableButton(true)
        await axios(getConfig("auth/login", {
            "username": textUser,
            "password": textPass
        }))
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                const data = response.data
                setToken(data.access_token)
                navigation.navigate("AddVoice", {
                    token: data.access_token
                })
                // navigation.navigate("Home", {
                //     token: data.access_token
                // })
                setTimeout(() => {
                    setDisableButton(false)
                }, 700);
            })
            .catch(function (error) {
                console.log(error);
            });
    }


    return (
        <>
            {/* <View style={{
                backgroundColor: 'white',
                elevation: 3,
                height: 55,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                justifyContent: 'center'
            }}>
                <Image
                    source={require('../Demo/image_back.png')}
                    style={{
                        width: 25,
                        height: 25
                    }}
                />

                <Text style={{
                    fontWeight: '700',
                    fontSize: 18,
                    marginLeft: 8
                }}>{"Login"}</Text>
            </View> */}
            <View style={{
                justifyContent: 'center',
                backgroundColor: "white",
                flex: 1
            }}>

                <StringeeChat />
                <View style={styles.logo}>
                    <Image style={{
                        width: 220,
                        height: 220
                    }} source={require("../Demo/logo.jpeg")} />
                </View>
                <View style={styles.formControl}>
                    <Text style={styles.formLabel}>Tên đăng nhập</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={settextUser}
                        value={textUser}
                        placeholder="Tên đăng nhập"
                    />
                </View>
                <View style={styles.formControl}>
                    <Text style={styles.formLabel}>Mật khẩu</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={settextPass}
                        value={textPass}
                        placeholder="Mật khẩu"
                    />
                </View>
                <View style={styles.formControl}>
                    <Text style={styles.formLabel}>Địa chỉ IP</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setIp}
                        value={ip}
                        placeholder="Địa chỉ IP"
                    />
                </View>

                <TouchableOpacity
                    onPress={getToken}
                    disabled={disableButton}
                    style={styles.viewStyles}
                >
                    <Text style={{ color: 'white' }}>{disableButton ? "Vui lòng chờ" : "Lấy token"}</Text>
                </TouchableOpacity>
            </View>
        </>

    );
};

const styles = StyleSheet.create({
    viewButtonAdd: {
        backgroundColor: "#0066ff",
        alignSelf: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        flex: 1, marginHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    viewStyles: {
        backgroundColor: "#0066ff",
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20
    },
    styleImage: {
        width: 20, height: 20, tintColor: "blue",
        marginLeft: 12
    },
    styleImage1: {
        width: 20, height: 20,
    },
    input: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#f5f5f5"
    },
    formControl: {
        paddingHorizontal: 24,
        paddingVertical: 5
    },
    formLabel: {
        fontWeight: "bold",
        marginVertical: 7,
        color: "rgba(0, 0, 0, 0.6)"
    },
    logo: {
        justifyContent: "center",
        alignItems: "center"
    }
})

export default AuthenVoiceScreen