import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import CartaDropDownSection from "./CartaDropDownSection.jsx";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { OrderContext } from "./OrderContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL, WARNING_NOT_SCROLLABLE } from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import DishInMenu from "./DishInMenu.jsx";

function ElegirProductos() {
  const [loading, setLoading] = useState(true);
  const [loadingSecond, setLoadingSecond] = useState(true);
  const [dishes, setDishes] = useState([]);
  const [sections, setSections] = useState([]);
  const [categoriesVisible, setCategoriesVisible] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [specificDishesFlag, setSpecificDishesFlag] = useState(false);
  const [specificDishes, setSpecificDishes] = useState([]);

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const navigation = useNavigation();

  let { order, setOrder } = useContext(OrderContext);

  const confirmHideAllDishes = () => {
    Alert.alert(
      "Confirmar acción",
      "¿Estás seguro de que quieres ocultar todos los platos?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => hideAllDishes(), // 👈 ejecuta la función solo si confirma
        },
      ],
      { cancelable: true }
    );
  };

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
        completeFunction(restaurantChosen.pk);
      } else {
        Alert.alert("Error", json.message || "No se pudo ocultar los platos");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor" + e);
    }
  };

  const renderItem = ({ item }) => {
    return <DishInMenu item={item} />;
  };

  const fetchSpecificDishes = async () => {
    const restaurant_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    let response = await fetch(
      BASE_URL + "specific-dishes/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ search_term: searchTerm }),
      }
    );
    const data = await response.json();
    setSpecificDishes(data);
  };

  useEffect(() => {
    if (searchTerm.trim() != "") {
      fetchSpecificDishes();
      setSpecificDishesFlag(true);
    } else {
      setSpecificDishesFlag(false);
      setSpecificDishes([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (searchTerm.trim() != "") {
        fetchSpecificDishes();
        setSpecificDishesFlag(true);
      } else {
        setSpecificDishesFlag(false);
        setSpecificDishes([]);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const completeFunction = async (restaurantChosen_pk) => {
    setDishes([]);
    setCategoriesVisible({});
    const fetchNumberOfMenuCategories = async (restaurantChosen_pk) => {
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
      } else {
        return jsonData["menu_categories"];
      }
    };

    const result = await fetchNumberOfMenuCategories(restaurantChosen_pk);
    await getAllDishes(restaurantChosen_pk, result);
    await setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      completeFunction(restaurantChosen_pk);
    });
    return unsubscribe;
  }, [navigation]);

  var getAllDishes = async (restaurantChosen_pk, number) => {
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

      if (!jsonData.menu_category || jsonData.dishes.length === 0) {
        return;
      }
      setDishes((prevState) => {
        const data = [...prevState, jsonData];
        data.sort((a, b) => Number(a.order) - Number(b.order));
        return data;
      });
    };

    let funcArray = [];
    let array = [];

    for (let i = 1; i < number + 1; i++) {
      funcArray.push(myFunc(i));
      array.push(i.toString());
      setCategoriesVisible((prevState) => ({ ...prevState, [i]: false }));
    }
    await Promise.all(funcArray);
  };

  return (
    <View style={styles.container}>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás viendo la carta y a punto de hacer un pedido en el restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
      ) : null}

      <ScrollView>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo la carta y a punto de hacer un pedido en el restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}
        <Text style={styles.textsmall}>
          Añade una categoría de platos/bebidas{" "}
          <Text
            style={styles.textunderscored}
            onPress={() => {
              navigation.navigate("Crear Categoría del Menú");
            }}
          >
            aquí.
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.hideDishesButton}
          onPress={confirmHideAllDishes}
        >
          <Text style={styles.hideDishesText}>Ocultar todos los platos</Text>
        </TouchableOpacity>

        <Text style={styles.textsmall}>Busca aquí:</Text>
        <TextInput
          style={styles.textinput}
          onChangeText={setSearchTerm}
          value={searchTerm}
        ></TextInput>

        {specificDishesFlag ? (
          <View style={styles.screen}>
            <FlatList
              data={specificDishes}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              maxToRenderPerBatch={3}
              updateCellsBatchingPeriod={1000}
              initialNumToRender={3}
              windowSize={3}
            />
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" />
        ) : !specificDishesFlag ? (
          dishes.map((element, index) => (
            <View key={index}>
              <TouchableOpacity
                onPress={() => {
                  const numberOfCategoriesVisible =
                    Object.keys(categoriesVisible).length;
                  newState = {};

                  for (let i = 0; i < numberOfCategoriesVisible; i++) {
                    if (i != index) {
                      newState[i] = false;
                    } else {
                      newState[i] = !categoriesVisible[i];
                    }
                  }
                  setCategoriesVisible(newState);
                }}
              >
                <Text style={styles.textBold}>
                  {element.menu_category}{" "}
                  <Image
                    style={{ height: 12, width: 20 }}
                    source={
                      categoriesVisible[index]
                        ? require("../../assets/arrow-up-white.png")
                        : require("../../assets/arrow-down-white.png")
                    }
                  />
                </Text>
              </TouchableOpacity>

              <CartaDropDownSection
                displayed={categoriesVisible[index]}
                anotherkey={index}
                dishes={element.dishes}
              ></CartaDropDownSection>
            </View>
          ))
        ) : null}
      </ScrollView>
      <TouchableOpacity
        style={styles.reservation}
        onPress={() => {
          navigation.navigate("Creación de plato");
        }}
      >
        <Text style={styles.reservationtext}>Crear plato</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  textBold: {
    color: "white",
    fontSize: 30,
    textAlign: "center",
    marginTop: 15,
    fontFamily: "Function-Regular",
  },
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
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
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
  textunderscored: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
    textDecorationLine: "underline",
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
    textAlign: "center",
    margin: 15,
  },
  screen: {
    paddingHorizontal: Dimensions.get("window").width * 0.05,
    backgroundColor: "rgb(107,106,106)",
  },
  hideDishesButton: {
    backgroundColor: "rgb(107,106,106)", // igual que screen
    padding: 8,
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
export default ElegirProductos;

//REPASADO Y LIMPIADO
