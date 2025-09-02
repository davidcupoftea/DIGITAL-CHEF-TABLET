import { useEffect, useState, useContext } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  SectionList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import DishInMenu from "./DishInMenu.jsx"
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
  WARNING_NOT_SCROLLABLE,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

function Carta() {
  const [loading, setLoading] = useState(true);
  const [loadingSecond, setLoadingSecond] = useState(true);
  const [dishes, setDishes] = useState([]);
  const [sections, setSections] = useState([]);
  const [notAbleToFetch, setNotAbleToFetch] = useState(false)
  const navigation = useNavigation();

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

    const hideAllDishes = async () => {
    try {
      const res = await fetch(
        BASE_URL + "hide-all-dishes/" + restaurantChosen.pk + "/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens?.access),
          },
        }
      );
      const json = await res.json();
      if (json.status === "ok") {
        Alert.alert("Éxito", "Todos los platos se han ocultado correctamente");
      } else {
        Alert.alert("Error", json.message || "No se pudo ocultar los platos");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  useEffect(() => {
    const completeFunction = async (restaurantChosen_pk) => {
      const fetchNumberOfMenuCategories = async (restaurantChosen_pk) => {
        setDishes([]);
        const res = await fetch(
          BASE_URL +
            "number-of-category-dishes-dg/" +
            restaurantChosen_pk.toString() +
            "/",
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
        if (jsonData["menu_categories"] == 0) {
          setLoading(false);
          setLoadingSecond(false);
          if (jsonData['status']== 'nook'){
            setNotAbleToFetch(true)
            Alert.alert('Error', jsonData.message)
          }
        } else {
          return jsonData["menu_categories"];
        }
      };

      const getAllDishes = async (restaurantChosen_pk, number) => {
        const myFunc = async (param) => {
          const res = await fetch(
            BASE_URL +
              "menu-category-dishes-dg/" +
              restaurantChosen_pk.toString() +
              "/" +
              param.toString() +
              "/"
          );
          var jsonData = await res.json();
          jsonData["order"] = param.toString();
          setDishes((prevState) => {
            const data = [...prevState, jsonData];
            data.sort((a, b) => Number(a.order) - Number(b.order));
            newData = [...data];
            return newData;
          });
        };

        let funcArray = [];
        let array = [];

        for (let i = 1; i < number + 1; i++) {
          funcArray.push(myFunc(i));
          array.push(i.toString());
        }

        await Promise.all(funcArray);
      };

      const result = await fetchNumberOfMenuCategories(restaurantChosen_pk);
      await getAllDishes(restaurantChosen_pk, result);
      await setLoading(false);
    };

    const unsubscribe = navigation.addListener("focus", async () => {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      completeFunction(restaurantChosen_pk);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let dishes_array = [];
    dishes.map((dish) =>
      dishes_array.push({
        title: dish.menu_category,
        data: dish.dishes,
        renderItem: ({ item, index, section: { title, data } }) => (
          <DishInMenu item={item}></DishInMenu>
        ),
      })
    );
    setSections([...dishes_array]);
    setLoadingSecond(false);
  }, [loading, dishes]);

  return (
    <>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás viendo la carta del restaurante {restaurantChosen.franchise}{" "}
          localizado en {restaurantChosen.address}
        </Text>
      ) : null}
      <ScrollView style={styles.screen}>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo la carta del restaurante {restaurantChosen.franchise}{" "}
            localizado en {restaurantChosen.address}
          </Text>
        ) : null}
      <TouchableOpacity style={styles.hideDishesButton} onPress={hideAllDishes}>
        <Text style={styles.hideDishesText}>Ocultar todos los platos</Text>
      </TouchableOpacity>
        {notAbleToFetch ? (
          <Text style={styles.textsmall}>
            No puedes acceder a estos datos
          </Text>
        ) : loading || loadingSecond ? (
          <ActivityIndicator size="large" style={{ marginTop: 5 }} />
        ) : (
          <SectionList
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.textBoldCategory}>{title}</Text>
            )}
            sections={[...sections]}
            keyExtractor={(item, index) => item.dish + index}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.reservation}
        onPress={() => {
          navigation.navigate("Crea un plato");
        }}
      >
        <Text style={styles.reservationtext}>Crear plato</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
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
  screen: {
    marginHorizontal: Dimensions.get("window").width * 0.05,
    backgroundColor: "rgb(107,106,106)",
  },
  textBoldCategory: {
    color: "white",
    fontSize: 30,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 5,
    fontFamily: "Function-Regular",
  },
  textsmall: {
    color: "white",
    paddingTop: 15,
    padding: 15,
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
    hideDishesButton: {
    backgroundColor: "rgb(107,106,106)", // igual que screen
    padding: 15,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 5,
    margin: 15,
  },
  hideDishesText: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
});
export default Carta;

//REPASADO Y LIMPIADO
