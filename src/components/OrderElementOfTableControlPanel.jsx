import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useContext } from "react";
import Decimal from "decimal.js";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import { BASE_URL } from "../services/index.jsx";
import { FacturadosContext} from "./ConceptosFacturadosProvider.jsx";

const OrderElementOfTableControlPanel = ({
  orderElement,
  addElement,
  removeElement,
  elementsChosen,
  onItemPriceChange,
}) => {

  const { itemsFacturadosObject, añadirItemsFacturados, limpiarItemsFacturados } = useContext(FacturadosContext);
  const [itemsFacturados, setItemsFacturados] = itemsFacturadosObject;

  const [price, setPrice] = useState(
    orderElement.newPriceCorrected || orderElement.dishPrice
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(price);
  const isModified = price !== orderElement.dishPrice;
  const [nulled, setNulled] = useState(orderElement.nulled)

  const [loadingNewPrice, setLoadingNewPrice] = useState(false);

  const [hidden, setHidden] = useState(false);
  const [loadingCleaning, setLoadingCleaning] = useState(false)

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const handleCancelOrderElement = () => {
    if (orderElement.paid) {
      Alert.alert(
        "Confirmar anulación",
        "¿Estás seguro de que quieres anular este elemento del pedido? Se reembolsará el dinero que pagó el usuario",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Anular",
            style: "destructive",
            onPress: () => {
              nullOrderElementFunction(orderElement.dishId);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Confirmar anulación",
        "¿Estás seguro de que quieres anular este elemento del pedido?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Anular",
            style: "destructive",
            onPress: () => {
              nullOrderElementFunction(orderElement.dishId);
            },
          },
        ]
      );
    }
  };

  const handleHideOrderElement = () => {
    //setNulled(true)
    clearOrderElementFunction(orderElement.dishId);
  };

  const nullOrderElement = async (dishId, restaurant_pk) => {
    const response = await fetch(
      BASE_URL + "null-order-element/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ order_element: dishId }),
      }
    );
    const data = await response.json();
    if (data.status == "ok") {
      setLoadingCleaning(false)
      setHidden(true);
    } else {
      setLoadingCleaning(false)
      Alert.alert("Error", data.message);
    }
  };

  const nullOrderElementFunction = async (dishId) => {
    setLoadingCleaning(true)
    const restaurantChosen_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    await nullOrderElement(dishId, restaurantChosen_pk);
  };

  const clearOrderElement = async (dishId, restaurant_pk) => {
    setLoadingCleaning(true)
    const response = await fetch(
      BASE_URL + "clear-order-element/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ order_element: dishId }),
      }
    );
    const data = await response.json();
    if (data.status == "ok") {
      setLoadingCleaning(false)
      setHidden(true);
      removeElement(dishId)
    } else {
      setLoadingCleaning(false)
      Alert.alert("Error", data.message);
    }
  };

  const clearOrderElementFunction = async (dishId) => {
    const restaurantChosen_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    await clearOrderElement(dishId, restaurantChosen_pk);
  };

  const changeOrderElementPrice = async (dishId, restaurant_pk) => {
    const response = await fetch(
      BASE_URL + "change-order-element-price/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ order_element: dishId, new_price: editedPrice }),
      }
    );
    const data = await response.json();
    if (data.status == "ok") {
      return data.price;
    } else {
      Alert.alert("Error", data.message);
    }
  };

  const changeOrderElementsPriceFunction = async (dishId) => {
    const restaurantChosen_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    let price = await changeOrderElementPrice(dishId, restaurantChosen_pk);
    return price;
  };

  const handleSavePrice = async (dishId) => {
    setLoadingNewPrice(true);

    const priceFromResponse = await changeOrderElementsPriceFunction(dishId);

    const fixedEditedPrice = editedPrice.replace(",", ".");

    newPrice = new Decimal(fixedEditedPrice);
    if (!isNaN(newPrice) && fixedEditedPrice === priceFromResponse) {
      setPrice(newPrice.toFixed(2).toString());
      if (onItemPriceChange) {
        onItemPriceChange();
      }
    }
    setIsEditing(false);
    setLoadingNewPrice(false);
  };

  const handleCancelEdit = () => {
    setEditedPrice(price);
    setIsEditing(false);
  };

  const selectOrderElement = (pk) => {
    if (!elementsChosen.includes(pk)) {
      addElement(pk);
    } else {
      removeElement(pk);
    }
  };

  // NO MOSTRAR SI ESTÁ OCULTO
  if (hidden) return null;
  return (
    <TouchableOpacity
      style={
        elementsChosen.includes(orderElement.dishId)
          ? styles.selected
          : styles.normal
      }
      onPress={() => selectOrderElement(orderElement.dishId)}
    >
      {nulled?<Text style={styles.nulled}>ANULADO</Text>:null}
      {orderElement.paid || orderElement.facturado || itemsFacturados.includes(orderElement.dishId)? <Text style={styles.paid}>PAGADO</Text> : null}
      {orderElement.facturado || itemsFacturados.includes(orderElement.dishId) ? <Text style={styles.invoiced}>FACTURADO</Text> : null}
      <Text style={styles.buttontext}>
        {orderElement.dishName} (x {orderElement.quantity})
      </Text>
      {loadingNewPrice ? <ActivityIndicator size="large" /> : null}
      <View style={styles.priceRow}>
        {isEditing ? (
          <>
            <TextInput
              value={editedPrice.toString()}
              onChangeText={setEditedPrice}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Text style={styles.buttontext}>€</Text>
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={[styles.iconButton, styles.cancelButton]}
            >
              <Text style={styles.iconText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleSavePrice(orderElement.dishId);
              }}
              style={[styles.iconButton, styles.saveButton]}
            >
              <Text style={styles.iconText}>Guardar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.buttontext}>{price} €</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={[styles.iconButton, styles.editButton]}
            >
              <Text style={styles.iconText}>Editar</Text>
            </TouchableOpacity>
            {isModified && <Text style={styles.modifiedText}>Editado</Text>}
          </>
        )}
      </View>
      <View>
        <Text style={styles.buttontext}>ID:{orderElement.dishId}</Text>
      </View>
      {loadingCleaning?<ActivityIndicator size="large"/>:null}
      <View style={styles.actionButtonsContainer}>
        {orderElement.paid && !nulled ? (
          <TouchableOpacity
            onPress={handleCancelOrderElement}
            style={[styles.actionButton, styles.cancelOrderButton]}
          >
            <Text style={styles.iconText}>Anular y desembolsar</Text>
          </TouchableOpacity>
        ) : !nulled ? (
          <TouchableOpacity
            onPress={handleCancelOrderElement}
            style={[styles.actionButton, styles.cancelOrderButton]}
          >
            <Text style={styles.iconText}>Anular</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={handleHideOrderElement}
          style={[styles.actionButton, styles.hideOrderButton]}
        >
          <Text style={styles.iconText}>Limpiar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  normal: {
    marginTop: 15,
    padding: 10,
    borderColor: "white",
    borderRadius: 20,
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 2,
    marginHorizontal: 10,
  },
  selected: {
    marginTop: 15,
    padding: 10,
    borderColor: "#C7F6C7",
    borderRadius: 20,
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 4,
    marginHorizontal: 10,
  },
  buttontext: {
    padding: 3,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    height: 40,
    minWidth: 80,
    textAlign: "center",
    marginRight: 5,
  },
  iconButton: {
    marginLeft: 5,
    padding: 5,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "red",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  modifiedText: {
    marginLeft: 8,
    fontStyle: "italic",
    color: "#C7F6C7",
    fontSize: 16,
  },
  paid: {
    color: "#C7F6C7",
    fontSize: 20,
    textAlign: "center",
  },
  nulled: {
    color: "red",
    fontSize: 20,
    textAlign: "center",
  },
  invoiced: {
    color: "#b3ecff",
    fontSize: 20,
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap", // Esto permite que los botones se acomoden si uno es muy largo
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
    flexShrink: 1, // Permite que el botón se reduzca si el espacio es limitado
  },
  iconText: {
    fontSize: 16, // Opcional: reducir tamaño si el texto es muy largo
    color: "white",
    textAlign: "center", // Asegura que el texto se centre si da el salto de línea
  },

  cancelOrderButton: {
    backgroundColor: "#D32F2F", // rojo fuerte
  },

  hideOrderButton: {
    backgroundColor: "#4CAF50", // gris azulado oscuro
  },
});

export default OrderElementOfTableControlPanel;
//REPASADO Y REVISADO
