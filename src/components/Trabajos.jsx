import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import TrabajosList from "./TrabajosList";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
  WARNING_NOT_SCROLLABLE,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const Trabajos = ({route}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [gotten, setGotten] = useState(false);
  const [trabajos, setTrabajos] = useState(null);

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const fetchTrabajos = async (restaurantChosen_pk) => {
    const res4 = await fetch(
      BASE_URL + "trabajos-digital-chef/" + restaurantChosen_pk + "/",
      {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    const jsonData4 = await res4.json();
    if (jsonData4.status == "No tienes acceso a estos datos") {
      setGotten(false);
      setLoading(false);
    } else {
      setTrabajos([])
      setTrabajos([...jsonData4]);
      setGotten(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (authTokens != null && authTokens != "null") {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchTrabajos(restaurantChosen_pk);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const getTrabajos = async () => {
      if (route.params?.refresh) {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchTrabajos(restaurantChosen_pk);
        navigation.setParams({ refresh: false });
      }
    };
    getTrabajos();
  }, [route.params?.refresh]);

  return (
    <View style={styles.ofertas}>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás viendo el feed de trabajos del restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
      ) : null}
      <ScrollView>
        {loading && !gotten ? (
          <ActivityIndicator size={33} />
        ) : !loading && !gotten ? (
          <Text style={styles.textsmall}>No puedes acceder a estos datos</Text>
        ) : (
          <TrabajosList
            trabajos={[...trabajos]}
            fetchTrabajos={fetchTrabajos}
          />
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.reservation}
        onPress={() => {
          navigation.navigate("Creación de trabajo");
        }}
      >
        <Text style={styles.reservationtext}>Crear trabajo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  reservation: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    margin: 15,
  },
  reservationtext: {
    color: "black",
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Function-Regular",
  },
  ofertas: {
    flex: 1,
    flexGrow: 1,
  },
});
export default Trabajos;

//REPASADO Y LIMPIADO
