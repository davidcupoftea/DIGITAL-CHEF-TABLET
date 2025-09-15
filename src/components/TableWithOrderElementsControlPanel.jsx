import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import { BASE_URL } from "../services/index.jsx";
import OrderElementOfTableControlPanel from "./OrderElementOfTableControlPanel.jsx";
import Decimal from "decimal.js";
import ConceptoExtraOfTableControlPanel from './ConceptoExtraOfTableControlPanel.jsx'


const TableWithOrderElementsControlPanel = ({
  table,
  addElement,
  removeElement,
  elementsChosen,
  onItemPriceChange,
  addConcepto,
  removeConcepto,
  conceptosChosen,
  onConceptoChange,
  conceptosJustHided
}) => {

  let { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const [allSelected, setAllSelected] = useState(false);

  const [showExtraConceptBox, setShowExtraConceptBox] = useState(false);
  const [extraConceptDescription, setExtraConceptDescription] = useState("");
  const [extraConceptPrice, setExtraConceptPrice] = useState("");

  const [conceptosExtra, setConceptosExtra] = useState(table.conceptosExtra)


  const [activityExtraConcept, setActivityExtraConcept] = useState(false)




  const navigation = useNavigation();

  const añadirConceptoExtra = async (restaurantChosen_pk) => {
    const jsonData = await fetch(
            BASE_URL + "anadir-concepto-extra/" + restaurantChosen_pk + "/",
            {
              method: "POST",
              mode: "no-cors",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + String(authTokens?.access),
              },
              body: JSON.stringify({ table: table.mesaId, description: extraConceptDescription, price: extraConceptPrice }),
            }
          );
          var res_json = await jsonData.json();
          if (res_json.status == 'ok'){
            setConceptosExtra((prevState)=>[...prevState, {'id':res_json.concepto_extra_pk, 'description': res_json.concepto_extra_descripcion, 'price': new Decimal(res_json.concepto_extra_precio).toFixed(2).toString()}])
            return {'status':'ok'}
          } else {
            return {'status':'nook', 'message': res_json.message}
          }
  }

  const añadirConceptoExtraFunction = async () =>{
        if (authTokens != null && authTokens != "null") {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      const response = await añadirConceptoExtra(restaurantChosen_pk);
      return response
    }
  }

  const handleCancelExtraConcept = () => {
    setExtraConceptDescription("");
    setExtraConceptPrice("");
    setShowExtraConceptBox(false);
  };


  const handleSaveExtraConcept = async () => {
    setActivityExtraConcept(true)
    if (!extraConceptPrice){
      Alert.alert('Error','Pon un precio por favor')
      setActivityExtraConcept(false)
      return
    }
    const price = new Decimal(extraConceptPrice)
    if (!extraConceptDescription || isNaN(price)) {
      setActivityExtraConcept(false)
      Alert.alert("Error", "Introduce una descripción y un precio válido.");
      return;
    }

    result = await añadirConceptoExtraFunction()
    if (result.status == 'ok'){
      Alert.alert('Éxito', 'Concepto creado')
      setActivityExtraConcept(false)
    }
    else {
      Alert.alert('Error', 'Ha habido un problema: '+ result.message)
      setActivityExtraConcept(false)
    }

    handleCancelExtraConcept();
  };

  const areAllSelected = async () => {
    const allSelected =
      table.items.length > 0 &&
      table.items.every((item) =>
        elementsChosen.some((el) => el === item.dishId)
      );
    setAllSelected(allSelected);
  };

  useEffect(() => {
    areAllSelected();
  }, [elementsChosen]);

  return (
    <>
      <View style={allSelected ? styles.greencard : styles.card}>
        <View style={styles.insidecard}>
          <View>
            <Text style={styles.textBold}>{table.mesaNombre}</Text>
          </View>
          {table.items.map((item, index) => (
            <OrderElementOfTableControlPanel
              key={item.dishId}
              orderElement={item}
              addElement={addElement}
              removeElement={removeElement}
              elementsChosen={elementsChosen}
              onItemPriceChange={onItemPriceChange}
            />
          ))}

          <Text style={styles.extraConceptTitle}>Añadir elemento a la mesa</Text>

          <View style={styles.addBoxContainer}>
            <TouchableOpacity
              style={styles.addCircle}
              onPress={() => {
                navigation.navigate('Elegir Productos para la mesa',{'mesa': table.mesaNombre})
              }}
            >
              <Text style={styles.addIcon}>＋</Text>
            </TouchableOpacity>
            </View>
          <Text style={styles.extraConceptTitle}>Conceptos Extra</Text>
          {conceptosExtra && conceptosExtra.length > 0? conceptosExtra.map((concepto, index)=>(
          <ConceptoExtraOfTableControlPanel key={index} concepto={concepto} addConcepto={addConcepto} removeConcepto={removeConcepto} conceptosChosen={conceptosChosen} onConceptoChange={onConceptoChange} conceptosJustHided={conceptosJustHided}/>
          ))
          :null}
          {showExtraConceptBox && (
            <View style={styles.extraConceptBox}>
              <TextInput
                style={styles.input}
                placeholder="Descripción del concepto"
                value={extraConceptDescription}
                onChangeText={setExtraConceptDescription}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Importe (€)"
                value={extraConceptPrice}
                onChangeText={setExtraConceptPrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
                  {activityExtraConcept ? (<ActivityIndicator size="large" color="#0000ff" />) : null}

              <View style={styles.extraButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelExtraConcept}
                >
                  <Text style={styles.textbutton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveExtraConcept}
                >
                  <Text style={styles.textbutton}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {!showExtraConceptBox?
          <View style={styles.addBoxContainer}>
            <TouchableOpacity
              style={styles.addCircle}
              onPress={() => {
                if (!showExtraConceptBox) setShowExtraConceptBox(true);
              }}
            >
              <Text style={styles.addIcon}>＋</Text>
            </TouchableOpacity>
          </View>:null}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  greencard: {
    flexDirection: "column",
    justifyContent: "flex-start",
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "#C7F6C7",
    borderRadius: 30,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  card: {
    flexDirection: "column",
    justifyContent: "flex-start",
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 30,
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
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  insidecard: {
    padding: 15,
  },
  textbutton: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  addBoxContainer: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    backgroundColor: "#f5f5f5", 
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    fontSize: 24,
    color: "#999",
  },
  extraConceptBox: {
  marginTop: 15,
  backgroundColor: "#f5f5f5",
  padding: 15,
  borderRadius: 15,
  borderWidth: 2,
  borderColor: "#ccc",
},
input: {
  backgroundColor: "white",
  padding: 10,
  borderRadius: 8,
  borderColor: "#ccc",
  borderWidth: 1,
  fontSize: 18,
  marginBottom: 10,
  fontFamily: "Function-Regular",
  color: "black",
},
extraButtonsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
},
cancelButton: {
  backgroundColor: "#888",
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 10,
},
saveButton: {
  backgroundColor: "#4CAF50",
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 10,
},
extraConceptTitle: {
  fontSize: 18,
  color: "black",
  fontFamily: "Function-Regular",
  marginTop: 10,
  textAlign: "center",
  textDecorationLine: "underline",
},

});

export default TableWithOrderElementsControlPanel;

//REPASADO Y REVISADO
