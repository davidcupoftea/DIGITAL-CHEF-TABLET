import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as Device from "expo-device";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { PrinterContext } from "./PrintersContextProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import MesaTablePanelControl from "./MesaTablePanelControl.jsx";
import MesaTablePanelControlHorizontal from "./MesaTablePanelControlHorizontal.jsx";
import TableWithOrderElementsControlPanel from "./TableWithOrderElementsControlPanel.jsx";
import Decimal from "decimal.js";
import {
  imprimirTicketPanelControl,
  imprimirProformaPanelControl,
} from "../services/printerFunctions.jsx"; // DESCOMENTAR PARA VERSION CON IMPRESORA
import { FacturadosContext } from "./ConceptosFacturadosProvider.jsx";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import CanvasMesas from "./Canvas.jsx";

const PanelControl = () => {
const addTable = useCallback((pk) => {
  setTablesChosen(prev => [...prev, pk]);
}, []);

const removeTable = useCallback((pk) => {
  setTablesChosen(prev => prev.filter((table) => table !== pk));
}, []);

const addElement = useCallback((pk) => {
  setElementsChosen(prev => [...prev, pk]);
}, []);

const removeElement = useCallback((pk) => {
  setElementsChosen(prev => prev.filter((element) => element !== pk));
}, []);

const addConcepto = useCallback((pk) => {
  setConceptosChosen(prev => [...prev, pk]);
}, []);

const removeConcepto = useCallback((pk) => {
  setConceptosChosen(prev => prev.filter((concepto) => concepto !== pk));
}, []);

  const [rooms, setRoomsState] = useState([{ room: "Todas", id: "Todas" }]);
  const [room, setRoom] = useState("Todas");
  const [isEditing, setIsEditing] = useState(false)

  const [loadedRooms, setLoadedRooms] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [tables, setTables] = useState([]);
  const [loadedTables, setLoadedTables] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingCleaning, setLoadingCleaning] = useState(false);

  const [tablesChosen, setTablesChosen] = useState([]);
  const [mesasConItems, setMesasConItems] = useState([]);
  const [elementsChosen, setElementsChosen] = useState([]);
  const [conceptosChosen, setConceptosChosen] = useState([]);

  const [conceptosJustHided, setConceptosJustHided] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadedOrders, setLoadedOrders] = useState(false);

  const [amountsToPay, setAmountsToPay] = useState([]);
  const [amountsConcept, setAmountsConcept] = useState([]);
  const [stringConcat, setStringConcat] = useState("");
  const [stringConcatConcept, setStringConcatConcept] = useState("");
  //const [stringConcatDefinitive, setStringConcatDefinitive] = useState("");
  const [total, setTotal] = useState(0);
  const [totalConcept, setTotalConcept] = useState(0);
  //const [totalDefinitive, setTotalDefinitive] = useState(0);
  const [efectivo, setEfectivo] = useState(0);
  //const [cambio, setCambio] = useState(0);

  const [loadingProforma, setLoadingProforma] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const {
    conceptosFacturadosObject,
    añadirConceptosFacturados,
    limpiarConceptosFacturados,
    añadirItemsFacturados,
    limpiarItemsFacturados,
  } = useContext(FacturadosContext);
  const [conceptosFacturados, setConceptosFacturados] =
    conceptosFacturadosObject;

 const fetchAmountToPay = useCallback(async (restaurantChosen_pk) => {
    const response = await fetch(
      BASE_URL + "get-amount-to-pay/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          order_elements: elementsChosen,
          concepts: conceptosChosen,
        }),
      }
    );
    const jsonData = await response.json();
    setAmountsToPay(jsonData.amounts);
    setAmountsConcept(jsonData.concepts);
  },[authTokens?.access, elementsChosen, conceptosChosen]);


  function joinIfBothExist(str1, str2, separator = " + ") {
    if (str1 && str2) return `${str1}${separator}${str2}`;
    return str1 || str2 || "";
  }

  // useEffect(() => {
  //   if (amountsToPay != undefined && amountsConcept != undefined) {
  //     const stringConcat = amountsToPay
  //       .map((n) => `${n.toFixed(2)}`)
  //       .join(" + ");
  //     const stringConcatConcept = amountsConcept
  //       .map((n) => `${n.toFixed(2)}`)
  //       .join(" + ");

  //     const stringConcatDefinitive = joinIfBothExist(
  //       stringConcat,
  //       stringConcatConcept
  //     );

  //     setStringConcatDefinitive(stringConcatDefinitive);
  //     let total = amountsToPay.reduce((acc, n) => acc.plus(n), new Decimal(0));
  //     const total_str = total.toString();
  //     let totalConcept = amountsConcept.reduce(
  //       (acc, n) => acc.plus(n),
  //       new Decimal(0)
  //     );
  //     const totalConcept_str = totalConcept.toString();
  //     setTotalDefinitive(totalConcept.plus(total).toString());
  //   }
  // }, [amountsToPay, amountsConcept]);

  const stringConcatDefinitive = useMemo(() => {
  if (!amountsToPay || !amountsConcept) return "";
  const stringConcat = amountsToPay.map((n) => n.toFixed(2)).join(" + ");
  const stringConcatConcept = amountsConcept.map((n) => n.toFixed(2)).join(" + ");
  return joinIfBothExist(stringConcat, stringConcatConcept);
}, [amountsToPay, amountsConcept]);

const totalDefinitive = useMemo(() => {
  if (!amountsToPay || !amountsConcept) return "0.00";
  const total = amountsToPay.reduce((acc, n) => acc.plus(n), new Decimal(0));
  const totalConcept = amountsConcept.reduce((acc, n) => acc.plus(n), new Decimal(0));
  return total.plus(totalConcept).toString();
}, [amountsToPay, amountsConcept]);

  // useEffect(() => {
  //   if (efectivo.length > 0) {
  //     let efectivo_decimal = new Decimal(efectivo);
  //     let cambio = efectivo_decimal.minus(new Decimal(totalDefinitive));
  //     setCambio(cambio.toString());
  //   }
  // }, [totalDefinitive, efectivo]);

  const cambio = useMemo(() => {
  if (!efectivo || efectivo.length === 0) return "0.00";
  const efectivo_decimal = new Decimal(efectivo);
  const total_decimal = new Decimal(totalDefinitive || 0);
  return efectivo_decimal.minus(total_decimal).toString();
}, [efectivo, totalDefinitive]);

  const getAmountToPay = useCallback(async () => {
    if (authTokens != null && authTokens != "null") {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      fetchAmountToPay(restaurantChosen_pk);
    }
  },[authTokens, fetchAmountToPay])

  useEffect(() => {
    getAmountToPay();
  }, [elementsChosen, conceptosChosen]);

 useEffect(() => {
  if (!restaurantChosen?.pk) return; // seguridad

  // Limpiar cálculos cuando cambia de restaurante
  setAmountsToPay([]);
  setAmountsConcept([]);
  // setStringConcatDefinitive("");
  // setTotalDefinitive(0);
  setEfectivo(0);
  // setCambio(0);
  setElementsChosen([]);
  setConceptosChosen([]);
}, [restaurantChosen?.pk])

  const fetchRooms = useCallback(async (restaurantChosen_pk) => {
    setLoadedRooms(false);
    setLoadingRooms(true);
    const response = await fetch(
      BASE_URL + "get-rooms/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );

    const jsonData = await response.json();
    setRoomsState([...jsonData.rooms, { room: "Todas", id: "Todas" }]);
    setLoadedRooms(true);
    setLoadingRooms(false);
  },[authTokens?.access]);

  const getRooms = useCallback(async () => {
    if (authTokens != null && authTokens != "null") {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      fetchRooms(restaurantChosen_pk);
    }
  },[authTokens?.access, fetchRooms]);

  useEffect(() => {
    getRooms();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      getRooms();
    });
    return unsubscribe;
  }, [isFocused]);

 const getTables = useCallback(async (restaurantChosen_pk) => {
    setLoadingTables(true);
    setLoadedTables(false);
    if (room != null) {
      const jsonData = await fetch(
        BASE_URL + "tables-dc/" + restaurantChosen_pk + "/",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens?.access),
          },
          body: JSON.stringify({ room: room }),
        }
      );
      var res_json = await jsonData.json();
      var tables = res_json.tables;
      console.log('tables are', tables)
      setTables([...tables]);
      setLoadingTables(false);
      setLoadedTables(true);
    }
  },[]);


  const gettingInfoForTables = useCallback(async () => {
    if (authTokens != null && authTokens != "null") {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      getTables(restaurantChosen_pk);
    }
  },[authTokens?.access, getTables]);

  useEffect(() => {
    gettingInfoForTables();
  }, [room]);


  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      gettingInfoForTables();
    });
    return unsubscribe;
  }, [isFocused]);

  useEffect(() => {
    const interval = setInterval(() => {
      gettingInfoForTables();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

    const getOrdersFromTables = useCallback(async (restaurantChosen_pk) => {
    setLoadingOrders(true);
    setLoadedOrders(false);
    const jsonData = await fetch(
      BASE_URL + "get-orders-for-tables/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ tables: tablesChosen }),
      }
    );
    var res_json = await jsonData.json();
    var tablesThroughTablesData = res_json.tables_through_tables;

    // Mapa para agrupar mesas y sus items
    const mesasConItems = {};

    // Recorremos cada entrada del array
    tablesThroughTablesData.forEach((entry) => {
      const mesa = entry.table;
      const mesaId = mesa.id;
      const mesaNombre = mesa.name_of_the_table;
      const key = `${mesaId}-${mesaNombre}`;

      if (!mesasConItems[key]) {
        mesasConItems[key] = {
          mesaId,
          mesaNombre,
          items: [],
          conceptosExtra: entry.conceptos_extra,
        };
      }

      const order = entry.order;

      const orderElements = entry.order?.elements || [];
      const conceptosExtra = entry.conceptos_extra || [];

      if (orderElements.length > 0 || conceptosExtra.length > 0) {
        order?.elements.forEach((element) => {
          const alreadyExists = mesasConItems[key].items.find(
            (item) => item.dishId === element.id
          );
          if (!alreadyExists) {
            mesasConItems[key].items.push({
              dishId: element.id,
              paid: element.order__paid,
              dishName: element.dish_name,
              dishPrice: element.dish_price,
              quantity: element.quantity,
              nulled: element.nulled,
              priceCorrected: element.price_corrected,
              newPriceCorrected: element.new_price_corrected,
              facturado: element.facturado,
            });
          }
        });
        // Agregar conceptos extra si existen
        conceptosExtra.forEach((concepto) => {
          const alreadyExists = mesasConItems[key].conceptosExtra.find(
            (c) => c.id === concepto.id
          );
          if (!alreadyExists) {
            mesasConItems[key].conceptosExtra.push(concepto);
          }
        });
      }
    });

    const mesasArray = Object.values(mesasConItems);

    setMesasConItems(mesasArray);
    setLoadingOrders(false);
    setLoadedOrders(true);
  },[authTokens?.access, tablesChosen]);


  const getOrders = useCallback(async () => {
    if (authTokens != null && authTokens != "null") {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      getOrdersFromTables(restaurantChosen_pk);
    }
  },[authTokens?.access, getOrdersFromTables]);

  useEffect(() => {
    getOrders();
  }, [tablesChosen]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getOrders();
    });
    return unsubscribe;
  }, [isFocused]);

  const getPlatform = useCallback(() => {
    if (Device.osName === "Android" || Platform.OS === "android") {
      return "android";
    } else if (
      Device.osName === "iOS" ||
      Device.osName === "iPadOS" ||
      Platform.OS === "ios"
    ) {
      return "ios";
    }
  },[]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      getOrders();
    });
    return unsubscribe;
  }, [isFocused]);

  const actuallyClearElements = useCallback(async (
    restaurantChosen_pk,
    order_elements,
    conceptos_extra
  ) => {
    setLoadingCleaning(true);
    const jsonData = await fetch(
      BASE_URL + "clear-elements-and-concepts/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          elements_chosen: order_elements,
          conceptos_chosen: conceptos_extra,
        }),
      }
    );
    var res_json = await jsonData.json();
    if (res_json.status === "ok") {
      setLoadingCleaning(false);
      setElementsChosen((prev) =>
        prev.filter((el) => !order_elements.includes(el))
      );
      setConceptosChosen((prev) =>
        prev.filter((c) => !conceptos_extra.includes(c))
      );
      setConceptosJustHided((prevState) => [...prevState, ...conceptos_extra]);
      await getOrders(restaurantChosen_pk);
      await fetchAmountToPay(restaurantChosen_pk);
    } else {
      setLoadingCleaning(false);
    }
    return res_json;
  },[authTokens?.access, getOrders]);

  const checkIfAreItemsNotInvoiced = useCallback(async (
    restaurantChosen_pk,
    order_elements,
    conceptos_extra
  ) => {
    const jsonData = await fetch(
      BASE_URL + "check-items-not-invoiced/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          elements_chosen: order_elements,
          conceptos_chosen: conceptos_extra,
        }),
      }
    );
    var res_json = await jsonData.json();
    if (res_json.status == "nook") {
      Alert.alert("Ha habido un error: ", res_json.message);
    } else if (res_json.status == "present") {
      const elements_nf = res_json.elements.join(", ");
      const conceptos_nf = res_json.conceptos.join(", ");
      Alert.alert(
        "Hay ítems/conceptos no facturados",
        "¿Estás seguro de limpiar ítmes (" +
          elements_nf +
          ") o conceptos (" +
          conceptos_nf +
          ") no facturados?",
        [
          {
            text: "No, déjame cambiarlo",
            style: "cancel",
          },
          {
            text: "Sí, estoy seguro",
            onPress: async () =>
              await actuallyClearElements(
                restaurantChosen_pk,
                order_elements,
                conceptos_extra
              ),
          },
        ]
      );
    } else if (res_json.status == "absent") {
      const result = await actuallyClearElements(
        restaurantChosen_pk,
        order_elements,
        conceptos_extra
      );

      if (result.status == "ok") {
        Alert.alert("Éxito", "Se han limpiado los elementos");
      } else if (result.status == "nook") {
        Alert.alert(
          "Error",
          "Ha habido un error limpiando los elementos: " + result.message
        );
      }
    }
  },[authTokens?.access, actuallyClearElements]);

  const clearElements = useCallback(async (restaurantChosen_pk) => {
    checkIfAreItemsNotInvoiced(
      restaurantChosen_pk,
      elementsChosen,
      conceptosChosen
    );
  },[checkIfAreItemsNotInvoiced, elementsChosen, conceptosChosen]);


  const renderRooms = useCallback(() => {
    if (rooms.length > 0) {
      return rooms.map((roomElement, index) => {
        return (
          <Picker.Item
            label={roomElement.room}
            value={roomElement.id}
            key={index}
          />
        );
      });
    }
  },[rooms]);

  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const [gapWidth, setGapWidth] = useState(0);

  useEffect(() => {
    setGapWidth(containerWidth * 0.02);
  }, [containerWidth]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.textsmall}>
          Estás viendo el panel de control del restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
        <Text style={styles.text}>
          Edita las mesas y sus relaciones{" "}
          <Text
            style={styles.textunderlined}
            onPress={() => {
              navigation.navigate("Mesas y Relaciones");
            }}
          >
            aquí
          </Text>
        </Text>

        <BouncyCheckbox
          size={30}
          isChecked={isEditing}
          fillColor="black"
          unfillColor="#FFFFFF"
          useBuiltInState={false}
          text="Modo edición mesas"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={() => setIsEditing(!isEditing)}
        />

        <Text style={styles.text}>Sala del restaurante</Text>

        <Pressable onPress={() => {}}>
          <View style={styles.timeOfReservation}>
            <Picker
              selectedValue={room}
              onValueChange={(itemValue, itemIndex) => {
                setRoom(itemValue);
              }}
              style={
                getPlatform() == "android"
                  ? styles.pickerstyleandroid
                  : styles.pickerstyleios
              }
              dropdownIconColor="white"
              itemStyle={{ height: 40, color: "white" }}
            >
              {loadedRooms ? renderRooms() : null}
            </Picker>
          </View>
        </Pressable>

        {!loadedRooms && !loadingRooms ? (
          <Text style={styles.textsmall}>
            Elige una sala para ver resultados
          </Text>
        ) : null}

        {!loadedRooms && loadingRooms ? (
          <ActivityIndicator size="large" />
        ) : null}

        <View style={{ flex: 1, flexDirection: "column" }}>
          <View style={{ flexDirection: "row", flex: 1, gap: 15 }}>
            <View style={{ flex: 2, minHeight: 300  }}>
              <CanvasMesas
                mesasOriginales={tables}
                isEditing={isEditing}
                addTable={addTable}
                removeTable={removeTable}
                tablesChosen={tablesChosen}
              />
            </View>
            <View style={{ flex: 1 }}>
              {loadedRooms && !loadingRooms && rooms.length != 0
                ? tables.map((mesa, index) => (
                    <MesaTablePanelControl
                      table={mesa}
                      key={index}
                      addTable={addTable}
                      removeTable={removeTable}
                      tablesChosen={tablesChosen}
                    />
                  ))
                : null}
            </View>
          </View>
        </View>

        {loadedRooms && !loadingRooms && rooms.length == 0 ? (
          <Text style={styles.textsmall}>
            No hay resultados que coinciden con tu búsqueda
          </Text>
        ) : null}

        <FlatList
          data={tables}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <MesaTablePanelControlHorizontal
              table={item}
              addTable={addTable}
              removeTable={removeTable}
              tablesChosen={tablesChosen}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mesasContainer}
        />

        <View
          style={styles.containerthreecolumns}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainerWidth(width);
          }}
        >
          {mesasConItems.map((mesa, index) => {
            const isLastInRow = (index + 1) % cardsPerRow === 0;
            return (
              <View
                key={index}
                style={{
                  flexBasis: `33.33%`,
                  flexGrow: 0,
                  marginBottom: 10,
                  paddingRight: isLastInRow ? 0 : gapWidth,
                }}
              >
                <TableWithOrderElementsControlPanel
                  key={mesa.mesaId}
                  table={mesa}
                  addElement={addElement}
                  removeElement={removeElement}
                  elementsChosen={elementsChosen}
                  onItemPriceChange={getAmountToPay}
                  addConcepto={addConcepto}
                  removeConcepto={removeConcepto}
                  conceptosChosen={conceptosChosen}
                  onConceptoChange={getAmountToPay}
                  conceptosJustHided={conceptosJustHided}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.change_box}>
          <Text style={styles.calculateTextBig}>Calcula aquí tu cambio</Text>
          <Text style={styles.calculateText}>
            Suma: {stringConcatDefinitive}
          </Text>
          <Text style={styles.calculateText}>Total: {totalDefinitive} €</Text>
          <Text style={styles.calculateText}>Efectivo:</Text>
          <TextInput
            value={efectivo.toString()}
            onChangeText={setEfectivo}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          {cambio < 0 ? (
            <Text style={styles.calculateTextred}>
              No hay suficiente dinero para pagar estos productos. Faltan{" "}
              {cambio * (-1).toString()} €
            </Text>
          ) : (
            <Text style={styles.calculateText}>Cambio: {cambio} €</Text>
          )}
        </View>
        {loadingProforma ? (
          <ActivityIndicator size="large"></ActivityIndicator>
        ) : null}
        <TouchableOpacity
          disabled={loadingProforma}
          style={styles.greenButton}
          onPress={useCallback(async () => {
            setLoadingProforma(true);
            await imprimirProformaPanelControl(
              elementsChosen,
              conceptosChosen,
              selectedPrinters,
              restaurantChosen,
              authTokens?.access
            );
            setLoadingProforma(false);
          })}
        >
          <Text style={styles.buttonText}>
            Imprimir proforma con los elementos seleccionados
          </Text>
        </TouchableOpacity>

        {loadingTicket ? (
          <ActivityIndicator size="large"></ActivityIndicator>
        ) : null}

        <TouchableOpacity
          disabled={loadingTicket}
          style={styles.greenButton}
          onPress={async () => {
            if (!elementsChosen && !conceptosChosen) {
              Alert.alert(
                "Tienes que elegir al menos un concepto o un elemento"
              );
              return;
            }
            setLoadingTicket(true);
            await imprimirTicketPanelControl(
              elementsChosen,
              conceptosChosen,
              selectedPrinters,
              restaurantChosen,
              authTokens?.access,
              añadirConceptosFacturados,
              añadirItemsFacturados,
              setElementsChosen
            );
            setLoadingTicket(false);
          }}
        >
          <Text style={styles.buttonText}>
            Imprimir ticket con los elementos seleccionados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.greenButton}
          onPress={() => {
            navigation.navigate("Factura Completa Desde Panel De Control", {
              elementsChosen: elementsChosen,
              conceptosChosen: conceptosChosen,
            });
          }}
        >
          <Text style={styles.buttonText}>
            Imprimir factura completa con los elementos seleccionados
          </Text>
        </TouchableOpacity>

        {loadingCleaning ? (
          <ActivityIndicator size="large"></ActivityIndicator>
        ) : null}

        <TouchableOpacity
        disabled={loadingCleaning}
          style={styles.redButton}
          onPress={() => {
            clearElements(restaurantChosen.pk);
          }}
        >
          <Text style={styles.buttonText}>Limpiar elementos seleccionados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PanelControl;

const styles = StyleSheet.create({
  timeOfReservation: {
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "rgb(107,106,106)",
    marginBottom: 10,
  },
  textsmall: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
    margin: 15,
  },
  text: {
    marginTop: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textunderlined: {
    marginTop: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontFamily: "Function-Regular",
    textDecorationLine: "underline",
  },
  pickerstyleios: {
    color: "white",
    height: 40,
  },
  pickerstyleandroid: {
    color: "white",
  },
  change_box: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  calculateText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  calculateTextred: {
    color: "red",
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "Function-Regular",
    marginBottom: 10,
    textAlign: "center",
  },
  calculateTextBig: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Function-Regular",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    height: 40,
    minWidth: 80,
    textAlign: "center",
    marginBottom: 10,
  },
  greenButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  redButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Function-Regular",
    textAlign: "center",
  },
  containerthreecolumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
});

//REPASADO Y LIMPIADO
