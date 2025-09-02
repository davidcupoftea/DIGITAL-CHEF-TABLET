import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import SorteosList from "./SorteosList";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
  WARNING_NOT_SCROLLABLE
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const Sorteos = ({ onlylastweek = false, route }) => {
  const navigation = useNavigation();

  const [sorteos, setSorteos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gotten, setGotten] = useState(false);

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const fetchSorteos = async (restaurantChosen_pk) => {
    const res2 = await fetch(
      BASE_URL + "sorteos-digital-chef/" + restaurantChosen_pk + "/",
      {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );

    var jsonData2 = await res2.json();
    if (jsonData2.status == "No tienes acceso a estos datos") {
      setGotten(false);
      setLoading(false);
    } else {
      setSorteos([])
      setSorteos(jsonData2);
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
        fetchSorteos(restaurantChosen_pk);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const getSorteos = async () => {
      if (route.params?.refresh) {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchSorteos(restaurantChosen_pk);
        navigation.setParams({ refresh: false });
      }
    };
    getSorteos();
  }, [route.params?.refresh]);

  return (
    <View style={styles.ofertas}>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás viendo el feed de sorteos del restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
      ) : null}
      <ScrollView>
        {loading && !gotten ? (
          <ActivityIndicator size={33} />
        ) : !loading && !gotten ? (
          <Text style={styles.textsmall}>No puedes acceder a estos datos</Text>
        ) : (
          <SorteosList
            onlylastweek={onlylastweek}
            sorteos={[...sorteos]}
            fetchSorteos={fetchSorteos}
          />
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.reservation}
        onPress={() => {
          navigation.navigate("Creación de sorteo");
        }}
      >
        <Text style={styles.reservationtext}>Crear sorteo</Text>
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
  ofertas: {
    flex: 1,
    flexGrow: 1,
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
});

export default Sorteos;

//REPASADO Y REVISADO
