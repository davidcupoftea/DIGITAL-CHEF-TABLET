import { useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import ScaledImage from "./CustomFastAndFunctionalScaledImage";
import { OrderContext } from './OrderContextProvider.jsx'

const CrossSellInList = ({crosssell}) => {

  let { order, setOrder } = useContext(OrderContext)

  const addCrossSell = (crosssell_dish) => {

    const elementOfOrder = order.products.findIndex(el => doesMatch(el, crosssell_dish.id))
    var newOrder = {...order}
    if (elementOfOrder == -1){
    newOrder.products = [...newOrder.products, {...crosssell_dish, 'quantity': 1}]
    } else {
      newOrder.products[elementOfOrder].quantity +=1
    }
    setOrder(()=> newOrder)

  }

  const doesMatch = (elm, toCheck) => elm.id === toCheck;

    return(
        <>
        <View style={styles.card}>
          <View style={styles.insidecard}>
        <ScaledImage
              style={styles.image}
              uri={crosssell.image_link}
              finalwidth={styles.image.width}
            />
          <Text>{crosssell.dish}</Text>
          <Text>{crosssell.price} €</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              addCrossSell(crosssell)
            }}
          >
            <Text style={styles.textbutton}>Añadir</Text>
          </TouchableOpacity>

        </View>
        
        </>
    )
}



const styles = StyleSheet.create({
  image: {
    width: 100,
    borderRadius: 5,
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
  insidecard: {
    alignItems: 'center',
    alignself: 'center',
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
}
  });

  export default CrossSellInList;

  //LIMPIADO Y REVISADO