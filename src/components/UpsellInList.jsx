import { useContext } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity} from "react-native";
import ScaledImage from "./CustomFastAndFunctionalScaledImage";
import Decimal from 'decimal.js';
import { OrderContext } from './OrderContextProvider.jsx'

const UpsellInList = ({upsell}) => {

  let { order, setOrder } = useContext(OrderContext)

  const doUpsell = (original_dish_pk, upsell_dish) => {

    const elementOfOrder = order.products.findIndex(el => doesMatch(el, original_dish_pk))
    var newOrder = {...order}
    const quantityOriginal = newOrder.products[elementOfOrder].quantity
    if (quantityOriginal - 1 == 0){
      if (newOrder.coupon && newOrder.coupon.dish.id == original_dish_pk){
        delete newOrder.coupon
      }
      newOrder.products = newOrder.products.filter(el => doesNotMatch(el, original_dish_pk))
    } else {
      newOrder.products[elementOfOrder].quantity -= 1
    }
    var elementOfOrderUpsell = newOrder.products.findIndex(el => doesMatch(el, upsell_dish.id))
    if (elementOfOrderUpsell == -1){
    newOrder.products = [...newOrder.products, {...upsell_dish, 'quantity': 1}]
    } else {
      newOrder.products[elementOfOrderUpsell].quantity +=1
    }
    setOrder(()=> newOrder)


  }

  const doesMatch = (elm, toCheck) => elm.id === toCheck;
  const doesNotMatch = (elm, toCheck) => elm.id !== toCheck;


    return(
        <>
        <View style={styles.card}>

            <View style={styles.insidecard}>

            <View style={styles.original_dish}>
            <ScaledImage
              style={styles.image}
              uri={upsell.original_dish.image_link}
              finalwidth={styles.image.width}
            />
            <Text style={styles.upselltext}>{upsell.original_dish.dish}</Text>
            </View>

            <View style={styles.arrow}>
                <Image style={styles.arrow} source={require("../../assets/arrow-to-right.png")}finalwidth={{height: 50, width: 50}}/>
            </View>

            <View style={styles.original_dish}>
            <ScaledImage
              style={styles.image}
              uri={upsell.upsell.image_link}
              finalwidth={styles.image.width}
            />
            <Text style={styles.upselltext}>{upsell.upsell.dish}</Text>
            </View>
            </View>
            <View>
              <Text style={styles.text}>Mejora tu pedido por SÓLO {new Decimal(upsell.upsell.price).minus(new Decimal(upsell.original_dish.price)).toString()} € más</Text>
            </View>
            <TouchableOpacity
            style={styles.button}
            onPress={() => {
              doUpsell(upsell.original_dish.id, upsell.upsell)
            }}
          >
            <Text style={styles.textbutton}>Mejorar</Text>
          </TouchableOpacity>
            {/* <Text>UPSELL</Text> */}

        </View>
        
        </>
    )
}



const styles = StyleSheet.create({
    image: {
      width: 100,
      borderRadius: 5,
    },
    text: {
      textAlign: 'center',
      marginBottom: 10,

    },
    upselltext:{
      width: 100,
      textAlign: 'center',
    },
    card: {
      flexDirection: "column",
      justifyContent: "center",
      marginTop: 20,
      marginBottom: 20,
      padding: 20,
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "white",
      borderRadius: 10,
      elevation: 10,
      shadowOffset:{
          width: 5,
          height:5,
      },
      shadowColor: '#f0ffff',
      shadowOpacity: 0.8,
    },
    insidecard :{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 10,
    },
    original_dish:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    arrow:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        padding: 10,
    },
    button: {
        backgroundColor: "blue",
        padding: 15,
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 15,
      },
      textbutton: {
        color: "white",
        textAlign: "center",
        fontSize: 25,
        fontFamily: 'Function-Regular',
  }});

  export default UpsellInList;

  //REPASADO Y LIMPIO