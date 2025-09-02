import { useEffect, useState, useContext } from "react";
import { View, ScrollView, Alert, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import Carrito from "./Carrito.jsx";
import Decimal from "decimal.js";
import UpsellContainer from "./UpsellContainer.jsx";
import CrossSellContainer from "./CrossSellContainer.jsx";
import CodeContainer from "./CodeContainer.jsx";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { OrderContext } from "./OrderContextProvider.jsx";
import { BASE_URL, WARNING_NOT_SCROLLABLE } from '../services/index.jsx';
import getAndSetRestaurant from '../services/apiCallFavouriteRestaurant.jsx'


const ConfirmarPedido = () => {
  const [loading, setLoading] = useState(true)
  const [upsells, setUpsells] = useState([])
  const [crossSells, setCrossSells] = useState([])
  const [codes, setCodes] = useState([])

  const { authTokensObject, nameStateDetail , emailDetail} = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  let { order, setOrder } = useContext(OrderContext);
  const navigation = useNavigation()


  const fetchSuggestionsAndCoupons = async (restaurantChosen_pk) => {
    const res = await fetch(BASE_URL + 'suggestions-and-coupons-dc/' + restaurantChosen_pk + '/', {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + String(authTokens?.access)
        },
        body: JSON.stringify({ orden: order }),
    })

    var jsonData2 = await res.json()

    if (jsonData2.status == 'ok') {
      setUpsells(jsonData2.data.upsells)
      setCrossSells(jsonData2.data.cross_sells)
      setCodes(jsonData2.data.coupons_available)
      setLoading(false)
    }
}

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (order.products.length == 0) {
        navigation.goBack();
      }
    });
    return unsubscribe;
  }, [navigation, order]);

  useEffect(() => {

    const updateSuggestions = async () => {

      if (authTokens != null && authTokens != 'null'){
        const restaurantChosen_pk = await getAndSetRestaurant(authTokens?.access, setRestaurantChosen);
        fetchSuggestionsAndCoupons(restaurantChosen_pk);
      }
    }
    updateSuggestions();
  }, [navigation, order.products]);

  const continueOrder = () => {
    
    const total = () => {
      let totalNumber = new Decimal('0')
      for (i=0; i<order.products.length; i++){
          var newToAdd = new Decimal(order.products[i].price.toString()).times(order.products[i].quantity)
          totalNumber = totalNumber.plus(newToAdd)
      }
      if (order.coupon){
      totalNumber = totalNumber.minus((new Decimal(order.coupon.discount.toString()).times(new Decimal(order.coupon.dish.price)).div(100)).toDP(2, Decimal.ROUND_DOWN))
      }
      return new Decimal(totalNumber.toString())
  }
    const totalAmount = total()
    // if (totalAmount == 0){
    //   Alert.alert('No puedes hacer un pedido de 0 €')
    //   return
    // }

    navigation.navigate("Confirmar Pedido");
  }

  return (
    <View style={styles.container}>
      {WARNING_NOT_SCROLLABLE? <Text style={styles.textsmall}>Estás a punto de hacer un pedido en el restaurante {restaurantChosen.franchise} localizado en {restaurantChosen.address}</Text>: null}
      <ScrollView>
      {!WARNING_NOT_SCROLLABLE? <Text style={styles.textsmall}>Estás a punto de hacer un pedido en el restaurante {restaurantChosen.franchise} localizado en {restaurantChosen.address}</Text>: null}
  
        <View style={styles.screen}>
          <Carrito />
          {loading ? <ActivityIndicator size="large"></ActivityIndicator>:(
            <>
          <Text style={styles.textBold}>¿Quieres mejorar tu pedido?</Text>
          {upsells.length != 0? 
          (<UpsellContainer upsells={[...upsells]}></UpsellContainer>) : <Text style={styles.textsmall}>No hay mejoras indicadas para lo que has pedido.</Text>}
          <Text style={styles.textBold}>¿Quieres añadir más cosas a tu pedido?</Text>
          {crossSells.length != 0?
          <CrossSellContainer crosssells={[...crossSells]}></CrossSellContainer>: <Text style={styles.textsmall}>No hay sugerencias adicionales para lo que has pedido.</Text>}
          <Text style={styles.textBold}>Elige un cupón</Text>
          {codes.length != 0?
          <CodeContainer codes={[...codes]}></CodeContainer>:<Text style={styles.textsmall}>No hay cupones para lo que has pedido.</Text>}
          </>)
}
        </View>
      </ScrollView>
      <TouchableOpacity
        disabled={loading}
        style={styles.googlesign}
        onPress={() => {
          continueOrder();
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
  textBold: {
    color: 'white',
    fontSize: 35,
    textAlign: 'center',
    fontFamily: 'Function-Regular',

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
    fontSize: 20,
    fontFamily: 'Function-Regular',
  },
});
export default ConfirmarPedido;

//REPASADO Y LIMPIADO
