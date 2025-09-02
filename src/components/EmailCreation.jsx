import { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
} from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const EmailCreation = (variable) => {

  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);

  const [addBr, setAddBr] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const [likeFranchise, setLikeFranchise] = useState(false)

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;


  const createEmail = async () => {
    setDisabled(true)
    const restaurant_pk = await getAndSetRestaurant(authTokens?.access, setRestaurantChosen)
      let response = await fetch(
      BASE_URL + "create-email/" + restaurant_pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ title: title, description: description, addBr: addBr, like_franchise: likeFranchise }),
      }
    );
    const data = await response.json();

    if (data.status === 'ok') {
      Alert.alert('¡Email guardado!')
      setDisabled(false)

    } else if (data.status === 'nook'){
      Alert.alert('Ha habido un error con la operación')
      setDisabled(false)
    }
  }


  return (
    <>
      <ScrollView style={styles.scrollviewable}>
        <View style={styles.viewable}>
          <View>
            <Text style={styles.text}>Título</Text>
            <TextInput
              style={styles.textinput}
              onChangeText={setTitle}
              value={title}
            ></TextInput>
          </View>
          <View>
            <Text style={styles.text}>Descripción (puedes usar {'{'}name{'}'} e {'{'}email{'}'}, pero no emojis)</Text>
            <TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={30}
              onChangeText={setDescription}
              value={description}
            ></TextInput>
          </View>

          <BouncyCheckbox
            size={25}
            isChecked={addBr}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Añadir BR's"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(addBr) => {
              setAddBr(!addBr);
            }}
          />

          <BouncyCheckbox
            size={25}
            isChecked={likeFranchise}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Enviar como franquicia (a todos los usuarios)"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(likeFranchise)=>{
              setLikeFranchise(!likeFranchise)
            }}
          />

          {disabled ? <ActivityIndicator size="large" /> : null}
          <TouchableOpacity
            activeOpacity={disabled ? 1 : 0.7} 
            style={styles.savebutton}
            onPress={() => {
              if (!disabled){
              createEmail();
              }
            }}
          >
            <Text style={styles.savebuttontext}>Guardar email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollviewable: {
    flex: 1,
    flexGrow: 1,
  },
  viewable: {
    padding: 20,
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  savebutton: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
  },
  savebuttontext: {
    fontSize: 26,
    padding: 5,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  }
});

export default EmailCreation;

//REPASADO DISEÑO
