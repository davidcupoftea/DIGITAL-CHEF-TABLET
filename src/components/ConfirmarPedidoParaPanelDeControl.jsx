import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from "react-native";
import Carrito from "./Carrito.jsx";
import FormaEntrega from "./FormaEntrega.jsx";
import Decimal from "decimal.js";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { OrderContext } from "./OrderContextProvider.jsx";
import {
  BASE_URL,
  WARNING_NOT_SCROLLABLE,
  checkTimeIsLower,
} from "../services/index.jsx";

const ConfirmarPedido = () => {
  const [disabled, setDisabled] = useState(false)
  const [warningTime, setWarningTime] = useState(false);
  const [warningPrice, setWarningPrice] = useState("");
  const { authTokensObject, nameStateDetail, emailDetail } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;
  const [annotationClient, _setAnnotationClient] = useState('')
  const [annotationRestaurant, _setAnnotationRestaurant] = useState('')

  const setAnnotationClient = (value) => {
    _setAnnotationClient(value)
    setOrder({...order, annotationClient: value})
  }

  const setAnnotationRestaurant = (value) => {
    _setAnnotationRestaurant(value)
    setOrder({...order, annotationRestaurant: value})
  }

  let { order, setOrder } = useContext(OrderContext);
  const navigation = useNavigation();

  var total = async () => {
    let totalNumber = new Decimal("0");
    for (i = 0; i < order.products.length; i++) {
      var newToAdd = new Decimal(order.products[i].price.toString()).times(
        order.products[i].quantity
      );
      totalNumber = totalNumber.plus(newToAdd);
    }
    if (order.coupon) {
      totalNumber = totalNumber.minus(
        new Decimal(order.coupon.discount.toString())
          .times(new Decimal(order.coupon.dish.price))
          .div(100)
          .toDP(2, Decimal.ROUND_DOWN)
      );
    }
    return totalNumber;
  };

  const sendDataForOrder = async () => {
    setDisabled(true)

    const quantity = await total();
    // if (quantity == 0) {
    //   Alert.alert("Error", "La cantidad no puede ser 0");
    //   return
    // }
  
    let response = await fetch(
      BASE_URL + "crear-orden-desde-el-restaurante/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ cantidad: quantity, orden: order }),
      }
    );

    const jsonData = await response.json();
    if (jsonData.status == 'ok'){
      Alert.alert('Éxito', "Se ha creado el pedido")
      setOrder({'products': []})
      navigation.popToTop()
    } else {
      Alert.alert('Error', jsonData.message)
    }
    setDisabled(false)
  }




  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (order.products.length == 0) {
        navigation.goBack();
      }

      if (order.annotationClient){
        _setAnnotationClient(order.annotationClient)
      }
      if (order.annotationRestaurant){
        _setAnnotationRestaurant(order.annotationRestaurant)
      }

      //ESTO DE AQUI ABAJO DESCOMENTARLO EN CUANTO SEA POSIBLE
      if (order.takeaway && order.takeawayTimeString) {
        const timeIsLowerWith15Minutes = checkTimeIsLower(order.takeawayTime, true);
        const timeIsLower = checkTimeIsLower(
          order.takeawayTime,
          false
        );
        if (timeIsLowerWith15Minutes && !timeIsLower) {
          Alert.alert(
            "Aviso",
            "Ten en cuenta que si dejas menos de 15 minutos para preparar el pedido no te garantizaremos que esté listo cuando llegues."
          );
          setWarningTime(true);
        } else if (timeIsLower){
          Alert.alert(
            "Aviso",
            "No podemos entregar un pedido a una hora ya pasada."
          );
        }
      }
      //ESTO DE AQUI ARRIBA DESCOMENTARLO EN CUANTO SEA POSIBLE
    });
    return unsubscribe;
  }, [navigation, order]);

  return (
    <View style={styles.container}>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás a punto de hacer un pedido en el restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
      ) : null}
      <ScrollView>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás a punto de hacer un pedido en el restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}

        <View style={styles.screen}>
          <Carrito editable={false}/>
          <FormaEntrega />
          <Text style={styles.textBold}>Anotaciones</Text>
          <Text style={styles.textsmall}>
            Anotaciones por parte del cliente:
          </Text>
          <TextInput
            style={styles.textinput}
            multiline={true}
            numberOfLines={4}
            onChangeText={setAnnotationClient}
            value={annotationClient}
          ></TextInput>
          <Text style={styles.textsmall}>
            Anotaciones por parte del restaurante:
          </Text>
          <TextInput
            style={styles.textinput}
            multiline={true}
            numberOfLines={4}
            onChangeText={setAnnotationRestaurant}
            value={annotationRestaurant}
          ></TextInput>
          {warningTime ? (
            <Text style={styles.textred}>
              Aviso: Ten en cuenta que si dejas menos de 15 minutos para
              preparar el pedido no te garantizaremos que esté listo cuando
              llegues.
            </Text>
          ) : null}
          {warningPrice ? (
            <Text style={styles.textred}>Aviso: {warningPrice}.</Text>
          ) : null}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.googlesign}
        onPress={() => { !disabled && sendDataForOrder();
        }}
      >
        <Text style={styles.googlesigntext}>Crear pedido</Text>
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
  screen: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
    paddingHorizontal: 20,
  },
  googlesign: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    margin: 15,
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
  },
  googlesigntext: {
    color: "black",
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
  textBold: {
    color: "white",
    fontSize: 35,
    textAlign: "center",
    marginTop: 15,
    fontFamily: "Function-Regular",
  },
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textred: {
    color: "red",
    marginTop: 15,
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
});
export default ConfirmarPedido;

//REVISADO Y LIMPIO
