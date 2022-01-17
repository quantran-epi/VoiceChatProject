import { Button } from "react-native";
import React, { useState, useCallback, useEffect } from 'react';
import RNRasa from "./RNRasa";
import useAppContext from "../app-context/useAppContext";

const HomeScreen = ({ route, navigation }) => {
    const { idVoice, token } = route.params;
    const { context } = useAppContext({});
    console.log('ip address', context.ip);
    return (
        <RNRasa
            host={context.ip}
            onSendMessFailed={(error) => console.log(error)}
            emptyResponseMessage="Sorry, I don't understand"
            onEmptyResponse={() => console.log('Handle with your custom action')}
            userAvatar={null}
            botAvatar={null}
            idVoice={idVoice}
            navigation={navigation}
            token={token}
        />
    );
};

export default HomeScreen