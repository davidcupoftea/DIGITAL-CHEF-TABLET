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

const ClaimMembershipToRestaurant = () => {
  const [loading, setLoading] = useState(false);
  const [restaurantsAlreadyClaimed, setRestaurantsAlreadyClaimed] = useState([])
  const [restaurantsToClaim, setRestaurantsToClaim] = useState([])
  const [restaurants, setRestaurants] = useState([])

  let { authTokensObject, privacyAcceptation, getUserData, logOutFunction } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;


  const navigation = useNavigation();

  const sendingClaimMembership = async () => {
    if (restaurantsToClaim.length == 0){
      Alert.alert('¡Tienes que elegir un restaurante!')
      return
    }
    let response = await fetch(BASE_URL + "create-restaurant-memberships/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
      body: JSON.stringify({ restaurants_to_claim: restaurantsToClaim }),
    });
    const data = await response.json();

    if (response.status === 200) {
      Alert.alert('Éxito', 'Has reclamado correctamente tu vinculación con el restaurante. Espera a que el propietario la confirme también')
      fetchRestaurants();
    } else {
      fetchRestaurants()
    }
  };

  const addRestaurant = (pk) => {
    setRestaurantsToClaim((prevState) => [...prevState, pk]);
  };

  const removeRestaurant = (pk) => {
    let new_restaurantsToClaim = [...restaurantsToClaim];
    new_restaurantsToClaim = new_restaurantsToClaim.filter((restaurant) => restaurant != pk);
    setRestaurantsToClaim(new_restaurantsToClaim);
  };

  const selectRestaurant = (pk) => {
    if (!restaurantsToClaim.includes(pk)){
      addRestaurant(pk)
    } else {
      removeRestaurant(pk)
    }

  }

  const fetchRestaurants = async () => {
    const res = await fetch(BASE_URL + "get-all-restaurants-and-claims-digital-chef/", {
      method: "GET",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });

    var jsonData3 = await res.json();

    setRestaurants(jsonData3.data);

    for (let restaurant of jsonData3.data){
      if (restaurant.membership==true){
        setRestaurantsAlreadyClaimed((prevState) => [...prevState, restaurant.restaurant.pk])
        setRestaurantsToClaim((prevState) => [...prevState, restaurant.restaurant.pk])
      }

    }

  };


  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      fetchRestaurants();
    });
    return unsubscribe;
  }, [navigation]);

  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const [gapWidth, setGapWidth] = useState(0);

  useEffect(() => {
    setGapWidth(containerWidth * 0.02);
  }, [containerWidth]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.textsmallwhite}>Sal de esta cuenta <Text onPress={logOutFunction} style={styles.textsmallwhiteunderlined}>aquí</Text></Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (<>
                <View
                  style={styles.containerthreecolumns}
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    setContainerWidth(width);
                  }}
                >
          {restaurants.map((restaurant, index)=>{
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
            <View key={index} style={!restaurantsToClaim.includes(restaurant.restaurant.pk)? styles.card: styles.greencard}>
              <Text style={styles.textsmall}>{restaurant.restaurant.restaurant_name}</Text>
              <Text style={styles.textsmall}>{restaurant.restaurant.address}</Text>
              

              {restaurantsAlreadyClaimed.includes(restaurant.restaurant.pk)? <Text style={styles.textsmall}>Ya has reclamado la vinculación con este restaurante</Text>:null}

              <TouchableOpacity style={styles.button} onPress={()=>{selectRestaurant(restaurant.restaurant.pk)}}><Text style={styles.textbutton}>Seleccionar/deseleccionar pertenencia a restaurante</Text></TouchableOpacity>

            </View>
            </View>
            )

          })}
          </View>
          </>
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.googlesign}
        onPress={() => {
          sendingClaimMembership();
        }}
      >
        <Text style={styles.googlesigntext}>Seleccionar estos restaurantes</Text>
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
  card: {
    flexDirection: "column",
    marginTop: 20,
    
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
  greencard: {
    flexDirection: "column",
    marginTop: 20,
    
    padding: 20,
    backgroundColor: "white",
    borderWidth: 6,
    borderColor: "green",
    borderRadius: 40,
    elevation: 10,
    shadowOffset:{
        width: 5,
        height:5,
    },
    shadowColor: '#f0ffff',
    shadowOpacity: 0.8,
  },
  googlesign: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    margin: 15,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
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
  textbutton: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  googlesigntext: {
    color: "black",
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
  textsmall: {
    color: "black",
    padding: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
    textsmallwhite: {
    color: "white",
    paddingTop: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
   textsmallwhiteunderlined: {
    color: "white",
    paddingTop: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
    textDecorationLine: 'underline'
  },
  containerthreecolumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  }
});
export default ClaimMembershipToRestaurant;

//REPASADO Y LIMPIADO
