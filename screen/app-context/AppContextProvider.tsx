import React, { FunctionComponent, useState } from "react";

export interface AppContextProps {
    uuid: string;
    changeUuid: (id: string) => void;
}

const defaultContext: AppContextProps = {
    changeUuid: (id: string) => { },
    uuid: ""
}

export const AppContext = React.createContext<AppContextProps>(defaultContext);

const AppContextProvider: FunctionComponent = ({
    children
}) => {
    const [_uuid, _setuuid] = useState<string>("");

    const _changeUuid = (id: string): void => {
        _setuuid(id);
    }

    return <AppContext.Provider value={{
        uuid: _uuid,
        changeUuid: _changeUuid
    }}>
        {children}
    </AppContext.Provider>
}

export default AppContextProvider;