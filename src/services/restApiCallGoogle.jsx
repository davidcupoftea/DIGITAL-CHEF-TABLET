import { Alert } from 'react-native';
import { BASE_URL } from './index.jsx';


async function getUserInfoFromGoogleApi(token, dispositivo) {
  if (!token) {
    Alert.alert("There is no token");
    return
  }
  if (!dispositivo) {
    Alert.alert("There is no device");
    return
  }
  try {
    const response = await fetch(BASE_URL + "get-google-account-digital-chef/", {
      method: 'POST',
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
      },
      body: JSON.stringify({'token': token, 'dispositivo': dispositivo}),
  });
    return await response.json();
  } catch (error) {
    return error;
  }
}

export { getUserInfoFromGoogleApi };
