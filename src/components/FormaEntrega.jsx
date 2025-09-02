import { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { OrderContext } from "./OrderContextProvider.jsx";

const FormaEntrega = () => {
  const [description, setDescription] = useState("");

  const { order, setOrder } = useContext(OrderContext);

  const navigation = useNavigation();

  useEffect(() => {
    if (
      order.delivery == true &&
      order.takeaway == false &&
      order.fromtable == false
    ) {
      setDescription(
        <>
          <Text style={styles.text}>Envío a domicilio</Text>
          <Text style={styles.text}>Dirección: {order.addressToSend}</Text>
          <Text style={styles.text}>
            Número de teléfono provisto: {order.phoneNumber}
          </Text>
        </>
      );
    } else if (
      order.delivery == false &&
      order.takeaway == true &&
      order.fromtable == false
    ) {
      setDescription(
        <>
          <Text style={styles.text}>Recogida en el restaurante</Text>
          <Text style={styles.text}>Hora: {order.takeawayTimeString}</Text>
          <Text style={styles.text}>
            Tu número de teléfono: {order.phoneNumber}
          </Text>
        </>
      );
    } else if (
      order.delivery == false &&
      order.takeaway == false &&
      order.fromtable == true
    ) {
      setDescription(
        <>
          <Text style={styles.text}>Mesa en el restaurante</Text>
          <Text style={styles.text}>
            Número de la mesa: {order.numberOfTable}
          </Text>
        </>
      );
    }
  }, [navigation, order]);

  return (
    <View>
      <Text style={styles.textBold}>Modo de entrega:</Text>
      {description}
    </View>
  );
};

const styles = StyleSheet.create({
  textBold: {
    color: "white",
    fontSize: 35,
    textAlign: "center",
    marginTop: 15,
    fontFamily: 'Function-Regular',
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 25,
    marginTop: 8,
    fontFamily: 'Function-Regular',
  },
});
export default FormaEntrega;
//REPASADO Y LIMPIADO
