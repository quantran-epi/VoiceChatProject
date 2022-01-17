import React, { FunctionComponent, useEffect, useState } from 'react'
import { Modal, Text, View } from 'react-native'
import Spinner from 'react-native-spinkit';

interface BaseViewProps {
    loading?: boolean;
}

const BaseView: FunctionComponent<BaseViewProps> = ({
    children,
    loading = false
}) => {
    const [_loading, _setLoading] = useState<boolean>(loading);

    useEffect(() => {
        _setLoading(loading);
    }, [loading])

    return <View style={{ flex: 1 }}>
        {children}
        <Modal
            transparent
            visible={_loading}
            animationType={'fade'}
            onRequestClose={() => _setLoading(false)} >
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `rgba(0, 0, 0, ${0.6})`,
            }}>
                <View style={{
                    padding: 12,
                    backgroundColor: "#fff",
                    borderRadius: 20
                }}>
                    <Spinner isVisible type="ThreeBounce" color="#0066ff" />
                </View>
            </View>
        </Modal>
    </View>
}

export default BaseView