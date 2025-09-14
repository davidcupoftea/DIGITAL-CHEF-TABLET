import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Device from "expo-device";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import { BASE_URL } from "../services/index.jsx";

const CrearMesaScreen = ({ navigation, tablesInRoom = [] }) => {
  const [name, setName] = useState("");
  const [numberOfComensals, setNumberOfComensals] = useState("");
  const [inPatio, setInPatio] = useState(false);
  const [nearAWindow, setNearAWindow] = useState(false);
  const [movable, setMovable] = useState(true); // ✔ por defecto true
  const [unavoidableHittingTheWall, setUnavoidableHittingTheWall] =
    useState(false);
  const [spotAtTheSides, setSpotAtTheSides] = useState(true); // ✔ por defecto true
  const [square, setSquare] = useState(true);

  const [rooms, setRoomsState] = useState([]);
  const [room, setRoom] = useState(null);
  const [loadedRooms, setLoadedRooms] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

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

  const handleCreate = async () => {
    if (!name) {
      return Alert.alert("Error", "Debes poner un nombre a la mesa");
    }

    const restaurantChosen_pk = await getAndSetRestaurant(
      authTokens?.access,
      setRestaurantChosen
    );

    try {
      const response = await fetch(
        `${BASE_URL}tables-create/${restaurantChosen_pk}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens?.access),
          },
          body: JSON.stringify({
            name_of_the_table: name,
            number_of_comensals: Number(numberOfComensals) || 0,
            in_patio: inPatio,
            near_a_window: nearAWindow,
            movable,
            unavoidable_hitting_the_wall: unavoidableHittingTheWall,
            spot_at_the_sides: spotAtTheSides,
            square,
            room_id: room,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "ok") {
        Alert.alert("Éxito", "Mesa creada correctamente");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo crear la mesa");
    }
  };

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
    setRoomsState([...jsonData.rooms]);
    setRoom(jsonData.rooms[0].id);
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
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre de la mesa</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Número de comensales</Text>
      <TextInput
        style={styles.input}
        value={String(numberOfComensals)}
        onChangeText={(text) => setNumberOfComensals(text.replace(/\D/g, ""))}
        keyboardType="numeric"
        placeholderTextColor="#aaa"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>En patio</Text>
        <Switch value={inPatio} onValueChange={setInPatio} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Cerca de ventana</Text>
        <Switch value={nearAWindow} onValueChange={setNearAWindow} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Móvil</Text>
        <Switch value={movable} onValueChange={setMovable} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Choque con pared inevitable</Text>
        <Switch
          value={unavoidableHittingTheWall}
          onValueChange={setUnavoidableHittingTheWall}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Asientos a los lados</Text>
        <Switch value={spotAtTheSides} onValueChange={setSpotAtTheSides} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          {square ? "Mesa cuadrada" : "Mesa redonda"}
        </Text>
        <Switch value={square} onValueChange={setSquare} />
      </View>

      <Text style={styles.labelsala}>
        Sala o terraza donde se encuentra la mesa:
      </Text>

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

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Crear Mesa</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "rgb(107,106,106)" },
  label: { marginTop: 10, fontWeight: "600", color: "#fff", marginBottom: 10 },
  switchLabel: { color: "#fff" },
  timeOfReservation: {
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "rgb(107,106,106)",
    marginBottom: 10,
  },
  labelsala: {
    marginTop: 10,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: "white",
    backgroundColor: "rgb(107,106,106)",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  nearTablesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  nearTableItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#444",
  },
  nearTableItemSelected: {
    backgroundColor: "#2271b3",
    borderColor: "#2271b3",
  },
  nearTableText: { color: "#fff" },
  nearTableTextSelected: { color: "#fff", fontWeight: "600" },
  createButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  createButtonText: { color: "#fff", fontWeight: "600" },
  pickerstyleios: {
    color: "white",
    height: 40,
  },
  pickerstyleandroid: {
    color: "white",
  },
});

export default CrearMesaScreen;
