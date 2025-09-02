import { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ActivityIndicator, Text, ScrollView, TouchableOpacity } from "react-native";
import NewsList from "./NewsList";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
  WARNING_NOT_SCROLLABLE,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const Noticias = ({ onlylastweek = false , route}) => {
  const navigation = useNavigation();
  const [noticias, setNoticias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gotten, setGotten] = useState(false);

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const fetchNoticias = async (restaurantChosen_pk) => {
    const res = await fetch(
      BASE_URL + "novedades-digital-chef/" + restaurantChosen_pk + "/",
      {
        method: "GET",
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
    } else {
      setNoticias([])
      setNoticias([...jsonData]);
      setGotten(true);
      setLoading(false);
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
        fetchNoticias(restaurantChosen_pk);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const getNoticias = async () => {
      if (route.params?.refresh) {
        const pk_restaurante_elegido = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchNoticias(pk_restaurante_elegido);
        navigation.setParams({ refresh: false });
      }
    };
    getNoticias();
  }, [route.params?.refresh]);

  return (
    <View style={styles.ofertas}>
                {WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo el feed de noticias del restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}
      <ScrollView>
        {loading && !gotten ? (
          <ActivityIndicator size={33} />
        ) : !loading && !gotten ? (
          <Text style={styles.textsmall}>No puedes acceder a estos datos</Text>
        ) : (
          <NewsList onlylastweek={onlylastweek} noticias={[...noticias]} fetchNoticias={fetchNoticias} />
        )}
      </ScrollView>
      <TouchableOpacity
          style={styles.reservation}
          onPress={() => {
            navigation.navigate("Creación de novedad");
          }}
        >
          <Text style={styles.reservationtext}>Crear novedad</Text>
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
  reservation: {
    backgroundColor: 'white',
    padding: 15,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 15,
    margin: 15,

},
reservationtext: {
    color: 'black',
    textAlign: 'center',
    fontSize: 28,
    fontFamily: "Function-Regular",
}
});

export default Noticias;

//REPASADO Y LIMPIO
