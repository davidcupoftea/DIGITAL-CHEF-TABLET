import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import {
  BASE_URL,
} from "../services/index.jsx";

const ManageTeam = ({route}) => {
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState([])

  let { authTokensObject } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  const navigation = useNavigation();

  const grantAccess = async (type_of_access, pk) => {
    let response = await fetch(BASE_URL + 'owner-grants-access/' + route.params.eventId + '/',{
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
      body: JSON.stringify({type_of_access: type_of_access, membership: pk})
    })

    const data = await response.json()

    if (type_of_access == 'no_access'){
      Alert.alert('Éxito', 'Se ha denegado el acceso a esta persona')

    } else {
    Alert.alert('Éxito', 'Se ha asignado el rol a esta persona, puedes quitárselo en cualquier momento dando al botón correspondiente')
    }

    fetchMemberships()
  }


  const fetchMemberships = async () => {
    const res = await fetch(BASE_URL + "get-all-memberships-for-restaurant/" + route.params.eventId + '/', {
      method: "GET",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });

    var jsonData3 = await res.json();

    setMemberships(jsonData3.data);
    setLoading(false)

  };


  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      fetchMemberships();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (<>
          {memberships.map((membership, index)=>(
            <View key={index} style={styles.card}>
              <Text style={styles.textsmall}>{membership.user_profile.nombre}</Text>
              <Text style={styles.textsmall}>{membership.user_profile.email}</Text>
              {membership.granted && membership.group == 'RestaurantWaiters'? <Text style={styles.textsmalltopmargin}>Tiene acceso: Camarero</Text>:null}
              {membership.granted && membership.group == 'RestaurantManagers'? <Text style={styles.textsmalltopmargin}>Tiene acceso: Manager</Text>:null}
              {membership.granted && membership.group == 'RestaurantOwners'? <Text style={styles.textsmalltopmargin}>Tiene acceso: Propietario</Text>:null}
              {membership.granted && membership.group == 'Copywriters'? <Text style={styles.textsmalltopmargin}>Tiene acceso: Copywriter</Text>:null}
              {!membership.granted? <Text style={styles.textsmalltopmargin}>No tiene acceso</Text>:null}
              <TouchableOpacity onPress={() => {grantAccess('waiter', membership.pk)}} style={styles.button}><Text style={styles.textbutton}>Dar acceso de camarero</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => {grantAccess('manager', membership.pk)}} style={styles.buttonorange}><Text style={styles.textbutton}>Dar acceso de manager</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => {grantAccess('copywriter', membership.pk)}} style={styles.buttonyellow}><Text style={styles.textbuttonblack}>Dar acceso de copywriter</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => {grantAccess('owner', membership.pk)}} style={styles.buttonred}><Text style={styles.textbutton}>Dar acceso de propietario</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => {grantAccess('no_access', membership.pk)}} style={styles.buttongreen}><Text style={styles.textbutton}>Denegar acceso</Text></TouchableOpacity>
            </View>

          ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
  },
  card: {
    flexDirection: "column",
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 40,
    elevation: 10,
    shadowOffset:{
        width: 5,
        height:5,
    },
    shadowColor: '#f0ffff',
    shadowOpacity: 0.8,
  },
  button: {
    marginTop: 20,
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
  buttonorange: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "orange",
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
    buttonyellow: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "yellow",
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
  buttonred: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "red",
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
  buttongreen: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "green",
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
  textbutton: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
    textbuttonblack: {
    fontSize: 25,
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  textsmall: {
    color: "black",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
  textsmalltopmargin:{
    marginTop: 10,
    color: "black",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
});
export default ManageTeam;

//REPASADO Y LIMPIADO
