import { BASE_URL } from ".";

async function getUserInfoFromAppleApi(dataInfo, dispositivo) {
  if (!dataInfo) {
    Alert.alert('There is no info!')
    return
  }
  if (!dispositivo) {
    Alert.alert('There is no device!')
    return
  }
  try {
    const response = await fetch(BASE_URL + "get-apple-account-digital-chef/", {
      method: 'POST',
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
      },
      body: JSON.stringify({'dataInfo': dataInfo, 'dispositivo': dispositivo}),
  });
    return response.json();
  } catch (error) {
    return error;
  }
}


export { getUserInfoFromAppleApi };