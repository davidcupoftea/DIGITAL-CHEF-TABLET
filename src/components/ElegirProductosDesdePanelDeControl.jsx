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
  TextInput
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

const ElegirProductos = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const [dishes, setDishes] = useState([]);
  const [categoriesVisible, setCategoriesVisible] = useState({});
  const [email, _setEmail] = useState("anonimo3571@anonimo3571.es");


  const setEmail = (value) => {
    _setEmail(value);
    setOrder({ ...order, email: value});
  };

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

  useEffect(() => {
    if (route.params?.mesa) {
      setOrder({
        products: [],
        email: email,
        delivery: false,
        takeaway: false,
        fromtable:true,
        numberOfTable: route.params.mesa,
      });
    }
  }, [route.params]);

  return (
    <View style={styles.container}>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás viendo la carta y a punto de hacer un pedido en la mesa "
          {order.numberOfTable}" en el restaurante {restaurantChosen.franchise}{" "}
          localizado en {restaurantChosen.address}
        </Text>
      ) : null}

      <ScrollView>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo la carta y a punto de hacer un pedido en la mesa "
            {order.numberOfTable}" en el restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}
        <Text style={styles.textBold}>Email (Opcional):</Text>
        <TextInput
          style={styles.textinput}
          placeholder="El email de la persona que recibe el pedido"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="white"
          editable={true}
        />
        {email == "anonimo3571@anonimo3571.es" ? (
          <Text style={styles.texterror}>
            El email es opcional, pero ALTAMENTE recomendado
          </Text>
        ) : null}
        {!email ? <Text style={styles.texterror}>No puedes dejar el campo de email vacío</Text>:null}

        {order.products.length > 0 ? (
          <View style={styles.somepadding}>
            <Carrito />
          </View>
        ) : null}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          dishes.map((element, index) => (
            element.dishes && element.dishes.length > 0 ? (
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
            </View>):null
          ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.googlesign}
        onPress={() => {
          if (order.products.length == 0) {
            Alert.alert("¡No hay nada en el carrito!");
          } else {
            navigation.navigate("Sugerencias y Cupones");
          }
        }}
      >
        <Text style={styles.googlesigntext}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontFamily: "Function-Regular",
  },
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
  texterror: {
    color: "red",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: 'Function-Regular',
  },
textBold: {
    color: "white",
    fontSize: 35,
    textAlign: "center",
    marginTop: 15,
    fontFamily: 'Function-Regular',
  },
textinput: {
    padding: 10,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    margin: 10,
  },
});
export default ElegirProductos;

//REPASADO Y LIMPIO
