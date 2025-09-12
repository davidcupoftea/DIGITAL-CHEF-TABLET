import { useEffect, useState, useContext } from "react";
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
import MesaTableYSusRelaciones from "./MesaTableYSusRelaciones.jsx";
import MesaTablePanelControlHorizontal from "./MesaTablePanelControlHorizontal.jsx";
import TableWithOrderElementsControlPanel from "./TableWithOrderElementsControlPanel.jsx";
import Decimal from "decimal.js";
import {
  imprimirTicketPanelControl,
  imprimirProformaPanelControl,
} from "../services/printerFunctions.jsx"; // DESCOMENTAR PARA VERSION CON IMPRESORA
import { FacturadosContext } from "./ConceptosFacturadosProvider.jsx";

const PanelControl = () => {
  const [rooms, setRoomsState] = useState([{ room: "Todas", id: "Todas" }]);
  const [room, setRoom] = useState("Todas");

  const [loadedRooms, setLoadedRooms] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [tables, setTables] = useState([]);
  const [loadedTables, setLoadedTables] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const fetchRooms = async (restaurantChosen_pk) => {
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
  };

  const getRooms = async () => {
    if (authTokens != null && authTokens != "null") {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      fetchRooms(restaurantChosen_pk);
    }
  };

  useEffect(() => {
    getRooms();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      getRooms();
    });
    return unsubscribe;
  }, [isFocused]);

  const getTables = async (restaurantChosen_pk) => {
    setLoadingTables(true);
    setLoadedTables(false);
    if (room != null) {
      const jsonData = await fetch(
        BASE_URL + "tables-and-relationships-dc/" + restaurantChosen_pk + "/",
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
      //console.log('TABLES ARE', tables)
      setTables([...tables]);
      setLoadingTables(false);
      setLoadedTables(true);
    }
  };

  const gettingInfoForTables = async () => {
    if (authTokens != null && authTokens != "null") {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      getTables(restaurantChosen_pk);
    }
  };

  useEffect(() => {
    gettingInfoForTables();
  }, [room]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      gettingInfoForTables();
    });
    return unsubscribe;
  }, [isFocused]);

  const getPlatform = () => {
    if (Device.osName === "Android" || Platform.OS === "android") {
      return "android";
    } else if (
      Device.osName === "iOS" ||
      Device.osName === "iPadOS" ||
      Platform.OS === "ios"
    ) {
      return "ios";
    }
  };

  const renderRooms = () => {
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
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.textsmall}>
          Estás viendo las mesas y sus relaciones del restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>

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

        {loadedRooms && !loadingRooms && rooms.length != 0
          ? tables.map((mesa, index) => (
              <MesaTableYSusRelaciones
                table={mesa}
                key={index}
                room={room}
                tablesInRoom={tables}
              />
            ))
          : null}

        {loadedRooms && !loadingRooms && rooms.length == 0 ? (
          <Text style={styles.textsmall}>
            No hay resultados que coinciden con tu búsqueda
          </Text>
        ) : null}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Crear mesa")}
      >
        <Text style={styles.addButtonText}>Crear nueva mesa</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Crear sala")}
      >
        <Text style={styles.addButtonText}>Crear nueva sala</Text>
      </TouchableOpacity>
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
  addButton: {
    padding: 12,
    backgroundColor: "#2271b3",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

//REPASADO Y LIMPIADO
