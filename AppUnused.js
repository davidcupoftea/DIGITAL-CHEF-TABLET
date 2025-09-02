import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { BASE_URL, RESTAURANT_PK } from "./src/services/index.jsx";
import React, { useEffect, useContext, useState, useRef } from "react";
import * as Device from "expo-device";
import DeviceInfo from "react-native-device-info";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import AuthFlowProvider from "./src/components/AuthUseContextProvider.jsx";
import OrderProvider from "./src/components/OrderContextProvider.jsx";
import RestaurantChosenProvider from "./src/components/RestaurantChosenProvider.jsx"
import Navigator from "./src/components/Navigator.jsx";

import ResetPassword from "./src/components/ResetPassword.jsx";
import ResetPasswordDone from "./src/components/ResetPasswordDone.jsx";

import * as Linking from "expo-linking";

import { navigationRef, navigate, replace } from "./RootNavigation";

//ESTO DE AQUI ABAJO PARA STRIPE
import { StripeProvider } from '@stripe/stripe-react-native';
//ESTO DE AQUI ARRIBA PARA STRIPE
const prefix = Linking.createURL("");

//ESTO DE AQUI ABAJO PARA EXPO-CAMERA
import { Camera, useCameraPermissions } from 'expo-camera';
//ESTO DE AQUI ARRIBA PARA EXPO CAMERA

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

const sendTokenToBackend = async (android, ios, uniID, iostoken, token) => {
  var payload = JSON.stringify({
    "android": android,
    "ios": ios,
    "uniID": uniID,
    "iostoken": iostoken,
    "token": token,
})
  const res = await fetch(
    BASE_URL + "push-token/" + RESTAURANT_PK + '/' ,
    {
      method: "POST",
      body: payload,
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = await res.json();
  if (data.status == "ok") {
  } else {
  }
};

const App = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(
    Notifications.Notification | undefined
  );

  //ESTO DE AQUI ABAJO PARA EXPO CAMERA
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);

  const handleRequestPermission = async () => {
    if (!permission || permission.status !== 'granted') {
      const { status } = await requestPermission();
      if (status === 'granted') {
        setCameraVisible(true);
      } else {
        alert('Camera access denied');
      }
    } else {
      setCameraVisible(true);
    }
  };
  //ESTO DE AQUI ARRIBA PARA EXPO CAMERA

  //ESTO DE AQUI ABAJO PARA STRIPE
  const [publishableKey, setPublishableKey] = useState('');
  // //ESTO DE AQUI ARRIBA PARA STRIPE
  
  const notificationListener = useRef(Notifications.Subscription);
  const responseListener = useRef(Notifications.Subscription);


  //ESTO DE AQUI ABAJO PARA STRIPE
  const fetchPublishableKey = async () => {

    //const key = await fetchPublishableKey();
    const key = 'pk_test_tiNXm3G1WJLnF3j5wXNGVbuS';
    setPublishableKey(key)

  }

  useEffect(()=>{
    fetchPublishableKey();
  }, [])
  //ESTO DE AQUI ARRIBA PARA STRIPE

  async function getuniqueIDorDeviceToken() {
    var uniID = null
    var token = null
    if (Device.osName === "Android" || Platform.OS === "android") {
      var android = true
      var ios = false
      var uniID = await DeviceInfo.getUniqueId();
    } else if (
      Device.osName === "iOS" ||
      Device.osName === "iPadOS" ||
      Platform.OS === "ios"
    ) {;
      var android = false
      var ios = true
      if (parseInt(Platform.Version, 10) >= 11) {
        var token = await DeviceInfo.getDeviceToken();
      } else {
        var token = await DeviceInfo.getUniqueId();
      }
    }
    return [android, ios, uniID, token]
  }

  useEffect(() => {
    const executeFunction = async () => {
      const pushtoken = await registerForPushNotificationsAsync();
      try {
        await setExpoPushToken(pushtoken ?? "");
      } catch (e) {
        await setExpoPushToken(e);
      }
      const [android, ios, uniID, iostoken] = await getuniqueIDorDeviceToken();
      await sendTokenToBackend(android, ios, uniID, iostoken, pushtoken);

      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
        });

      return () => {
        notificationListener.current &&
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        responseListener.current &&
          Notifications.removeNotificationSubscription(
            responseListener.current
          );
      };
    };
    executeFunction();
  }, []);

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        ResetPassword: "resetpassword",
        HandleDeepLinkForQR: "redeem-ticket",
        ResetPasswordDone: {
          path: "resetpassworddone",
        },
      },
    },
  };

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      const { path, queryParams } = Linking.parse(url);
      
      if (path === "resetpassworddone") { //ESTE CREO QUE SE PUEDE ELIMINAR
        navigate("ResetPasswordDone", { queryParams });
      } else if (path === "resetpassword") { 
        navigate("ResetPassword", { queryParams });}
      else if (path === "redeem-ticket") {
        navigate("Drawer", { screen: "Mis recompensas-Drawer",params : {params: {...queryParams}, screen: 'HandleDeepLinkForQR'} })
      }
    };

    Linking.addEventListener("url", handleDeepLink);

    const cleanup = () => {};

    return cleanup;
  }, []);

  var BlackTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "black",
    },
  };

  return (
    <View style={{ flex: 1 }}>
      {!cameraVisible ? (
        <View>
          <Text>Camera Permission Needed</Text>
          <Button title="Request Camera Permission" onPress={handleRequestPermission} />
        </View>
      ) : (
        <Camera style={{ flex: 1 }} />
      )}
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default App;

//ESTO ES INTERESANTE
