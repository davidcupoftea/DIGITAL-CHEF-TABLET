import { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import ScaledImage from "./CustomFastAndFunctionalScaledImageContainerWidth.jsx";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { BASE_URL } from "../services/index.jsx";

const DishInMenu = (item) => {
  const [stockSold, setStockSold] = useState(item.item.stock_sold);
  const [visible, setVisible] = useState(item.item.visible);
  const [hidden, setHidden] = useState(false)

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  const [stock, setStock] = useState(item.item.stock);
  const [alreadySold, setAlreadySold] = useState(0);
  const [loadingUpdateQuantity, setLoadingUpdateQuantity] = useState(false);

  const navigation = useNavigation();

  const cambiarVisibilidad = async (pk) => {
    const res = await fetch(BASE_URL + "cambiar-visibilidad-plato/", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ dish_pk: pk }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });
    var jsonData = await res.json();
    if (jsonData.status == "ok") {
      Alert.alert(
        "Éxito",
        "Se ha cambiado la visibilidad de este plato correctamente"
      );
      setVisible(jsonData.visibility);
    } else {
      Alert.alert(
        "Error",
        "Ha habido un problema con la operación: " + jsonData.message
      );
    }
  };

  const actuallyDeleteDish = async (pk) => {
    const res = await fetch(BASE_URL + "borrar-plato/" + pk.toString() + '/', {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ dish_pk: pk }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },

    });
    var jsonData = await res.json();
    if (jsonData.status == "ok") {
      Alert.alert("Éxito", "Se ha borrado este plato correctamente");
      setHidden(true)
    } else {
      Alert.alert(
        "Error",
        "Ha habido un problema con la operación: " + jsonData.message
      );
    }
  };

  const borrarPlato = async (pk) => {
    Alert.alert(
      "Confirmar acción",
      "¿Estás seguro de que quieres borrar este plato?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => actuallyDeleteDish(pk), // 👈 ejecuta la función solo si confirma
        },
      ],
      { cancelable: true }
    );
  };

  const addOneMore = async (dish_pk) => {
    setLoadingUpdateQuantity(true);
    const res = await fetch(BASE_URL + "add-one-more-dish-stock/", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ dish_pk: dish_pk }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });
    var jsonData = await res.json();
    if (jsonData["status"] == "ok") {
      Alert.alert("Éxito", "Se ha aumentado la cantidad en 1");
      setStock(stock + 1);
      setLoadingUpdateQuantity(false);
    } else {
      Alert.alert("Error", jsonData.message);
      setLoadingUpdateQuantity(false);
    }
  };

  const addOneLessConfirmation = async (dish_pk) => {
    // Alert.alert(
    //   "¿Asociado a una venta?",
    //   "¿Este cambio de stock está asociado a una venta?",
    //   [
    //     {
    //       text: "No, no hay venta aquí",
    //       style: "cancel",
    //       onPress: async () => await addOneLess(dish_pk, false),
    //     },
    //     {
    //       text: "Sí, hay una venta aquí",
    //       onPress: async () => await addOneLess(dish_pk, true),
    //     },
    //   ]
    // );
    addOneLess(dish_pk, false);
  };

  const addOneLess = async (dish_pk, sold) => {
    setLoadingUpdateQuantity(true);
    const res = await fetch(BASE_URL + "add-one-less-dish-stock/", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ dish_pk: dish_pk, sold: sold }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });
    var jsonData = await res.json();
    if (jsonData["status"] == "ok") {
      Alert.alert("Éxito", "Se ha disminuido la cantidad en 1");
      setStock(stock - 1);
      if (stock - 1 == 0) {
        setVisible(false);
      }
      if (sold) {
        setStockSold(stockSold + 1);
      }
      setLoadingUpdateQuantity(false);
    } else {
      Alert.alert("Error", jsonData.message);
      setLoadingUpdateQuantity(false);
    }
  };

  if (hidden){
    return null
  }

  return (
    <View style={visible ? styles.greencard : styles.redcard}>
      {item.item.image_link !== null ? (
        <ScaledImage
          style={styles.image}
          uri={item.item.image_link}
          finalwidth={styles.image.width}
        />
      ) : null}
      <View style={styles.insidecard}>
        <Text style={styles.textBold}>{item.item.dish}</Text>
        <Text style={styles.text}>{item.item.description}</Text>
        <Text style={styles.textprice}>{item.item.price} €</Text>
        <Text style={styles.textprice}>
          Hoy se han entregado (o tienen que entregarse) ({stockSold}) unidades
          de este producto.
        </Text>
        {loadingUpdateQuantity ? <ActivityIndicator size="large" /> : null}
        <View style={styles.quantity}>
          <Text style={styles.text}>
            <TouchableOpacity
              onPress={() => {
                addOneLessConfirmation(item.item.id);
              }}
            >
              <Image
                style={{ height: 20, width: 25 }}
                source={require("../../assets/arrow-down2.png")}
              />
            </TouchableOpacity>{" "}
            Cantidad: {stock}{" "}
            <TouchableOpacity
              onPress={() => {
                addOneMore(item.item.id);
              }}
            >
              <Image
                style={{ height: 20, width: 25 }}
                source={require("../../assets/arrow-up2.png")}
              />
            </TouchableOpacity>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.navigate("Plato en detalle", { eventId: item.item.id });
          }}
        >
          <Text style={styles.textbutton}>Ver plato</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttongreen}
          onPress={() => {
            cambiarVisibilidad(item.item.id);
          }}
        >
          <Text style={styles.textbutton}>Cambiar visibilidad</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonred}
          onPress={() => {
            borrarPlato(item.item.id);
          }}
        >
          <Text style={styles.textbutton}>Borrar plato</Text>
        </TouchableOpacity>
        <Text style={styles.textBold}> PK: {item.item.id} </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: '100%'
  },
  quantity: {
    marginTop: 15,
    alignItems: "center",
  },
  greencard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "green",
    borderRadius: 30,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  redcard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "red",
    borderRadius: 30,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  text: {
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 20,
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  buttongreen: {
    marginBottom: 20,
    padding: 6,
    backgroundColor: "green",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  buttonred: {
    marginBottom: 20,
    padding: 6,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
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
  },
  textprice: {
    marginTop: 10,
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 20,
  },
  textBold: {
    color: "black",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Function-Regular",
  },
  insidecard: {
    padding: 15,
  },
});

export default DishInMenu;

//REPASADO Y LIMPIADO
