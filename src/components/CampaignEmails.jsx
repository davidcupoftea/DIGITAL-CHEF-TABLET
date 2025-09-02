import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { useNavigation } from "@react-navigation/native";
import {
  BASE_URL,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const CampaignEmails = (variable) => {

  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [readOnes, setReadOnes] = useState(0)
  const [emailMessages, setEmailMessages] = useState([])

  const navigation = useNavigation();

   const getEmail = async (restaurant_pk, email_pk) => {
      let response = await fetch(
      BASE_URL + "ver-email-messages-digital-chef/" + restaurant_pk + "/" + email_pk + '/', //NO PROBLEMO CON ESTO, PODRÍA SER CUALQUIERA DE LOS RESTAURANTES_PK DE LA FRANQUICIA
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
    setDescription(data.email)
    setEmailMessages(data.messages)
    setReadOnes(data.read_ones)
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
              numberOfLines={5}
              onChangeText={setDescription}
              value={description}
            ></TextInput>
          </View>
          <View>
            <Text style={styles.text}>Leídos totales: {readOnes}</Text>
          </View>
          {emailMessages.length > 0 ? emailMessages.map((emailMessage, index)=>(
            <View key={index} style={styles.card}>
              <Text style={styles.textblack}>Email: {emailMessage.email_to_send_message.emailaddress}</Text>
              <Text style={styles.textblack}>Enviado: {emailMessage.sent ? '✅' : '❌'}</Text>
              <Text style={styles.textblack}>Leído: {emailMessage.read ? '✅' : '❌'}</Text>
            </View>
          )): <Text style={styles.text}>Extrañamente, no hay mensajes para esta campaña de email</Text>}
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
    card: {
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 30,
    marginHorizontal:15,
    padding: 5,
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
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
    textblack: {
    color: "black",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  }
});

export default CampaignEmails;

//REPASADO Y LIMPIADO
