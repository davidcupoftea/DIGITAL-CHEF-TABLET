import { useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import ScaledImage from "./CustomFastAndFunctionalScaledImage";
import { useNavigation } from "@react-navigation/native";
import { OrderContext } from './OrderContextProvider.jsx'

const CodeInList = ({code}) => {
  const [selected, setSelected] = useState(false)
  let { order, setOrder } = useContext(OrderContext)

  const navigation = useNavigation()


  useEffect(()=>{
    if (order.coupon && order.coupon.id == code.id){
      setSelected(true)

    }else{
      setSelected(false)
    }
  },[order, navigation])

  const redeemCode = (code) => {
    if (order.coupon && order.coupon.id === code.id){
    } else {
      newOrder = {...order, 'coupon': code}
      setOrder(() => (newOrder))
      setSelected(!selected)
    }
  }

  const unselect = () => {
    var newOrder = {...order}
    delete newOrder.coupon
    setOrder(()=>newOrder)
    setSelected(false)
  }

    return(
        <>
        <View style={selected ? styles.greencard : styles.card}>
        <View style={styles.insidecard}>
            <Text style={styles.text}>Código {code.code} para un {code.discount}% de descuento en:</Text>
            <ScaledImage
              style={styles.image}
              uri={code.dish.image_link}
              finalwidth={styles.image.width}
            />
            <Text style={styles.text}>{code.dish.dish}</Text>
            </View>

            { selected ? (<><View style={styles.viewforredeemed}><Text style={styles.textgreen}>Código seleccionado</Text></View><TouchableOpacity
            style={styles.button}
            onPress={() => {
              unselect()
            }}
          ><Text style={styles.textbutton}>Deseleccionar</Text>
          </TouchableOpacity></>) : (
            <TouchableOpacity
            style={styles.button}
            onPress={() => {
              redeemCode(code)
            }}
          >
            
            <Text style={styles.textbutton}>Canjear</Text>
          </TouchableOpacity>)}
          
        </View>
        </>
    )
}



const styles = StyleSheet.create({
  image: {
    width: 100,
    borderRadius: 5,
  },
  greencard: {
    flexDirection: "column",
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "white",
    borderWidth: 10,
    borderColor: "green",
    borderRadius: 10,
    elevation: 10,
    shadowOffset:{
        width: 5,
        height:5,
    },
    shadowColor: '#f0ffff',
    shadowOpacity: 0.8,
  },
  card: {
    flexDirection: "column",
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
  insidecard:{
    justifyContent: "center",
    alignItems: 'center',
  },
  viewforredeemed:{
    justifyContent: "center",
    alignItems: 'center',
  },
  text: {
    marginBottom: 10,
  },
  textgreen: {
    marginBottom: 10,
    fontSize: 20,
    color: 'green',
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


  export default CodeInList;
  //REPASADO Y LIMPIADO