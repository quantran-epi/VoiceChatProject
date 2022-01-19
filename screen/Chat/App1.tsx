import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { Component } from 'react';

var RNFS = require('react-native-fs');
var axios = require('axios');
import { Buffer } from "buffer"
import RNFetchBlob from 'rn-fetch-blob'
import Spinner from 'react-native-spinkit';


const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#455A64',
    flexDirection: 'column',
    alignItems: 'center',
  },
  titleTxt: {
    marginTop: 100,
    color: 'white',
    fontSize: 28,
  },
  viewRecorder: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  recordBtnWrapper: {
    flexDirection: 'row',
  },
  viewPlayer: {
    marginTop: 60,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  viewBarWrapper: {
    marginTop: 28,
    marginHorizontal: 28,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 4,
    alignSelf: 'stretch',
  },
  viewBarPlay: {
    backgroundColor: 'white',
    height: 4,
    width: 0,
  },
  playStatusTxt: {
    marginTop: 8,
    color: '#ccc',
  },
  playBtnWrapper: {
    flexDirection: 'row',
    marginTop: 40,
  },
  btn: {
    borderColor: 'white',
    borderWidth: 1,
  },
  txt: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    marginTop: 32,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  txtCounter: {
    marginTop: 12,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
});

interface State {
  isLoggingIn: boolean;
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
  isProcessingSpeechToText: boolean;
  recording: boolean;
}

const screenWidth = Dimensions.get('screen').width;

class Page extends Component<any, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private onResultData = null
  private hideModel = null
  private idVoice = null
  private token = null

  constructor(props: any) {
    super(props);
    this.state = {
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      isProcessingSpeechToText: false,
      recording: false
    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5
    this.onResultData = props.onResultData
    this.hideModel = props.hideModel
    this.idVoice = props.idVoice
    this.token = props.token
  }

  componentDidMount(): void {
    // this.onStartRecord()
  }

  public render() {
    let playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56);

    if (!playWidth) {
      playWidth = 0;
    }

    return (
      // <SafeAreaView style={styles.container}>
      //   <View style={styles.viewRecorder}>
      //     <View style={styles.recordBtnWrapper}>
      //       <Button
      //         style={styles.btn}
      //         onPress={this.onStartRecord}
      //         textStyle={styles.txt}
      //       >
      //         Record
      //       </Button>

      //       <Button
      //         style={[styles.btn, { marginLeft: 12 }]}
      //         onPress={this.onStopRecord}
      //         textStyle={styles.txt}
      //       >
      //         Stop
      //       </Button>
      //     </View>
      //   </View>
      // </SafeAreaView>

      <View style={{ paddingBottom: 10 }}>
        {this.state.recording && <Spinner type="Wave" isVisible color="#0066ff" />}
        {this.state.isProcessingSpeechToText && <View style={{
          alignItems: "center"
        }}>
          <Text>Đang xử lý</Text>
          <Spinner type="ThreeBounce" isVisible color="#0066ff" />
        </View>}

        {/* <TouchableOpacity onPress={this.onStopRecord} style={{
          backgroundColor: '#0066ff',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20
        }}>
          <Text style={{
            color: 'white'
          }}>{"Dừng"}</Text>
        </TouchableOpacity> */}
      </View>
    );
  }

  public onStartRecord = async () => {
    this.setState({
      recording: true
    })
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('write external stroage', grants);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    // console.log('audioSet', audioSet);
    //? Custom path
    // const uri = await this.audioRecorderPlayer.startRecorder(
    //   this.path,
    //   audioSet,
    // );

    const dirs = RNFetchBlob.fs.dirs;
    const path = Platform.select({
      ios: 'hello.m4a',
      android: `${dirs.CacheDir}/hello.wav`,
    });

    //? Default path
    const uri = await this.audioRecorderPlayer.startRecorder(
      path,
      audioSet,
    );

    this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      // console.log('record-back', e);
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
      });
    });
    console.log(`uri: ${uri}`);
  };

  public onStopRecord = async () => {
    this.setState({
      recording: false,
      isProcessingSpeechToText: true
    })
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({
      recordSecs: 0,
    });
    console.log(result);
    // const fd = await RNFS.readFile(result, 'utf8')

    const formData = new FormData()
    formData.append("files", result)

    const base64 = await RNFS.readFile(result, 'base64')
    this.voiceToText(base64);

    // xac thuc voice 
    // const params = { 'audio': base64, 'id': this.idVoice + "" }
    // var configV = {
    //   method: 'post',
    //   url: 'https://api-services.nextg.team/api/v1/voices/verify',
    //   headers: {
    //     'Authorization': `Bearer ${this.token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   data: params
    // };

    // const that = this

    // await axios(configV)
    //   .then(function (response) {
    //     console.log(JSON.stringify(response.data));
    //     if (response.data && response.data.pass) {
    //       that.voiceToText(base64)
    //     } else {
    //       that.hideModel && that.hideModel()
    //       alert("Xác thực không thành công. Lý do: " + response.data.reason)
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //     // console.log(JSON.stringify(error));
    //   });



  };

  private voiceToText = async (base64) => {
    const buffer = Buffer.from(base64, 'base64')
    // voice to text
    var config = {
      method: 'post',
      url: 'https://api.fpt.ai/hmi/asr/general',
      headers: {
        'api-key': 'h1P90c9rkAyHApnSUh8w9uiOr9wjulNR',
        // 'Content-Type': 'text/plain'
        'Content-Type': 'text/plain'
      },
      data: buffer
    };

    const that = this

    await axios(config)
      .then(function (response) {
        that.setState({
          isProcessingSpeechToText: false
        })
        console.log(JSON.stringify(response.data));
        const data = response.data
        that.onResultData && that.onResultData(data.hypotheses[0].utterance)
        that.hideModel && that.hideModel()
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

export default Page;