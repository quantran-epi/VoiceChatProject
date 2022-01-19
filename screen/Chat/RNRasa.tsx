import Clipboard from '@react-native-clipboard/clipboard';
import axios from 'axios';
import uniqBy from 'lodash/uniqBy';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Modal, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import Sound from 'react-native-sound';
import {
  createBotEmptyMessage, createNewBotMessage, fetchOptions, uuidv4
} from '../../util';
import useAppContext from '../app-context/useAppContext';
import RasaMessagePrefix from '../constants/RasaMessagePrefix';
import ContactChatHelper from '../helpers/ContactChatHelper';
import SavedIntraHelper from '../helpers/SavedIntraHelper';
import App1 from './App1';

//TODO: reset bot on destroy

const RNRasa = ({
  host = "http://13.214.156.5:7001",
  onSendMessFailed,
  onEmptyResponse,
  emptyResponseMessage,
  userAvatar,
  botAvatar,
  idVoice,
  navigation,
  token,
  ...giftedChatProp
}) => {
  const [messages, setMessages] = useState([]);
  const [visible, setVisible] = useState(false);
  const [mute, setMute] = useState(true);
  console.log("idVoice:   ", idVoice);
  const { context } = useAppContext({});
  const [_uuid, _setUuid] = useState("");
  const [_recording, _setRecording] = useState<boolean>(false);
  const recorderRef = useRef<App1>();

  useEffect(() => {
    _initData();
    ContactChatHelper.saveAllContact();
  }, [])

  useEffect(() => {
    if (_uuid)
      sendMessage('hi');
  }, [_uuid])

  const _initData = async () => {
    let uuid = uuidv4();
    _setUuid(uuid);
  }

  const convertString = (text) => {
    text = text.slice(0, -2)
    text = text.split(/[&\/\\#,+()$~%.'":*?<>{}!-]/g).join('');
    text = text.split(/([0-9]) năm/g).join('5');
    text = text.split(/([0-9]) /g).join('');
    text = text.split(/([0-9]) /g).join('');
    text = text.split(/([0-9]) /g).join('');
    return text
  }

  const processRasaMessage = (messages) => {
    let normalMessages = [];
    let commandMessages = [];
    messages.forEach(e => {
      if (e.text.startsWith(RasaMessagePrefix.CLIENT_PUT_CONTACTS_QUERY) ||
        e.text.startsWith(RasaMessagePrefix.CLIENT_PUT_INTRA_QUERY) ||
        e.text.startsWith(RasaMessagePrefix.CLIENT_SAVE_INTRA)) {
        commandMessages.push(e);
      }
      else {
        normalMessages.push(e);
      }
    })

    if (commandMessages.length === 0) return normalMessages;
    let command = commandMessages[0].text;

    if (command.startsWith(RasaMessagePrefix.CLIENT_PUT_CONTACTS_QUERY)) {
      // search contact in local storage
      showContactSuggestion(command);
    }
    else if (command.startsWith(RasaMessagePrefix.CLIENT_PUT_INTRA_QUERY)) {
      //search intra in localstorage
      showIntraSuggesstion(command);
    }
    else if (command.startsWith(RasaMessagePrefix.CLIENT_SAVE_INTRA)) {
      //save intra to locastorage
      saveIntra(command);
    }
    return normalMessages;
  }

  const saveIntra = (message: string) => {
    console.log("intra message from server", message);
    let splitText = message.split('$');
    if (splitText.length < 3) return;

    let accountNumber = splitText[1];
    let accountName = splitText[2];
    let accountAlias = splitText[3];
    SavedIntraHelper.save({
      name: accountName,
      accountNumber: accountNumber,
      alias: accountAlias
    });
  }

  const showIntraSuggesstion = async (text: string) => {
    console.log('show intra suggestion', text);
    let splitText = text.split('$');
    let searchText = splitText[1]; console.log("search intra text", searchText);
    let intras = await SavedIntraHelper.search(searchText);
    if (!intras || intras.length === 0) return;

    let buttons = []; console.log("found intras", intras);
    intras.forEach(c => {
      buttons.push(({
        title: c.name.concat(' - ').concat(c.accountNumber),
        payload: c.accountNumber
      }));
    }); console.log('buttons intra', buttons);
    let botMessageObj = {
      text: "Tài khoản",
      buttons: buttons.reverse()
    }
    let botMessage = createNewBotMessage(botMessageObj, botAvatar);
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [botMessage])
    )
  }

  const showContactSuggestion = async (text: string) => {
    console.log('show contact suggestion', text);
    let splitText = text.split('$');
    if (splitText.length !== 2) return;

    let searchText = splitText[1]; console.log("search text", searchText);
    let contacts = await ContactChatHelper.search(searchText);
    if (!contacts || contacts.length === 0) return;

    // setMessages((previousMessages) =>
    //   GiftedChat.append(previousMessages, mess),
    // );
    let buttons = []; console.log("found contacts", contacts);
    contacts.forEach(c => {
      buttons.push(...uniqBy(c.phoneNumbers, e => e.number).map(phone => ({
        title: c.displayName.concat(' - ').concat(phone.number),
        payload: phone.number
      })));
    }); console.log('buttons', buttons);
    let botMessageObj = {
      text: "Danh bạ",
      buttons: buttons.reverse()
    }
    let botMessage = createNewBotMessage(botMessageObj, botAvatar);
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [botMessage])
    )
  }

  // Parse the array message
  const parseMessages = useCallback(
    (messArr) => {
      return (messArr || []).map((singleMess) =>
        createNewBotMessage(singleMess, botAvatar),
      );
    },
    [botAvatar],
  );

  // Send message to bot
  const sendMessage = useCallback(
    async (text) => {
      const rasaMessageObj = {
        message: text,
        sender: _uuid,
      };
      try {
        console.log('request', `${host}/webhooks/rest/webhook`);
        const response = await fetch(`${host}/webhooks/rest/webhook`, {
          ...fetchOptions,
          body: JSON.stringify(rasaMessageObj),
        });
        const messagesJson = await response.json();
        console.log("messagesJson:    ", messagesJson);

        if (messagesJson[0]?.text) {
          getApiReader(messagesJson[0].text)
        }

        let messages = processRasaMessage(messagesJson);
        if (!messages || messages.length === 0) return;

        const newRecivieMess = parseMessages(messages);
        if (!newRecivieMess.length) {
          onEmptyResponse && onEmptyResponse();
          if (emptyResponseMessage) {
            const emptyMessageReceive = createBotEmptyMessage(
              emptyResponseMessage,
            );
            setMessages((previousMessages) =>
              GiftedChat.append(previousMessages, [emptyMessageReceive]),
            );
          }
          return;
        }
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newRecivieMess.reverse()),
        );
      } catch (error) {
        // handle when send message failed
        alert(error)
        // onSendMessFailed(error);
      }
    },
    [
      parseMessages,
      host,
      onSendMessFailed,
      onEmptyResponse,
      emptyResponseMessage,
      mute
    ],
  );
  // Send message
  const onSend = useCallback(
    async (mess = []) => {
      console.log("mess:   ", mess);
      sendMessage(mess[0].text);
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, mess),
      );
    },
    [sendMessage],
  );
  // Bot Button click
  const onQuickReply = useCallback(
    (props) => {
      const value = props && props[0] && props[0].value;
      console.log("props:   ", props);
      const quickMessage = [
        {
          createdAt: new Date(),
          username: 'user',
          _id: uuidv4(),
          user: { _id: 1, avatar: userAvatar },
          text: value,
        },
      ];
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, quickMessage.reverse()),
      );
      sendMessage(value);
    },
    [userAvatar, sendMessage],
  );

  const onStartRecorder = () => {
    // setVisible(true)
    if (recorderRef.current) recorderRef.current.onStartRecord();
    _setRecording(true);
  }

  const onStopRecorder = () => {
    // setVisible(true)
    if (recorderRef.current) recorderRef.current.onStopRecord();
    _setRecording(false);
  }

  const onResultData = (data) => {
    onSend([{
      username: 'user',
      _id: uuidv4(),
      user: { _id: 1, avatar: userAvatar },
      "text": convertString(data),
    }])
  }

  const hideModel = () => {
    setVisible(false)
  }

  const onLongPress = (context, message) => {
    if (message?.text) {
      // copy
      try {
        Clipboard.setString(message?.text);
        //show toast
        ToastAndroid.showWithGravity(
          "Copied",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
      }
      catch (error) {
        console.log('copy message text error', error);
      }
    }
    console.log("message:    ", message);
    getApiReader(message.text)

  };
  const getApiReader = async (text) => {
    console.log('mute', mute);
    if (mute) return;
    await axios({
      method: 'post',
      url: 'https://api.fpt.ai/hmi/tts/v5',
      headers: {
        'api-key': 'h1P90c9rkAyHApnSUh8w9uiOr9wjulNR',
        'speed': '',
        'voice': 'banmai'
      },
      data: text
    })
      .then(function (response) {
        console.log(JSON.stringify("text to speech", response.data));
        playTrack(response.data.async)
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  const playTrack = (url) => {
    const track = new Sound(url, null, (e) => {
      if (e) {
        playTrack(url)
      } else {
        track.play()
      }
    })
  }

  const onInputTextChanged = (fallback) => {
    console.log("fallback:    ", fallback);
  }

  const switchMute = () => {
    setMute(!mute);
  }

  const _renderVoiceRecorder = (): React.ReactNode => {
    return <View style={{
      alignItems: "center",
      padding: 20,
      backgroundColor: "transparent"
    }}>
      <App1 ref={recorderRef}
        onResultData={onResultData}
        // idVoice={idVoice}
        idVoice={null}
        token={token}
      />
      {_recording ? <TouchableOpacity
        onPress={onStopRecorder}
        style={{
          width: 70, height: 70,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: "#0066ff",
          borderRadius: 1000,
        }}>
        <Image
          source={require("../Demo/stop-recorder.png")}
          style={{
            width: 35, height: 35, tintColor: "#fff",
          }}
        />
      </TouchableOpacity> : <TouchableOpacity
        onPress={onStartRecorder}
        style={{
          width: 70, height: 70,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: "#0066ff",
          borderRadius: 1000,
        }}>
        <Image
          source={require("../Demo/microphone.png")}
          style={{
            width: 35, height: 35, tintColor: "#fff",
          }}
        />
      </TouchableOpacity>}
    </View>
  }

  return (
    <View style={{
      position: 'relative',
      flex: 1,
    }}>
      <View style={{
        backgroundColor: 'white',
        elevation: 2,
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12
      }}>
        <TouchableOpacity onPress={() => { navigation.goBack() }}>
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
        }}>{"Hỗ trợ trực tuyến"}</Text>

        <TouchableOpacity style={{ marginLeft: "auto" }} onPress={switchMute}>
          {mute ? <Image
            source={require('../Demo/mute.png')}
            style={{
              width: 25,
              height: 25
            }}
          /> : <Image
            source={require('../Demo/speaker.png')}
            style={{
              width: 25,
              height: 25
            }}
          />}
        </TouchableOpacity>
      </View>

      <GiftedChat
        {...giftedChatProp}
        user={{
          _id: 1,
          avatar: userAvatar,
        }}
        onSend={(mess) => onSend(mess)}
        messages={messages}
        onQuickReply={onQuickReply}
        onLongPress={onLongPress}
        renderChatFooter={_renderVoiceRecorder}
      />
    </View>
  );
};

export default RNRasa;