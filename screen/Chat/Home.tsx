import { Button } from "react-native";
import React, { useState, useCallback, useEffect } from 'react';
import RNRasa from "./RNRasa";
import useAppContext from "../app-context/useAppContext";
import GlobalDataHelper from "../helpers/GlobalDataHelper";

const HomeScreen = ({ route, navigation }) => {
    const { idVoice, token } = route.params;
    const [_ip, _setIp] = useState<string>("");

    useEffect(() => {
        _initData();
    }, [])

    const _initData = async () => {
        let ip = await GlobalDataHelper.getIp();
        _setIp(ip);
    }

    return (
        <React.Fragment>
            {Boolean(_ip) && <RNRasa
                host={_ip}
                onSendMessFailed={(error) => console.log(error)}
                emptyResponseMessage="Sorry, I don't understand"
                onEmptyResponse={() => console.log('Handle with your custom action')}
                userAvatar={null}
                botAvatar={null}
                idVoice={idVoice}
                navigation={navigation}
                token={token}
            />}
        </React.Fragment>
    );
};

export default HomeScreen