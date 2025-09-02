import { useContext, useEffect } from "react";
import SignIn from "./SignIn";
// import EmailConfirmation from "./EmailConfirmation";
// import EmailChange from "./EmailChange";
// import Invitation from "./Invitation";
// import BirthdayDate from "./BirthdayDate";
import Name from "./Name";
import { MyDrawer } from "../../navigation/drawer";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInWithEmail from './SignInWithEmail.jsx'
import SignUpWithEmail from './SignUpWithEmail.jsx'
import ResetPassword from './ResetPassword.jsx'
import ResetPasswordDone from './ResetPasswordDone.jsx'
import AskResettingPassword from './AskResettingPassword.jsx'
import TermsAndPrivacy from './TermsAndPrivacy.jsx'
import ClaimMembershipToRestaurant from './ClaimMembershipToRestaurant.jsx'


const Stack = createNativeStackNavigator();

const Navigator = () => {
  const { authTokensObject, userObject, signIn, verifiedEmail, invitation, birthDay, nameSate, omitBirthday, getUserData, privacyAcceptation, restaurantMembership } =
    useContext(AuthFlowContext);

  const [authTokens, setAuthTokens] = authTokensObject;
  const [isNotSignedIn, setStateNotSignedIn] = signIn;
  const [isUnverifiedEmail, setStateNotVerifiedEmail] = verifiedEmail;
  const [isInvitationPageNotShown, setIsInvitationPageNotShown] = invitation;
  const [isBirthDayNotSet, setIsBirthDayNotSet] = birthDay;
  const [isNameNotSet, setIsNameNotSet] = nameSate;
  const [omitedBirthday, setOmitedBirthday] = omitBirthday;
  const [isPrivacyNotAccepted, setIsPrivacyNotAccepted] = privacyAcceptation;
  const [membershipToOneRestaurant, setMembershipToOneRestaurant] = restaurantMembership;

  useEffect(() => {
    if (authTokens != null && authTokens != 'null') {
      getUserData();
      setStateNotSignedIn(false);
    } else if (authTokens == null || authTokens == 'null') {
      setStateNotSignedIn(true)
    }
  }, [authTokens])



  let componentToRender;

  switch (true) {
    case isNotSignedIn:
      componentToRender = <Stack.Navigator initialRouteName="Eligiendo el login">
        <Stack.Screen options={{ headerShown: false }} name="Eligiendo el login" component={SignIn} />
        <Stack.Screen options={{ headerShown: false }} name="Login con Email" component={SignInWithEmail} />
        <Stack.Screen options={{ headerShown: false }} name="Registrate con Email" component={SignUpWithEmail} />
        <Stack.Screen options={{ headerShown: false }} name="ResetPassword" component={ResetPassword} />
        <Stack.Screen options={{ headerShown: false }} name="ResetPasswordDone" component={ResetPasswordDone}/>
        <Stack.Screen options={{ headerShown: false }} name="AskResettingPassword" component={AskResettingPassword}/>
        </Stack.Navigator>;
      break;
    case isPrivacyNotAccepted:
      componentToRender = <Stack.Navigator><Stack.Screen options={{ title: 'Términos y Privacidad', headerStyle: {backgroundColor: 'rgb(107,106,106)'}, headerTitleAlign: 'center',   headerTitleStyle: {color: 'white', fontFamily: 'Function-Regular', fontSize: 30}}} name="Condiciones y Privacidad" component={TermsAndPrivacy} /></Stack.Navigator>;
      break;
    case isNameNotSet:
      componentToRender = <Stack.Navigator><Stack.Screen options={{ headerShown: false }} name="Nombre" component={Name} /></Stack.Navigator>;
      break;
    case !membershipToOneRestaurant:
      componentToRender = <Stack.Navigator><Stack.Screen options={{ title: 'Únete a un restaurante', headerStyle: {backgroundColor: 'rgb(107,106,106)'}, headerTitleAlign: 'center',   headerTitleStyle: {color: 'white', fontFamily: 'Function-Regular', fontSize: 30}}} name="Reclama acceso a un restaurante" component={ClaimMembershipToRestaurant} /></Stack.Navigator>;
      break;
    default:
      //componentToRender = <MyDrawer />;
      componentToRender = <Stack.Navigator><Stack.Screen options={{ headerShown: false }} name="Drawer" component={MyDrawer} /></Stack.Navigator>;
  }

  return <>{componentToRender}</>;
};

export default Navigator;

//REPASADO Y REVISADO
