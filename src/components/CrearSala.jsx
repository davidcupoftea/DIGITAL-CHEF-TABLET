import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import { BASE_URL } from "../services/index.jsx";

const CrearSalaScreen = ({ navigation }) => {
  const [name, setName] = useState("");

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const handleCreate = async () => {
    if (!name) {
      return Alert.alert("Error", "Debes poner un nombre a la sala");
    }

    const restaurant_pk = await getAndSetRestaurant(authTokens?.access, setRestaurantChosen);

    try {
      const response = await fetch(`${BASE_URL}rooms-create/${restaurant_pk}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({
          room: name,
        }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        Alert.alert("Éxito", "Sala creada correctamente");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo crear la sala");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre de la sala o terraza</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nombre de la sala"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Crear Sala</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "rgb(107,106,106)" },
  label: { marginTop: 10, fontWeight: "600", color: "#fff", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: "white",
    backgroundColor: "rgb(107,106,106)",
  },
  createButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  createButtonText: { color: "#fff", fontWeight: "600" },
});

export default CrearSalaScreen;
