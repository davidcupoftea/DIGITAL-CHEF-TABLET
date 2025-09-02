import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Carrito from "./Carrito.jsx";
import ElegirProductoSection from "./ElegirProductoSection.jsx";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { OrderContext } from "./OrderContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
  WARNING_NOT_SCROLLABLE,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

function ElegirProductos() {
  const [loading, setLoading] = useState(true);
  const [dishes, setDishes] = useState([]);
  const [categoriesVisible, setCategoriesVisible] = useState({});

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const navigation = useNavigation();

  let { order, setOrder } = useContext(OrderContext);

  useEffect(() => {
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
        
        {order.products.length > 0 ? <View style={styles.somepadding}><Carrito /></View> : null}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
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

              <ElegirProductoSection
                displayed={categoriesVisible[index]}
                anotherkey={index}
                dishes={element.dishes}
              ></ElegirProductoSection>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.googlesign}
        onPress={() => {
          if (order.products.length == 0) {
            Alert.alert("¡No hay nada en el carrito!");
          } else {
            navigation.navigate("Sugerencias y Cupones")
          }
        }}
      >
        <Text style={styles.googlesigntext}>Continuar</Text>
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
    fontFamily: 'Function-Regular',
  },
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
  },
  somepadding: {
    padding: 15,

  },
  googlesign: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    margin: 15,
    textAlign: "center",
  },
  googlesigntext: {
    color: "black",
    textAlign: "center",
    fontSize: 25,
    fontFamily: 'Function-Regular',
  },
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: 'Function-Regular',
  },
});
export default ElegirProductos;

//REPASADO Y LIMPIADO
