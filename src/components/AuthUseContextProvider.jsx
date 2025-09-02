import { useState, createContext, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../services/index.jsx';

export const AuthFlowContext = createContext({
  authTokensObject: [null, () => {}],
  userObject: [null, () => {}],
  phoneVerifiedObject: [true, () => {}],
  signInFunction: () => {},
  updateTokenFunction: () => {},
  logOutFunction: () => {},
  getUserData: () => {},
  signIn: [true, () => {}],
  verifiedEmail: [true, () => {}],
  invitation: [false, () => {}],
  birthDay: [false, () => {}],
  nameSate: [false, () => {}],
  omitBirthday: [false, () => {}],
  nameStateDetail: [null, () =>{}],
  emailDetail: [null, () =>{}],
  privacyAcceptation: [null, () =>{}],
  restaurantMembership: [null, () =>{}]
});

const AuthFlowProvider = ({ children }) => {
  const [authTokens, _setAuthTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [isNotSignedIn, setIsNotSignedIn] = useState(false);
  const [isUnverifiedEmail, setIsUnverifiedEmail] = useState(false);
  const [isInvitationPageNotShown, setIsInvitationPageNotShown] = useState(false);
  const [isBirthDayNotSet, setIsBirthDayNotSet] = useState(false);
  const [isNameNotSet, setIsNameNotSet] = useState(true);
  const [omitedBirthday, setOmitedBirthday] = useState(false);
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isPrivacyNotAccepted, setIsPrivacyNotAccepted] = useState(true)
  const [membershipToOneRestaurant, setMembershipToOneRestaurant] = useState(false)



  const setAuthTokens = (data) => {
    if (data != null && data != 'null') {
      _setAuthTokens(data);
      setUser(jwtDecode(data?.access));
      SecureStore.setItemAsync("authTokens", JSON.stringify(data))
    } else {
      _setAuthTokens(null);
      setUser(null);
      setOmitedBirthday(false)
      SecureStore.setItemAsync("authTokens", 'null')
    }
  };

  const getUserData = async () => {
    const res = await fetch(
      BASE_URL + "digital-chef-auth-flow/",
      {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );

    var jsonData2 = await res.json();
    if (res.status === 200) {
      setIsNameNotSet(jsonData2.nombre == null);
      setIsPrivacyNotAccepted(!jsonData2.shown_privacy_policy)
      setName(jsonData2.nombre)
      setEmail(jsonData2.user__email)
      setMembershipToOneRestaurant(jsonData2.true_or_false_membership)
    } else {
      logOut()
    }
  };

  const getToken = async () => {
    try {
      const token = JSON.parse(await SecureStore.getItemAsync("authTokens"));
      if (token !== null || token !== "null") {
        let response = await fetch(
          BASE_URL + "auth-refresh-digital-chef/",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: token?.refresh }),
          }
        );
        const data = await response.json();

        if (response.status === 200) {
          setAuthTokens(data);
        } else {
          logOut();
        }
      } else {
        logOut();
      }
    } catch (error) {
      Alert.alert("Error con la autenticación: ", error.message);
    }
  };

  const logOut = async () => {
    setAuthTokens(null);
  };

  const updateToken = async () => {
    let response = await fetch(
      BASE_URL + "auth-refresh-digital-chef/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: authTokens?.refresh }),
      }
    );
    const data = await response.json();

    if (response.status === 200) {
      setAuthTokens(data);
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    let interval = setInterval(async () => {
      if (authTokens) {
        let updatedSuccessfully = await updateToken();
        if (updatedSuccessfully == true) {
        } else {
          logOut();
        }
      }
    }, 60 * 60 * 23 * 1000);
    return () => clearInterval(interval);
  }, [authTokens]);

  const logIn = async ({ email, password, setLoading }) => {
    let response = await fetch(
      BASE_URL + "auth-token-digital-chef/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toString(),
          password: password.toString(),
        }),
      }
    );
    const data = await response.json();
    if (response.status === 200) {
      setAuthTokens(data);
    } else {
      Alert.alert(
        "Ha habido un error",
        "Has introducido la contraseña o el email incorrectamente"
      );
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      authTokensObject: [authTokens, setAuthTokens],
      userObject: [user, setUser],
      phoneVerifiedObject: [phoneVerified, setPhoneVerified],
      signInFunction: logIn,
      updateTokenFunction: updateToken,
      logOutFunction: logOut,
      getUserData: getUserData,
      signIn: [isNotSignedIn, setIsNotSignedIn],
      verifiedEmail: [isUnverifiedEmail, setIsUnverifiedEmail],
      invitation: [isInvitationPageNotShown, setIsInvitationPageNotShown],
      birthDay: [isBirthDayNotSet, setIsBirthDayNotSet],
      nameSate: [isNameNotSet, setIsNameNotSet],
      omitBirthday: [omitedBirthday, setOmitedBirthday],
      nameStateDetail: [name, setName],
      emailDetail: [email, setEmail],
      privacyAcceptation: [isPrivacyNotAccepted, setIsPrivacyNotAccepted],
      restaurantMembership:  [membershipToOneRestaurant, setMembershipToOneRestaurant], 
    }),
    [
      authTokens,
      user,
      isNotSignedIn,
      isUnverifiedEmail,
      isInvitationPageNotShown,
      isBirthDayNotSet,
      isNameNotSet,
      omitedBirthday,
      phoneVerified,
      name,
      email,
      isPrivacyNotAccepted,
      membershipToOneRestaurant,
    ]
  );

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
    </AuthFlowContext.Provider>
  );
};

export default AuthFlowProvider;

//REPASADO Y LIMPIO
