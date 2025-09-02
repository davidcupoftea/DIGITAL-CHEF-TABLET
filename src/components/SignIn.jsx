import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import * as Device from "expo-device";
import "expo-dev-client";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GOOGLE_CLOUD_CREDENTIALS } from "../services/constant";
import { getUserInfoFromGoogleApi } from "../services/restApiCallGoogle";
import { getUserInfoFromAppleApi } from "../services/restApiCallSignInWithApple";
import * as AppleAuthentication from "expo-apple-authentication";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { OrderContext } from './OrderContextProvider.jsx'

import getuniqueIDorDeviceToken from "../services/getUniqueIDorDeviceToken.jsx";
WebBrowser.maybeCompleteAuthSession();

function SignIn() {
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const navigation = useNavigation();
  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    selectAccount: true,
    expoClientId: GOOGLE_CLOUD_CREDENTIALS.EXPO_CLIENT_ID,
    iosClientId: GOOGLE_CLOUD_CREDENTIALS.IOS_CLIENT_ID,
    androidClientId: GOOGLE_CLOUD_CREDENTIALS.ANDROID_CLIENT_ID,
  });
  let { order, setOrder } = useContext(OrderContext)
  useEffect(()=>{
    const unsubscribe = navigation.addListener('focus', ()=>{ 
      setOrder({ products: [] });  
      })
  return unsubscribe;
  },[navigation])


  const [appleUserToken, setAppleUserToken] = useState("");
  useEffect(() => {
    const checkAvailable = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(isAvailable);
    };
    checkAvailable();
  }, []);


    useEffect(() => {
    const myFunc = async () => {
      if (response != null) {
        const [android, ios, uniID, deviceToken] = await getuniqueIDorDeviceToken();
        await handleSignInWithGoogle(android, ios, uniID, deviceToken);
      }
    };
    myFunc();
  }, [response]);


    const loginWithApple = async () => {
    if (Device.osName === "Android" || Platform.OS === "android") {
      Alert.alert("Esta función no está disponible en Android ;)");
      return;
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      await setAppleUserToken(credential);
      const [android, ios, uniID, deviceToken] = await getuniqueIDorDeviceToken();
      const dispositivo = {
        ios: ios,
        android: android,
        devicetoken: deviceToken,
        uniqueid: uniID,
        //pushnotificationsid: null,
      };
      const responsefromios = await getUserInfoFromAppleApi(
        credential,
        dispositivo
      );
      setAuthTokens(responsefromios["token"]);
    } catch (e) {
      Alert.alert("Error", e);
    }
  };


    async function handleSignInWithGoogle(android, ios, uniID, iosdevicetoken) {
    if (response?.type == "success") {
      const dispositivo = {
        ios: ios,
        android: android,
        devicetoken: iosdevicetoken,
        uniqueid: uniID,
        //pushnotificationsid: null,
      };
      const getUserData = await getUserInfoFromGoogleApi(
        response.authentication.accessToken,
        dispositivo
      );

      setAuthTokens(getUserData);
    } else {
      Alert.alert("Algo ha ido mal. Vuelve a intentarlo");
    }
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Login con Email");
        }}
        style={styles.emailsignin}
      >
        <Text style={styles.googlesigntext}>Usar Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.applesign}
        onPress={() => {
          loginWithApple();
        }}
      >
        <Text style={styles.applesigntext}>Loguéate con Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          promptAsync({ showInRecents: true });
        }}
        style={styles.googlesign}
      >
        <Text style={styles.googlesigntext}>Loguéate con Google</Text>
      </TouchableOpacity>

      <View>
        <Text style={styles.textout}>
          Solo requerimos tu email e información básica, ningún dato más
        </Text>
      </View>

      <View style={styles.container2}>
        <Image
          style={styles.lasbrasas}
          source={require("../../assets/adaptive-icon.png")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column-reverse",
    justifyContent: "flex-start",
    flex: 1,
    backgroundColor: "rgb(107, 106, 106)",
  },
  textout: {
    color: "white",
    textAlign: "center",
    marginHorizontal: 10,
    fontSize: 22,
    fontFamily: 'Function-Regular',
  },
  googlesign: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 35,
    margin: 15,
  },
  googlesigntext: {
    color: "black",
    textAlign: "center",
    fontFamily: 'Function-Regular',
    fontSize: 20,
  },
  applesign: {
    backgroundColor: "rgb(107, 106, 106)",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 35,
    marginLeft: 15,
    marginRight: 15,
  },
  applesigntext: {
    color: "white",
    textAlign: "center",
    fontFamily: 'Function-Regular',
    fontSize: 20,
  },
  emailsignin: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 35,
    margin: 15,
  },
  lasbrasas: {
    width: 400,
    height: 400,
    justifyContent: "center",
    alignSelf: "center",
  },
  container2: {
    flexGrow: 1,
    justifyContent: "center",
    marginTop: 30,
  },
});

export default SignIn;

//REPASADO Y REVISADO