
import * as Device from "expo-device";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";
//var DeviceUUID = require("react-native-device-uuid");
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

  async function getuniqueIDorDeviceToken() {
    var uniID = null
    var token = null
    if (Device.osName === "Android" || Platform.OS === "android") {
      var android = true
      var ios = false
      uniID = await DeviceInfo.getUniqueId();
    } else if (
      Device.osName === "iOS" ||
      Device.osName === "iPadOS" ||
      Platform.OS === "ios"
    ) {;
      var android = false
      var ios = true
      // if (parseInt(Platform.Version, 10) >= 11) {
      //   var token = await DeviceInfo.getDeviceToken();
      // } else {
      //   var token = await DeviceInfo.getUniqueId();
      // }

      //console.log('about to get uuid')

      // DeviceUUID.getUUID().then((uuid) => {
      //   console.log(uuid);
      //   token = uuid
      // });

      try {
        const value = await AsyncStorage.getItem('ios-device-token');
        if (value !== null) {
          // value previously stored
          var token = value
        } else {
          new_value = uuid.v4()
          await AsyncStorage.setItem('ios-device-token', new_value);
          var token = new_value
        }
      } catch (e) {
        // error reading value
        new_value = uuid.v4()
        await AsyncStorage.setItem('ios-device-token', new_value);
        var token = new_value
      }
    }
    return [android, ios, uniID, token]
  }


  export default getuniqueIDorDeviceToken;
  //REPASADO Y REVISADO