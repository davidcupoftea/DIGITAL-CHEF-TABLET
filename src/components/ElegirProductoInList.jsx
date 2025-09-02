import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import ScaledImage from "./CustomFastAndFunctionalScaledImage.jsx";
import { OrderContext } from "./OrderContextProvider.jsx";

const ElegirProductoInList = ({ item }) => {
  const [selected, _setSelected] = useState(false);
  const [quantity, setQuantity] = useState(0);

  let { order, setOrder } = useContext(OrderContext);

  useEffect(() => {
    try {
      const elementOfOrder = order.products.findIndex(orderExists);
      setQuantity(order.products[elementOfOrder].quantity);
      _setSelected(true);
    } catch {
      setQuantity(0)
      _setSelected(false)
    }
  }, [order]);

  const setSelected = () => {
    _setSelected(!selected);
    if (!selected == false) {
      setQuantity(0);
      newOrder = { ...order };
      if (newOrder.coupon && newOrder.coupon.dish.id == item.id) {
        delete newOrder.coupon;
      }
      newOrder.products = newOrder.products.filter(orderNotExists);
      setOrder(() => newOrder);
    } else {
      setQuantity(1);
      setOrder((prevState) => ({
        ...prevState,
        products: [...prevState.products, { ...item, quantity: 1 }],
      }));
    }
  };

  const addOneLess = () => {
    setQuantity(quantity - 1);
    const elementOfOrder = order.products.findIndex(orderExists);
    const newOrder = { ...order };
    newOrder.products[elementOfOrder].quantity = quantity - 1;
    setOrder(() => newOrder);
    if (quantity - 1 == 0) {
      setSelected(false);
    }
  };
  const orderExists = (element) => {
    return element.id == item.id;
  };

  const orderNotExists = (element) => {
    return element.id != item.id;
  };
  const addOneMore = () => {
    setQuantity(quantity + 1);
    const elementOfOrder = order.products.findIndex(orderExists);
    const newOrder = { ...order };
    newOrder.products[elementOfOrder].quantity = quantity + 1;
    setOrder(() => newOrder);
  };

  return (
    <>
      <View style={selected ? styles.cardgreen : styles.card}>
        {item.image_link !== null ? (
          <ScaledImage
            style={styles.image}
            uri={item.image_link}
            finalwidth={styles.image.width}
          />
        ) : null}
        <View style={styles.insidecard}>
          <Text style={selected ? styles.textgreenBold : styles.textBold}>
            {item.dish}
          </Text>
          <Text style={selected ? styles.textgreen : styles.text}>
            {item.description}
          </Text>
          <Text style={selected ? styles.textgreenprice : styles.textprice}>
            {item.price} €
          </Text>
          {selected ? (
            <View style={styles.quantity}>
              <Text style={styles.text}>
                <TouchableOpacity
                  onPress={() => {
                    addOneLess();
                  }}
                >
                  <Image
                    style={{ height: 20, width: 25 }}
                    source={require("../../assets/arrow-down2.png")}
                  />
                </TouchableOpacity>{" "}
                Cantidad: {quantity}{" "}
                <TouchableOpacity
                  onPress={() => {
                    addOneMore();
                  }}
                >
                  <Image
                    style={{ height: 20, width: 25 }}
                    source={require("../../assets/arrow-up2.png")}
                  />
                </TouchableOpacity>
              </Text>
            </View>
          ) : null}
          {!selected ? (
            <TouchableOpacity
              style={styles.googlesign}
              onPress={() => {
                setSelected(!selected);
              }}
            >
              <Text style={styles.googlesigntext}>Elegir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.googlesign}
              onPress={() => {
                setSelected(!selected);
              }}
            >
              <Text style={styles.googlesigntext}>Descartar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: Dimensions.get("window").width * 0.9 - 10,
    marginBottom: 5,
  },
  quantity: {
    marginTop: 15,
  },
  textBold: {
    color: "black",
    textAlign: "center",
    fontSize: 23,
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textgreenBold: {
    color: "green",
    textAlign: "center",
    fontSize: 23,
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  text: {
    color: "black",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textgreen: {
    color: "green",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textprice: {
    color: "black",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
    marginTop: 10,
  },
  textgreenprice: {
    color: "green",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
    marginTop: 10,
  },
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 150,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "white",
    borderRadius: 30,
  },
  cardgreen: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 150,
    marginTop: 10,
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "green",
    borderRadius: 30,
  },
  insidecard: {
    padding: 15,
  },
  googlesign: {
    backgroundColor: "blue",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    marginTop: 20,
  },
  googlesigntext: {
    color: "white",
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
});

export default ElegirProductoInList;

//REPASADO Y LIMPIO 
