import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { BASE_URL, WARNING_NOT_SCROLLABLE } from "../services/index.jsx";
import RegistroInList from "./RegistroInList.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import * as Device from "expo-device";
import { Picker } from "@react-native-picker/picker";

const Registros = ({ route }) => {
  const navigation = useNavigation();
  const [registros, setRegistros] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [gotten, setGotten] = useState(false);

  const [orderDateString, setOrderDateString] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [filterByDateCheckBox, setFilterByDateCheckBox] = useState(false);

  const [serie, setSerie] = useState("Todas");

  const onChangePicker = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setOrderDate(currentDate);
      if (Device.osName === "Android" || Platform.OS === "android") {
        let Day = String(currentDate.getDate()).padStart(2, "0");
        let Month = String(currentDate.getMonth() + 1).padStart(2, "0");
        let Year = currentDate.getFullYear();
        toggleDatePicker();
        setOrderDateString(`${Year}-${Month}-${Day}`);
      }
    } else {
      toggleDatePicker();
    }
  };

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const fetchRegistros = async (restaurantChosen_pk) => {
    setLoaded(false);
    const res = await fetch(
      BASE_URL + "registros-digital-chef/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ serie: serie }),
      }
    );
    var jsonData = await res.json();

    if (jsonData.status == "nook") {
      setGotten(false);
      setLoading(false);
      setLoaded(true);
      Alert.alert("Error", jsonData.message);
    } else {
      setRegistros([]);
      setRegistros([...jsonData]);
      setGotten(true);
      setLoading(false);
      setLoaded(true);
    }

    return jsonData;
  };

  const fetchRegistrosByDate = async (restaurantChosen_pk) => {
    setLoaded(false);
    const res = await fetch(
      BASE_URL + "registros-digital-chef-by-date/" + restaurantChosen_pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ date: orderDateString, serie: serie }),
      }
    );
    var jsonData = await res.json();

    if (jsonData.status == "nook") {
      setGotten(false);
      setLoading(false);
      setLoaded(true);
      Alert.alert("Error", jsonData.message);
    } else {
      setRegistros([]);
      setRegistros([...jsonData]);
      setGotten(true);
      setLoading(false);
      setLoaded(true);
    }
    return jsonData;
  };

  const fetchRegistrosByDateOrNoDate = async () => {
    if (authTokens != null && authTokens != "null" && filterByDateCheckBox) {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      if (orderDateString != "") {
        fetchRegistrosByDate(restaurantChosen_pk);
      } else {
        Alert.alert("Pon una fecha para poder ver facturas");
      }
    } else if (
      authTokens != null &&
      authTokens != "null" &&
      !filterByDateCheckBox
    ) {
      const restaurantChosen_pk = await getAndSetRestaurant(
        authTokens?.access,
        setRestaurantChosen
      );
      fetchRegistros(restaurantChosen_pk);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      fetchRegistrosByDateOrNoDate();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchRegistrosByDateOrNoDate();
  }, [filterByDateCheckBox, orderDateString, serie]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (authTokens != null && authTokens != "null") {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchRegistros(restaurantChosen_pk);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const fetchFacturasByDateInside = async () => {
      if (authTokens != null && authTokens != "null" && filterByDateCheckBox) {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchRegistrosByDate(restaurantChosen_pk);
      } else if (
        authTokens != null &&
        authTokens != "null" &&
        !filterByDateCheckBox
      ) {
        const restaurantChosen_pk = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchRegistros(restaurantChosen_pk);
      }
    };
    fetchFacturasByDateInside();
  }, [filterByDateCheckBox, orderDateString]);

  useEffect(() => {
    const getRegistros = async () => {
      if (route.params?.refresh) {
        const pk_restaurante_elegido = await getAndSetRestaurant(
          authTokens?.access,
          setRestaurantChosen
        );
        fetchRegistros(pk_restaurante_elegido);
        navigation.setParams({ refresh: false });
      }
    };
    getRegistros();
  }, [route.params?.refresh]);

  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const [gapWidth, setGapWidth] = useState(0);

  useEffect(() => {
    setGapWidth(containerWidth * 0.02);
  }, [containerWidth]);

  return (
    <View style={styles.ofertas}>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás viendo los registros del restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
      ) : null}
      <ScrollView>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo los registros del restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}

        <Text style={styles.textsmall}>Fecha</Text>

        <Pressable
          onPress={() => {
            setShowPicker(true);
          }}
        >
          <TextInput
            style={styles.textinput}
            placeholder="Fecha para filtrar"
            value={orderDateString}
            onChangeText={setOrderDate}
            placeholderTextColor="white"
            editable={false}
            onPressIn={toggleDatePicker}
          />
        </Pressable>

        {showPicker && (
          <RNDateTimePicker
            mode="date"
            display="spinner"
            value={orderDate}
            onChange={onChangePicker}
            dateFormat="day month year"
            style={styles.datePicker}
            textColor="white"
          />
        )}

        {showPicker &&
          (Device.osName === "iOS" ||
            Device.osName === "iPadOS" ||
            Platform.OS === "ios") && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <TouchableOpacity style={styles.button}>
                <Text
                  style={styles.buttontextCancel}
                  onPress={toggleDatePicker}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttontextConfirm} onPress={confirmIOSDate}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          )}

        <BouncyCheckbox
          size={25}
          isChecked={filterByDateCheckBox}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Marca este checkbox para filtrar por este día"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15, padding: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(filterByDateCheckBox) => {
            setFilterByDateCheckBox(!filterByDateCheckBox);
          }}
        />

        <Text style={styles.textsmall}>Serie</Text>
        <View style={styles.typeOfInvoice}>
          <Picker
            selectedValue={serie}
            style={styles.picker}
            dropdownIconColor="white"
            onValueChange={(itemValue, itemIndex) => setSerie(itemValue)}
          >
            <Picker.Item label="Todas" value="" />
            <Picker.Item label="F1" value="F1" />
            <Picker.Item label="F2" value="F2" />
            <Picker.Item label="R4" value="R4" />
            <Picker.Item label="R5" value="R5" />
          </Picker>
        </View>

        <View
          style={styles.containerthreecolumns}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainerWidth(width);
          }}
        >
          {loading && !gotten ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 20,
              }}
            >
              <ActivityIndicator size={33} />
            </View>
          ) : !loading && !gotten ? (
            <Text style={styles.textsmall}>
              No puedes acceder a estos datos
            </Text>
          ) : (
            registros.map((registro, index) => {
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
                  <RegistroInList
                    key={index}
                    registro={registro}
                  ></RegistroInList>
                </View>
              );
            })
          )}
        </View>

        {loaded && !loading && registros != null && registros.length == 0 ? (
          <Text style={styles.textsmall}>No hay registros</Text>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ofertas: {
    flex: 1,
    flexGrow: 1,
  },
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textinput: {
    padding: 14,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    fontSize: 16,
    margin: 10,
  },
  datePicker: {
    backgroundColor: "black",
  },
  picker: {
    color: "white",
  },
  typeOfInvoice: {
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "rgb(107,106,106)",
    margin: 10,
  },
  containerthreecolumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
});

export default Registros;

//REPASADO Y REVISADO
