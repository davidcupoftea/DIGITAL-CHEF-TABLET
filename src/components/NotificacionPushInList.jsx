import { useState, memo, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL
} from "../services/index.jsx";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const NotificacionPushInList = ({ email }) => {
  let { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const [campaignInCourse, setCampaignInCourse] = useState(false)
  const [likeFranchise, setLikeFranchise] = useState(false)

  const [started, setStarted] = useState(email.started)

  const navigation = useNavigation();

  const iniciarCampaña = async () => {
    const restaurant_pk = await getAndSetRestaurant(authTokens?.access, setRestaurantChosen)
    setCampaignInCourse(true)
    const res = await fetch(BASE_URL + "iniciar-campaña-push/" + restaurant_pk + '/' + email.id + '/', {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
      body: JSON.stringify({pk: email.id, like_franchise: likeFranchise }),
    });

    var jsonData = await res.json();
    if (jsonData.status == 'ok'){
      Alert.alert('¡Campaña realizada exitosamente!')
      setCampaignInCourse(false)
      setStarted(true)
    } else if (jsonData.status == 'nook'){
      Alert.alert('No se ha podido realizar la campaña:', jsonData.message)
      setCampaignInCourse(false)
    }
  }


  return (
    <>
      <View>
        <View style={styles.card}>
          <View>
            <Text style={styles.text}>Título:{'\n'}{email.name}</Text>
          </View>
          <View>
            <Text style={styles.text}>Cuerpo:{'\n'}{email.push}</Text>
          </View>
          <View>
            <Text style={styles.text}>Fecha de creación:{'\n'}{email.date_created.slice(0,10)} a las {email.date_created.slice(11,19)}</Text>
          </View>
          <BouncyCheckbox
            size={25}
            isChecked={likeFranchise}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Enviar como franquicia (a todos los usuarios)"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "black",
              textDecorationLine: "none",
            }}
            onPress={(likeFranchise)=>{
              setLikeFranchise(!likeFranchise)
            }}
          />
          {campaignInCourse? <ActivityIndicator size="large" />: null}
          {!started ? 
          <TouchableOpacity
                  onPress={() => {
                    iniciarCampaña();
                  }}
                  style={styles.button}
                >
                  <Text style={styles.textbutton}>Iniciar campaña</Text>
          </TouchableOpacity>:
          <Text style={styles.textstarted}>El envío de este email ya se ha iniciado</Text>}

          {!started ? 
          <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Edición de notificación', { eventId: email.id, refresh: true })
                  }}
                  style={styles.buttongreen}
                >
                  <Text style={styles.textbutton}>Editar Notificación</Text>
          </TouchableOpacity>:
          <Text style={styles.textstarted}>El envío de este email ya se ha iniciado, no se puede editar la notificacion push</Text>}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 30,
    marginHorizontal:15,
    padding: 5,
  },
  text: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
    textstarted: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 50,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  buttongreen: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "green",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 30,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  textbutton: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  }
});

export default memo(NotificacionPushInList);

//REPASADO Y LIMPIO
