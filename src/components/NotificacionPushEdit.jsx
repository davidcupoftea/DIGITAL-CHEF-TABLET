import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { useNavigation } from "@react-navigation/native";
import {
  BASE_URL,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const NotificacionPushEdit = (variable) => {

  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [disabled, setDisabled] = useState(false)

  const navigation = useNavigation();

  const updateEmail = async () => {
    if (description.length > 240){
      Alert.alert('¡La descripción tiene que ser menor de 240!')
      return
    }
    setDisabled(true)
    const restaurant_pk = await getAndSetRestaurant(authTokens?.access, setRestaurantChosen)
    setDisabled(true)
      let response = await fetch(
      BASE_URL + "update-push/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ title: title, description: description, push_pk: variable.route.params.eventId}),
      }
    );
    const data = await response.json();

    if (data.status === 'ok') {
      Alert.alert('¡Email guardado!')
      setDisabled(false)
      navigation.goBack()

    } else {
      Alert.alert('Error',data.message)
      setDisabled(false)
    }
  }

   const getEmail = async (restaurant_pk, email_pk) => {
      let response = await fetch(
      BASE_URL + "ver-push-digital-chef/" + restaurant_pk + "/" + email_pk + '/',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    const data = await response.json();
    setTitle(data.name)
    setDescription(data.push)


  }

  useEffect(()=>{
    const fetchEmail = async () => {
        const restaurant_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      await getEmail(restaurant_pk, variable.route.params.eventId)
      navigation.setParams({ refresh: false });
    }
    if (variable.route.params.refresh){
    fetchEmail()
    }

  },[variable.route.params.refresh])

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;


  return (
    <>
      <ScrollView style={styles.scrollviewable}>
        <View style={styles.viewable}>
          <View>
            <Text style={styles.text}>Título</Text>
            <TextInput
              style={styles.textinput}
              onChangeText={setTitle}
              value={title}
            ></TextInput>
          </View>
          <View>
            <Text style={styles.text}>Descripción</Text>
            <TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={4}
              onChangeText={setDescription}
              value={description}
            ></TextInput>
          </View>

          {disabled ? <ActivityIndicator size="large" /> : null}
          <TouchableOpacity
            disabled={disabled}
            activeOpacity={disabled ? 1 : 0.7} 
            style={styles.savebutton}
            onPress={() => {
              if (!disabled){
              updateEmail();
              }
            }}
          >
            <Text style={styles.savebuttontext}>Guardar notificación</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollviewable: {
    flex: 1,
    flexGrow: 1,
  },
  viewable: {
    padding: 20,
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  savebutton: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
  },
  savebuttontext: {
    fontSize: 26,
    padding: 5,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
});

export default NotificacionPushEdit;

//REPASADO Y LIMPIO
