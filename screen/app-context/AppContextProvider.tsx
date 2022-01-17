import React, { FunctionComponent, useState } from "react";

export interface AppContextProps {
    ip: string;
    uuid: string;
    changeIp: (id: string) => void;
    changeUuid: (id: string) => void;
}

const defaultContext: AppContextProps = {
    ip: "http://13.214.25.203:7001",
    changeIp: (ip: string) => { },
    changeUuid: (id: string) => { },
    uuid: ""
}

export const AppContext = React.createContext<AppContextProps>(defaultContext);

const AppContextProvider: FunctionComponent = ({
    children
}) => {
    const [_ip, _setIp] = useState<string>(defaultContext.ip);
    const [_uuid, _setuuid] = useState<string>("");

    const _changeIp = (ip: string): void => {
        _setIp(ip);
    }

    const _changeUuid = (id: string): void => {
        _setuuid(id);
    }

    return <AppContext.Provider value={{
        uuid: _uuid,
        ip: _ip,
        changeIp: _changeIp,
        changeUuid: _changeUuid
    }}>
        {children}
    </AppContext.Provider>
}

export default AppContextProvider;