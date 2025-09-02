import { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Decimal from "decimal.js";
import { OrderContext } from "./OrderContextProvider.jsx";

const Carrito = ({editable = true}) => {
  let { order, setOrder } = useContext(OrderContext);
  const [totalCart, setTotal] = useState(0);

  var total = () => {
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
    setTotal(new Decimal(totalNumber.toString()));
  };
  var newOrder = [];
  for (i = 0; i < order.products.length; i++) {
    element = {};
    element["quantity"] = order.products[i].quantity.toString();
    element["dish"] = order.products[i].dish;
    element["price"] = new Decimal(order.products[i].price.toString());
    element["final_price_per_product"] = new Decimal(
      order.products[i].price.toString()
    ).times(order.products[i].quantity.toString());
    newOrder.push(element);
  }

  if (order.coupon) {
    var totalDiscountNumber = new Decimal(order.coupon.discount.toString())
      .times(new Decimal(order.coupon.dish.price))
      .dividedBy(new Decimal(100))
      .toDP(2, Decimal.ROUND_DOWN)
      .toString();
  } else {
    var totalDiscountNumber = 0;
  }

    const deleteDish = (pk) => {
    var newOrder = { ...order };
    newOrder.products = newOrder.products.filter((el) =>
      elementNotExists(el, pk)
    );
    setOrder(() => newOrder);
  };

  const elementNotExists = (element, pk) => {
    return element.pk != pk;
  };

  useEffect(() => {
    total();
  }, [order]);
  return (
    <View>
      <Text style={styles.textBold}>Carrito:</Text>
      {newOrder.map((element, index) => (
        <View key={index}>
        <Text style={styles.text}>
          {element.quantity} x {element.dish} ={" "}
          {element.final_price_per_product.toString()} €{" "}
          {editable ? (
            <TouchableOpacity
              onPress={() => {
                deleteDish(element.dish_id);
              }}
            >
              <Image
                style={{ height: 20, width: 20 }}
                source={require("../../assets/cruz-blanca.png")}
              />
            </TouchableOpacity>
          ) : null}
        </Text>
        </View>
      ))}
      {order.coupon ? (
        <Text style={styles.textgreen}>
          Cupón {order.coupon.code}: {order.coupon.discount}% menos en{" "}
          {order.coupon.dish.dish}= - {totalDiscountNumber}
        </Text>
      ) : null}
      <Text style={styles.text}>Total: {totalCart.toString()} €</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  text: {
    color: "white",
    textAlign: "center",
    marginTop: 8,
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
  textgreen: {
    color: "red",
    textAlign: "center",
    marginTop: 8,
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
  textBold: {
    color: "white",
    fontSize: 35,
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
});
export default Carrito;

//REPASADO Y LIMPIADO
