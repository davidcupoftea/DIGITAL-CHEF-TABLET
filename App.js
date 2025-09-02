import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform } from "react-native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
// import { createDrawerNavigator } from "@react-navigation/drawer";
import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import DeviceInfo from "react-native-device-info";
import * as Notifications from "expo-notifications";

import AuthFlowProvider from "./src/components/AuthUseContextProvider.jsx";
import OrderProvider from "./src/components/OrderContextProvider.jsx";
import PrintersProvider from "./src/components/PrintersContextProvider.jsx";
import RestaurantChosenProvider from "./src/components/RestaurantChosenProvider.jsx";
import ConceptosFacturadosProvider from "./src/components/ConceptosFacturadosProvider.jsx";
import Navigator from "./src/components/Navigator.jsx";
import AsyncStorage from '@react-native-async-storage/async-storage';


import * as Linking from "expo-linking";

import { navigationRef, navigate } from "./RootNavigation";

//ESTO DE AQUI ABAJO PARA STRIPE
// import { StripeProvider } from '@stripe/stripe-react-native';
//ESTO DE AQUI ARRIBA PARA STRIPE
const prefix = Linking.createURL("");



const INSTALL_KEY = 'numero_instalacion';

export const getOrCreateInstallDate = async () => {
  try {
    const existingDate = await AsyncStorage.getItem(INSTALL_KEY);
    if (existingDate) {
      // Ya existe → devolver como objeto Date
      return existingDate;
    }
    // No existe → crear uno nuevo
    const newDate = new Date();
    await AsyncStorage.setItem(INSTALL_KEY, newDate.toISOString());

    return newDate;
  } catch (error) {
    //console.error('Error guardando fecha de instalación:', error);
    return null;
  }
};

const App = () => {

  useEffect(() => {
  (async () => {
    const installDate = await getOrCreateInstallDate();
    //console.log('Fecha instalación:', installDate);
  })();
}, []);

  //ESTO DE AQUI ABAJO PARA STRIPE
  // const [publishableKey, setPublishableKey] = useState('');
  // //ESTO DE AQUI ARRIBA PARA STRIPE
  
  const notificationListener = useRef(Notifications.Subscription);
  const responseListener = useRef(Notifications.Subscription);


  //ESTO DE AQUI ABAJO PARA STRIPE
  // const fetchPublishableKey = async () => {

  //   //const key = await fetchPublishableKey();
  //   const key = 'pk_test_tiNXm3G1WJLnF3j5wXNGVbuS';
  //   setPublishableKey(key)

  // }

  // useEffect(()=>{
  //   fetchPublishableKey();
  // }, [])
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

  // useEffect(() => {
  //   const executeFunction = async () => {
  //     const pushtoken = await registerForPushNotificationsAsync();
  //     try {
  //       await setExpoPushToken(pushtoken ?? "");
  //     } catch (e) {
  //       await setExpoPushToken(e);
  //     }
  //     const [android, ios, uniID, iostoken] = await getuniqueIDorDeviceToken();
  //     await sendTokenToBackend(android, ios, uniID, iostoken, pushtoken);

  //     notificationListener.current =
  //       Notifications.addNotificationReceivedListener((notification) => {
  //         setNotification(notification);
  //       });

  //     responseListener.current =
  //       Notifications.addNotificationResponseReceivedListener((response) => {
  //       });

  //     return () => {
  //       notificationListener.current &&
  //         Notifications.removeNotificationSubscription(
  //           notificationListener.current
  //         );
  //       responseListener.current &&
  //         Notifications.removeNotificationSubscription(
  //           responseListener.current
  //         );
  //     };
  //   };
  //   executeFunction();
  // }, []);

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
      background: "rgb(107,106,106)",
    },
  };

  return (
    <ConceptosFacturadosProvider>
    {/* <StripeProvider
    publishableKey={publishableKey}
    merchantIdentifier="merchant.identifier" // required for Apple Pay
    urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    > */}
  <PrintersProvider>
  <OrderProvider>
    <AuthFlowProvider>
      <RestaurantChosenProvider>
      <NavigationContainer
        ref={navigationRef}
        theme={BlackTheme}
        linking={linking}
      >
        <View style={styles.container}>
          <Navigator />
        </View>

        <StatusBar style="light" backgroundColor="black" />
      </NavigationContainer>
      </RestaurantChosenProvider>
    </AuthFlowProvider>
    </OrderProvider>
    </PrintersProvider>
    {/* </StripeProvider> */}
    </ConceptosFacturadosProvider>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default App;

//LIMPIADO Y REVISADO
