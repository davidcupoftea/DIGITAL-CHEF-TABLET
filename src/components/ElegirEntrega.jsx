import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import * as Device from "expo-device";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useIsFocused} from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { OrderContext } from "./OrderContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  WARNING_NOT_SCROLLABLE, checkTimeIsLower, getOffset
} from "../services/index.jsx";

const ElegirEntrega = () => {
  const [deliveryOrTakeAway, setDeliveryOrTakeAway] = useState({
    delivery: false,
    takeaway: false,
    fromtable: false,
  });
  const [showPicker, setShowPicker] = useState(false);
  const [takeawayTime, _setTakeawayTime] = useState("");
  const [takeawayTimeString, _setTakeawayTimeString] = useState("");
  const [phoneNumber, _setPhoneNumber] = useState("");
  const [pickerDate, setPickerDate] = useState(new Date());
  const [addressToSend, _setAddressToSend] = useState("");
  const [numberOfTable, _setNumberOfTable] = useState("");
  const [warningDatetime, setWarningDatetime] = useState(false)
  const [email, _setEmail] = useState('anonimo3571@anonimo3571.es')

  const setTakeawayTime = (value) => {
    _setTakeawayTime(value)
    setOrder(prevState => ({...prevState, takeawayTime: value}))
  }
  const setTakeawayTimeString = (value) => {
    _setTakeawayTimeString(value)
    setOrder(prevState => ({...prevState, takeawayTimeString: value}))
  }
  const setPhoneNumber = (value) => {
    _setPhoneNumber(value)
    setOrder({...order, phoneNumber: value})
  }
  const setAddressToSend = (value) => {
    _setAddressToSend(value)
    setOrder({...order, addressToSend: value})
  }

  const setNumberOfTable = (value) => {
    _setNumberOfTable(value)
    setOrder({...order, numberOfTable: value})
  }

  const setEmail = (value) => {
    _setEmail(value)
    setOrder({...order, email: value})
  }

  const [
    startedEditingPhoneNumberDelivery,
    setStartedEditingPhoneNumberDelivery,
  ] = useState(false);
  const [
    startedEditingPhoneNumberTakeaway,
    setStartedEditingPhoneNumberTakeaway,
  ] = useState(false);
  const [startedEditingAddress, setStartedEditingAddress] = useState(false);
  const [startedEditingDateTakeaway, setstartedEditingDateTakeaway] =
    useState(false);
  const [startedEditingNumberOfTable, setStartedEditingNumberOfTable] =
    useState(false);

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { order, setOrder } = useContext(OrderContext);

  const navigation = useNavigation();
  const isFocused = useIsFocused();


  const updateOrder = () => {

    if (deliveryOrTakeAway.takeaway == true && takeawayTimeString){    
      const timeIsLower = checkTimeIsLower(takeawayTimeString)
      if(timeIsLower){
        Alert.alert('¡No puedes poner una hora que ya ha pasado para recoger el pedido!')
        return
      }
      }
    
    setOrder({
      ...order,
      delivery: deliveryOrTakeAway.delivery,
      takeaway: deliveryOrTakeAway.takeaway,
      fromtable: deliveryOrTakeAway.fromtable,
      phoneNumber: phoneNumber,
      addressToSend: addressToSend,
      takeawayTime: takeawayTime,
      takeawayTimeString: takeawayTimeString,
      numberOfTable: numberOfTable,
      email: email,
    });
    if (
      deliveryOrTakeAway.delivery == false &&
      deliveryOrTakeAway.takeaway == false &&
      deliveryOrTakeAway.fromtable == false
    ) {
      Alert.alert("Por favor, elige una forma de envío");
    } else if (
      deliveryOrTakeAway.delivery == true && (
      phoneNumber == "" ||
      addressToSend == "")
    ) {
      Alert.alert("Por favor, proporciona número de teléfono y dirección");
    } else if (
      deliveryOrTakeAway.takeaway == true && (
      phoneNumber == "" ||
      takeawayTimeString == "")
    ) {
      Alert.alert("Por favor, proporciona número de teléfono y hora");
    } else if (
      deliveryOrTakeAway.fromtable == true &&
      numberOfTable == ""
    ) {
      Alert.alert("Por favor, proporciona el número de mesa");
    } else {
      navigation.navigate("Elegir Productos");
    }
  };

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };


  useEffect(() => {

    const unsubscribe = navigation.addListener("didFocus", async () => {

      if (order) {
        if (order.delivery != undefined && order.takeaway != undefined && order.fromtable != undefined ) {
        setDeliveryOrTakeAway({
          delivery: order.delivery,
          takeaway: order.takeaway,
          fromtable: order.fromtable,
        });
      }
        _setAddressToSend(order.addressToSend || "");
        _setPhoneNumber(order.phoneNumber || "");
        _setTakeawayTime(order.takeawayTime|| "")
        _setTakeawayTimeString(order.takeawayTimeString || "");
        _setNumberOfTable(order.numberOfTable|| "")
      }

  });
  return unsubscribe;
  }, [navigation]);



  useEffect(() => {
    if (takeawayTimeString){
    const timeIsLower = checkTimeIsLower(takeawayTimeString,false)
    setWarningDatetime(timeIsLower)
    }
  },[takeawayTimeString])

  useEffect(() => {

    const unsubscribe = navigation.addListener("focus", async () => {

      if (order) {
        if (order.delivery != undefined && order.takeaway != undefined && order.fromtable != undefined ) {
        setDeliveryOrTakeAway({
          delivery: order.delivery,
          takeaway: order.takeaway,
          fromtable: order.fromtable,
        });
      }
        _setAddressToSend(order.addressToSend || "");
        _setPhoneNumber(order.phoneNumber || "");
        _setTakeawayTime(order.takeawayTime|| "")
        _setTakeawayTimeString(order.takeawayTimeString || "");
        _setNumberOfTable(order.numberOfTable|| "")
      }

  });
  return unsubscribe;
  }, [navigation, isFocused]);

  const onChangePicker = ({ type }, selectedTime) => {
    if (type == "set") {
      const currentTime = selectedTime;
      const offset = getOffset()
      const timestamp = parseInt(currentTime.getTime(),10) + offset*60*60*1000
      const currentTimeUpdated = new Date(timestamp).toISOString()
      setTakeawayTime(currentTimeUpdated);
      if (Device.osName === "Android" || Platform.OS === "android") {
        let Hour = String(currentTime.getHours()).padStart(2, "0");
        let Minutes = String(currentTime.getMinutes()).padStart(2, "0");
        toggleDatePicker();
        setTakeawayTimeString(`${Hour}:${Minutes}`);
      }
    } else {
      toggleDatePicker();
    }
  };

  const confirmIOSDate = () => {
    let Hour = String(takeawayTime.getHours()).padStart(2, "0");
    let Minutes = String(takeawayTime.getMinutes()).padStart(2, "0");
    setTakeawayTimeString(`${Hour}:${Minutes}`);
    toggleDatePicker();
  };

  return (
    <View style={styles.container}>
      {WARNING_NOT_SCROLLABLE ? (
        <Text style={styles.textsmall}>
          Estás a punto de hacer un pedido en el restaurante{" "}
          {restaurantChosen.franchise} localizado en {restaurantChosen.address}
        </Text>
      ) : null}
      <ScrollView>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás a punto de hacer un pedido en el restaurante{" "}
            {restaurantChosen.franchise} localizado en{" "}
            {restaurantChosen.address}
          </Text>
        ) : null}

        <View style={styles.screen}>
        <Text style={styles.textBold}>Email (Opcional):</Text>
        <TextInput
                style={styles.textinput}
                placeholder="El email de la persona que recibe el pedido"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="white"
                editable={true}/>
          {email== 'anonimo3571@anonimo3571.es'? <Text style={styles.texterror}>El email es opcional, pero ALTAMENTE recomendado</Text>:null}
          {!email ? <Text style={styles.texterror}>No puedes dejar el campo de email vacío</Text>:null}
          <Text style={styles.textBold}>Modo de entrega:</Text>
          <BouncyCheckbox
            size={25}
            isChecked={deliveryOrTakeAway.delivery}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Envío"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              color: "white",
              fontSize: 20,
              textDecorationLine: "none",
            }}
            onPress={(delivery) => {
              setDeliveryOrTakeAway({
                delivery: !delivery,
                takeaway: false,
                fromtable: false,
              });
              setShowPicker(false);
              setStartedEditingAddress(false);
              setStartedEditingPhoneNumberDelivery(false);
              setOrder({
                ...order,
                delivery: !delivery,
                takeaway: false,
                fromtable: false,
              });
            }}
          />

          {deliveryOrTakeAway.delivery && (
            <>
              <Text style={styles.textnotcenter}>
                La dirección de {restaurantChosen.localidad} donde quieres enviar el pedido:
              </Text>
              <TextInput
                style={styles.textinput}
                placeholder="La dirección a la que quieres enviar el pedido"
                value={addressToSend}
                onBlur={() => {
                  setStartedEditingAddress(true);
                }}
                onChangeText={setAddressToSend}
                placeholderTextColor="white"
                editable={true}
              />
              {addressToSend.length == 0 && startedEditingAddress == true ? (
                <Text style={styles.texterror}>
                  Tienes que rellenar este campo
                </Text>
              ) : null}
            </>
          )}
          {deliveryOrTakeAway.delivery && (
            <>
              <Text style={styles.textnotcenter}>
                Introduce un número de teléfono:
              </Text>
              <TextInput
                style={styles.textinput}
                placeholder="El número de teléfono"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="white"
                onBlur={() => {
                  setStartedEditingPhoneNumberDelivery(true);
                }}
                editable={true}
                keyboardType="numeric"
              />
              {phoneNumber.length == 0 &&
              startedEditingPhoneNumberDelivery == true ? (
                <Text style={styles.texterror}>
                  Tienes que rellenar este campo
                </Text>
              ) : null}
            </>
          )}

          <BouncyCheckbox
            size={25}
            isChecked={deliveryOrTakeAway.takeaway}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Recoger en tienda"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              color: "white",
              fontSize: 20,
              textDecorationLine: "none",
            }}
            onPress={(takeaway) => {
              setDeliveryOrTakeAway({
                delivery: false,
                takeaway: !takeaway,
                fromtable: false,
              });
              setShowPicker(false);
              setstartedEditingDateTakeaway(false);
              setStartedEditingPhoneNumberTakeaway(false);
              setOrder({
                ...order,
                delivery: false,
                takeaway: !takeaway,
                fromtable: false,
              });
            }}
          />

          {deliveryOrTakeAway.takeaway && (
            <>
              <Text style={styles.textnotcenter}>
                Recoger en la tienda a la hora:
              </Text>
              <Pressable
                onPress={() => {
                  setShowPicker(!showPicker);
                  setstartedEditingDateTakeaway(true);
                }}
              >
                <TextInput
                  style={styles.textinput}
                  placeholder="La hora a la que el cliente quiere pasarse por el restaurante"
                  value={takeawayTimeString}
                  onChangeText={setTakeawayTimeString}
                  placeholderTextColor="white"
                  onBlur={() => {
                    setstartedEditingDateTakeaway(true);
                  }}
                  editable={false}
                  onPressIn={toggleDatePicker}
                />
              </Pressable>
              {!showPicker && takeawayTimeString != undefined &&
              takeawayTimeString.length == 0 &&
              startedEditingDateTakeaway == true ? (
                <Text style={styles.texterror}>
                  Tienes que rellenar este campo
                </Text>
              ) : null}
              {warningDatetime ? (<Text style={styles.texterror}>La hora no puede ser una hora anterior a la actual</Text>):null}
            </>
          )}

          {showPicker && deliveryOrTakeAway.takeaway && (
            <RNDateTimePicker
              mode="time"
              display="spinner"
              value={pickerDate}
              onChange={onChangePicker}
              style={styles.datePicker}
              textColor="white"
            />
          )}

          {showPicker &&
            deliveryOrTakeAway.takeaway &&
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
                  <Text
                    style={styles.buttontextConfirm}
                    onPress={confirmIOSDate}
                  >
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          {deliveryOrTakeAway.takeaway && (
            <>
              <Text style={styles.textnotcenter}>
                Introduce un número de teléfono:
              </Text>
              <TextInput
                style={styles.textinput}
                placeholder="El número de teléfono"
                value={phoneNumber}
                onBlur={() => setStartedEditingPhoneNumberTakeaway(true)}
                onChangeText={setPhoneNumber}
                placeholderTextColor="white"
                editable={true}
                keyboardType="numeric"
              />
              {phoneNumber.length == 0 &&
              startedEditingPhoneNumberTakeaway == true ? (
                <Text style={styles.texterror}>
                  Tienes que rellenar este campo
                </Text>
              ) : null}
            </>
          )}
          <BouncyCheckbox
            size={25}
            isChecked={deliveryOrTakeAway.fromtable}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Pedir desde la mesa"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              color: "white",
              fontSize: 20,
              textDecorationLine: "none",
            }}
            onPress={(fromtable) => {
              setDeliveryOrTakeAway({
                delivery: false,
                takeaway: false,
                fromtable: !fromtable,
              });
              setShowPicker(false);
              setOrder({
                ...order,
                delivery: false,
                takeaway: false,
                fromtable: !fromtable,
              });
            }}
          />

          {deliveryOrTakeAway.fromtable ? (
            <View>
              <Text style={styles.textnotcenter}>Número de mesa (si es más de una sepáralas con comas)</Text>
              <TextInput
                style={styles.textinput}
                placeholder="El número de la mesa en la que están sentados"
                placeholderTextColor="white"
                onChangeText={setNumberOfTable}
                onBlur={() => {
                  setStartedEditingNumberOfTable(true);
                }}
                value={numberOfTable}
              />

              {numberOfTable != undefined && numberOfTable.length == 0 &&
              startedEditingNumberOfTable == true ? (
                <Text style={styles.texterror}>
                  Tienes que rellenar este campo
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.googlesign}
        onPress={() => {
          updateOrder();
        }}
      >
        <Text style={styles.googlesigntext}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
  },
  datePicker: {
    backgroundColor: 'black',
},
  texterror: {
    color: "red",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: 'Function-Regular',
  },
  textnotcenter: {
    color: "white",
    marginTop: 8,
    fontSize: 20,
    fontFamily: 'Function-Regular',
  },
  textBold: {
    color: "white",
    fontSize: 35,
    textAlign: "center",
    marginTop: 15,
    fontFamily: 'Function-Regular',
  },
  screen: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
    paddingHorizontal: 20,
  },
  textinput: {
    padding: 10,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginVertical: 10,
  },
  googlesign: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    margin: 15,
  },
  googlesigntext: {
    color: "black",
    textAlign: "center",
    fontSize: 25,
    fontFamily: 'Function-Regular',
  },
  button: {
    borderColor: "white",
    backgroundColor: "white",
    borderWidth: 1,
    padding: 10,
    marginTop: 15,
  },
  buttontextConfirm: {
    padding: 5,
    color: "green",
    textAlign: "center",
    fontFamily: 'Function-Regular',
  },
  buttontextCancel: {
    padding: 5,
    color: "red",
    textAlign: "center",
    fontFamily: 'Function-Regular',
  },
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 20,
    fontFamily: 'Function-Regular',
  },
});
export default ElegirEntrega;

//REPASADO Y LIMPIADO
