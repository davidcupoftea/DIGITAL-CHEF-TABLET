import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";


const OrderElementInList = ({order_element, isInitiallySelected, onToggleSelect, functional=false }) => {
  const [selected, setSelected] = useState(isInitiallySelected);

  const toggle = () => {
    if (functional){
  const newValue = !selected;
  setSelected(newValue);
  onToggleSelect?.(newValue);
    }
};

  return (
    <>
      <TouchableOpacity onPress={toggle}>
      <View style={selected? styles.greencard : styles.redcard}>

        <View style={styles.insidecard}>
          <View>
            <Text style={styles.textBold}>{order_element.description} [{order_element.price} €]</Text>
          </View>
        </View>
      </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  greencard: {
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "green",
    borderRadius: 20,
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
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "red",
    borderRadius: 20,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  textBold: {
    color: "black",
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginVertical: 10,
  },
  insidecard: {
    padding: 5,
  },
});

export default OrderElementInList;

//REPASADO Y LIMPIO
