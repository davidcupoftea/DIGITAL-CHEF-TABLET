import { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  View,
  ScrollView
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL} from "../services/index.jsx";

const MiInfo = () => {
  let [email, setEmail] = useState("");
  let [restaurantsAccessible, setRestaurantsAccessible] = useState([]);

  const navigation = useNavigation();

  const manageTeam = (restaurant_pk) => {
    navigation.navigate('Gestionar Equipo', {eventId: restaurant_pk })
  }

  const { authTokensObject, logOutFunction } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  useEffect(() => {
    const gettingData = async () => {
      const res = await fetch(BASE_URL + "digital-chef-auth-flow/", {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      });

      var jsonData2 = await res.json();

      if (res.status === 200) {
        setEmail(jsonData2.user__email);
        setRestaurantsAccessible(jsonData2.membership_to_restaurant);
      }
    };
    const unsubscribe = navigation.addListener("focus", () => {
      gettingData();
    });
    return unsubscribe;
  }, []);


  return (
    <KeyboardAvoidingView style={styles.viewable}>
      <ScrollView>
        <Text style={styles.text}> Email </Text>
        <TextInput
          style={styles.textinput}
          onChangeText={setEmail}
          value={email}
        />
        <Text style={styles.texttopmargin}>
          {" "}
          Restaurantes a los que tienes/has pedido acceso{" "}
        </Text>
        {restaurantsAccessible.map((e, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.textcard}>
              ({e.restaurant.restaurant_name}) -{" "}
              {e.group == "RestaurantOwners" ? "Propietario" : null}
              {e.group == "RestaurantManagers" ? "Manager" : null}
              {e.group == "RestaurantWaiters" ? "Camarero" : null} 
              {e.group == "Copywriters" ? "Copywriter": null} - {" "} 
              {e.granted ? (
                <Text style={styles.textcard}>Autorizado</Text>
              ) : (
                <Text style={styles.textcard}>No autorizado</Text>
              )}
              {"\n"}
              {e.restaurant.address}
            </Text>

            {e.granted && e.group == "RestaurantOwners" ? (
              <TouchableOpacity onPress={()=> manageTeam(e.restaurant.pk)}style={styles.buttonforcard}>
                <Text style={styles.textbutton}>Gestionar equipo</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
        
        <TouchableOpacity
          onPress={() => logOutFunction()}
          style={styles.buttonforlogout}
        >
          <Text style={styles.buttontextforlogout}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.textpolicy}>Lee la política de privacidad y los términos y condiciones <Text onPress={()=>{navigation.navigate('Términos y condiciones')}}style={styles.textunderlined}>aquí</Text></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MiInfo;

const styles = StyleSheet.create({
  viewable: {
    padding: 20,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
  textpolicy: {
    color: "white",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Function-Regular",
    fontSize: 20,
  },
  textunderlined: {
    color: "white",
    textAlign: "center",
    textDecorationLine: "underline",
    fontFamily: 'Function-Regular',
    fontSize: 20,
  },
  textbutton: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textcard: {
    color: "black",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
  card: {
    flexDirection: "column",
    marginTop: 20,
    padding: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  buttonforcard: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  texttopmargin: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    marginTop: 20,
    fontFamily: "Function-Regular",
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
    fontSize: 17,
  },
  buttonforlogout: {
    marginTop: 30,
    padding: 10,
    borderColor: "white",
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 1,
  },
  buttontextforlogout: {
    padding: 5,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 25,
  }
});

//REPASADO Y REVISADO
