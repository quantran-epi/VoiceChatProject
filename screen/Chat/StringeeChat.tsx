import React, { Component, createRef } from "react";
import { Button, View } from "react-native";
import { StringeeClient } from "stringee-react-native";

interface State {
}

class StringeeChat extends Component<any, State> {
    client: React.RefObject<StringeeClient> = null;
    clientEventHandlers: object = {};

    constructor(props: any) {
        super(props);
        // Create client ref
        this.client = createRef();
        // Register client events
        this.clientEventHandlers = {
            onConnect: this.onConnect,
            onDisConnect: this.onDisConnect,
            onFailWithError: this.onFailWithError,
            onRequestAccessToken: this.onRequestAccessToken,
            onCustomMessage: this.onCustomMessage,
            onObjectChange: this.onObjectChange,
            onTimeoutInQueue: this.onTimeoutInQueue,
            onConversationEnded: this.onConversationEnded,
            onUserBeginTyping: this.onUserBeginTyping,
            onUserEndTyping: this.onUserEndTyping,
        };
    }

    //Event
    // The client connects to Stringee server
    onConnect = ({ userId }) => {
        console.log('onConnect - ' + userId);
    };

    // The client disconnects from Stringee server
    onDisConnect = () => {
        console.log('onDisConnect');
    };

    // The client fails to connects to Stringee server
    onFailWithError = ({ code, message }) => {
        console.log('onFailWithError: code-' + code + ' message: ' + message);
    };

    // Access token is expired. A new access token is required to connect to Stringee server
    onRequestAccessToken = () => {
        console.log('onRequestAccessToken');
    };

    // Receive custom message
    onCustomMessage = ({ data }) => {
        console.log('onCustomMessage: ' + data);
    };

    // Receive event of Conversation or Message
    onObjectChange = ({ objectType, objectChanges, changeType }) => {
        console.log('onObjectChange: objectType - ' + objectType + '\n changeType - ' + changeType + '\n objectChanges - ' + JSON.stringify(objectChanges),);

        let convId = objectChanges[0]?.id;
        let message = {
            type: 1,
            convId: convId,
            message: {
                content: 'Hello 1111111'
            }
        };
        console.log('MESSAGE', message);
        this.client.current.sendMessage(message, (status, code, message) => {
            console.log("status-" + status + " code-" + code + " message-" + message);
        });
    };

    // Receive when chat request to queue is timeout
    onTimeoutInQueue = ({ convId, customerId, customerName }) => {
        console.log('onTimeoutInQueue: convId - ' + convId + '\n customerId - ' + customerId +
            '\n customerName - ' + customerName);
    };

    // Receive when conversation ended
    onConversationEnded = ({ convId, endedby }) => {
        console.log('onConversationEnded: convId - ' + convId + '\n endedby - ' + endedby,);
    };

    // Receive when user send beginTyping
    onUserBeginTyping = ({ convId, userId, displayName }) => {
        console.log('onUserBeginTyping: convId - ' + convId + '\n userId - ' + userId + '\n displayName - ' + displayName,);
    };

    // Receive when user send endTyping
    onUserEndTyping = ({ convId, userId, displayName }) => {
        console.log('onUserEndTyping: convId - ' + convId + '\n userId - ' + userId + '\n displayName - ' + displayName,);
    };

    render() {
        return (
            <View>
                <Button title="test" onPress={() => {
                    console.log('button press');
                    this.client.current.getLiveChatToken('bXZzSDBBZEVHZU1JVXJqRnc2aG1iQT09', 'YOUR_CUSTOMER_NAME', 'YOUR_CUSTOMER_EMAIL', (status, code, message, token) => {
                        console.log('getLiveChatToken: ' + JSON.stringify(token));
                        // After get token then can connect
                        this.client.current.connect(token);
                    },
                    );
                    this.client.current.updateUserInfo("USER_NAME", "USER_EMAIL", "USER_AVATAR", (status, code, message) => {
                        console.log('updateUserInfo: ' + message);
                    });
                    this.client.current.createLiveChatConversation('5353534242', (status, code, message, conversation) => {
                        console.log('createLiveChatConversation - ' + JSON.stringify(conversation),);
                    });
                }}></Button>
                <StringeeClient
                    ref={this.client}
                    eventHandlers={this.clientEventHandlers}
                />

            </View>
        )
    }
}

export default StringeeChat