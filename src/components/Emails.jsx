import { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ActivityIndicator, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
  WARNING_NOT_SCROLLABLE,
} from "../services/index.jsx";
import EmailInList from "./EmailInList.jsx"
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const Emails = ({ route}) => {
  const navigation = useNavigation();
  const [emails, setEmails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false)
  const [gotten, setGotten] = useState(false);

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const fetchEmails = async (restaurantChosen_pk) => {
    setLoaded(false)
    const res = await fetch(
      BASE_URL + "ver-emails-digital-chef/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    var jsonData = await res.json();

    if (jsonData.status == "No tienes acceso a estos datos") {
      setGotten(false);
      setLoading(false);
      setLoaded(true)
    } else {
      setEmails([])
      setEmails([...jsonData]);
      setGotten(true);
      setLoading(false);
      setLoaded(true)
    }

    return jsonData;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (authTokens != null && authTokens != "null") {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchEmails(restaurantChosen_pk);
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.ofertas}>
                {WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo los emails del restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}
      <ScrollView>
          {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo los emails del restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}
        {loading && !gotten ? (
          <ActivityIndicator size={33} />
        ) : !loading && !gotten ? (
          <Text style={styles.textsmall}>No puedes acceder a estos datos</Text>
        ) : (
            emails.map((email, index)=>(
            <EmailInList key={index} email={email}></EmailInList>
            ))
        )}

        {loaded && !loading && emails.length == 0 ? <Text style={styles.textsmall}>No hay emails</Text>:null}
      </ScrollView>
            <TouchableOpacity
        style={styles.reservation}
        onPress={() => {
          navigation.navigate("Creación de email");
        }}
      >
        <Text style={styles.reservationtext}>Crear email</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ofertas: {
    flex: 1,
    flexGrow: 1,
  },
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
reservationtext: {
    color: 'black',
    textAlign: 'center',
    fontSize: 28,
    fontFamily: "Function-Regular",
},
  reservation: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    margin: 15,
  },
});

export default Emails;

//REPASADO Y LIMPIADO
