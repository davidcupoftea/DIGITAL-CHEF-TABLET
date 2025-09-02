import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useContext } from "react";
import Decimal from "decimal.js";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import { BASE_URL } from "../services/index.jsx";

import { FacturadosContext} from "./ConceptosFacturadosProvider.jsx";

const ConceptoExtraOfTableControlPanel = ({
  concepto,
  addConcepto,
  removeConcepto,
  conceptosChosen,
  onConceptoChange,
 conceptosJustHided
}) => {
  const [price, setPrice] = useState(concepto.price);
  const [description, setDescription] = useState(concepto.description);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(concepto.price);
  const [editedDescription, setEditedDescription] = useState(
    concepto.description
  );

  const [loadingNewPrice, setLoadingNewPrice] = useState(false);
  const [loadingCleaning, setLoadingCleaning] = useState(false)

  const [hidden, setHidden] = useState(false);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { conceptosFacturadosObject, añadirConceptosFacturados, limpiarConceptosFacturados } = useContext(FacturadosContext);
  const [conceptosFacturados, setConceptosFacturados] = conceptosFacturadosObject;

  const handleCancelOrderElement = () => {
    setLoadingCleaning(true)
    Alert.alert(
      "Confirmar anulación",
      "¿Estás seguro de que quieres anular este elemento?",
      [
        { text: "Cancelar",
          style: "cancel" ,
        onPress: () => {
          setLoadingCleaning(false)
        }},
        {
          text: "Anular",
          style: "destructive",
          onPress: () => {
            nullOrderElementFunction(concepto.id);
          },
        },
      ]
    );
  };

  const handleHideOrderElement = () => {
    clearOrderElementFunction(concepto.id);
  };

  const nullOrderElement = async (conceptoId, restaurant_pk) => {
    const response = await fetch(
      BASE_URL + "null-concepto-extra/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ concepto_extra: conceptoId }),
      }
    );
    const data = await response.json();
    if (data.status == "ok") {
      removeConcepto(conceptoId)
      setLoadingCleaning(false)
      setHidden(true);
    } else {
      Alert.alert("Error", data.message);
      setLoadingCleaning(false)
    }
  };

  const nullOrderElementFunction = async (conceptoId) => {
    const restaurantChosen_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    await nullOrderElement(conceptoId, restaurantChosen_pk);
  };

  const clearOrderElement = async (conceptoId, restaurant_pk) => {
    const response = await fetch(
      BASE_URL + "clear-concepto-extra/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ concepto_extra: conceptoId }),
      }
    );
    const data = await response.json();
    if (data.status == "ok") {
      setLoadingCleaning(false)
      removeConcepto(conceptoId)
      setHidden(true);
    } else {
      Alert.alert("Error", data.message);
      setLoadingCleaning(false)
    }
  };

  const clearOrderElementFunction = async (conceptoId) => {
    setLoadingCleaning(true)
    const restaurantChosen_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    await clearOrderElement(conceptoId, restaurantChosen_pk);
  };

  const changeConceptoExtraPrice = async (conceptoId, restaurant_pk) => {
    const response = await fetch(
      BASE_URL + "change-concepto-extra-price/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          concepto_extra: conceptoId,
          new_price: editedPrice,
          new_description: editedDescription,
        }),
      }
    );
    const data = await response.json();
    if (data.status == "ok") {
      return {'price': data.price, 'description': data.description};
    } else {
      Alert.alert("Error", data.message);
    }
  };

  const changeConceptExtraPriceFunction = async (conceptoId) => {
    const restaurantChosen_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );
    let response = await changeConceptoExtraPrice(conceptoId, restaurantChosen_pk);
    return response;
  };

  const handleSavePrice = async (conceptoId) => {
    setLoadingNewPrice(true);

    const result = await changeConceptExtraPriceFunction(conceptoId);
    const priceFromResponse = result['price']
    const descriptionFromResponse = result['description']

    const fixedEditedPrice = editedPrice.replace(",", ".");

    newPrice = new Decimal(fixedEditedPrice);
    if (!isNaN(newPrice) && fixedEditedPrice === priceFromResponse && editedDescription === descriptionFromResponse) {
      setPrice(newPrice.toFixed(2).toString());
      setDescription(descriptionFromResponse)

      if (onConceptoChange){
        onConceptoChange();
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
    if (!conceptosChosen.includes(pk)) {
      addConcepto(pk);
    } else {
      removeConcepto(pk);
    }
  };

  useEffect(()=>{

  },[conceptosChosen])

  if (hidden || conceptosJustHided.includes(concepto.id)) return null;
  return (
    <TouchableOpacity
      style={
        conceptosChosen.includes(concepto.id) ? styles.selected : styles.normal
      }
      onPress={() => selectOrderElement(concepto.id)}
    >
      {(concepto.facturado||conceptosFacturados.includes(concepto.id))?<Text style={styles.invoiced}>FACTURADO</Text>:null}
      {isEditing ? (
        <TextInput
          value={editedDescription}
          onChangeText={setEditedDescription}
          placeholder="Descripción"
          style={styles.descriptionInput}
        />
      ) : (
        <Text style={styles.buttontext}>{description}</Text>
      )}
      {isEditing ? (
        <>
          <TextInput
            value={editedPrice.toString()}
            onChangeText={setEditedPrice}
            keyboardType="decimal-pad"
            style={styles.inputFullWidth}
          />
          {loadingNewPrice ? <ActivityIndicator size="large" /> : null}
          <View style={styles.editButtonsRow}>
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={[styles.iconButton, styles.cancelButton]}
            >
              <Text style={styles.iconText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSavePrice(concepto.id)}
              style={[styles.iconButton, styles.saveButton]}
            >
              <Text style={styles.iconText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.priceColumn}>
          <Text style={styles.buttontext}>{price} €</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={[
              styles.iconButton,
              styles.editButton,
              styles.editButtonBelow,
            ]}
          >
            <Text style={styles.iconText}>Editar</Text>
          </TouchableOpacity>
        </View>
      )}
      {loadingCleaning? <ActivityIndicator size="large"/>:null}
      {!isEditing ? (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            onPress={handleCancelOrderElement}
            style={[styles.actionButton, styles.cancelOrderButton]}
          >
            <Text style={styles.iconText}>Anular y limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleHideOrderElement}
            style={[styles.actionButton, styles.hideOrderButton]}
          >
            <Text style={styles.iconText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <Text style={styles.buttontext}>ID: {concepto.id}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  normal: {
    marginTop: 15,
    padding: 12,
    borderColor: "#A0A0A0",
    borderRadius: 16,
    backgroundColor: "#ECEFF1", // gris claro azulado
    borderWidth: 1,
    marginHorizontal: 10,
  },
    invoiced: {
    color: "#0D47A1",
    fontSize: 20,
    textAlign: "center",
  },
  selected: {
    marginTop: 15,
    padding: 12,
    borderColor: "#2196F3", // azul brillante
    borderRadius: 16,
    backgroundColor: "#E3F2FD", // azul claro
    borderWidth: 2,
    marginHorizontal: 10,
  },
  buttontext: {
    padding: 3,
    color: "#0D47A1", // azul fuerte
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 18,
  },
  iconButton: {
    marginLeft: 5,
    padding: 5,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#1976D2", // azul medio
  },
  saveButton: {
    backgroundColor: "#388E3C", // verde suave
  },
  cancelButton: {
    backgroundColor: "#D32F2F", // rojo fuerte (mantenido)
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
  descriptionInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    height: 40,
    textAlign: "center",
    marginBottom: 6,
  },
  inputFullWidth: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    height: 40,
    width: "100%", // Ocupa todo el ancho disponible
    textAlign: "center",
    marginBottom: 10,
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  priceColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  editButtonBelow: {
    marginTop: 8,
  },
});

export default ConceptoExtraOfTableControlPanel;

//REVISADO Y LIMPIADO
