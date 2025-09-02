import { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions'
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from './AuthUseContextProvider.jsx'
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from '../services/index.jsx';
import getAndSetRestaurant, { getAndSetRestaurantObject } from '../services/apiCallFavouriteRestaurant.jsx'

import { useRef } from 'react';

;
const Localizacion = () => {
    let [userLocation, setUserLocation] = useState(null);
    let [disabled, setDisabled] = useState(false)
    let [count, setCount] = useState(0)
    let [loading, setLoading] = useState(true)
    const navigation = useNavigation();

    const [ initialPosition, setInitialPosition] = useState({ latitude: '', longitude: '', latitudeDelta: 0.02, longitudeDelta: 0.02})

    const  {authTokensObject} = useContext(AuthFlowContext);
    const [authTokens, setAuthTokens] = authTokensObject;
    let { restaurantChosenObject } = useContext(RestaurantChosenContext);
    const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

    const timeoutRef = useRef(null)

    useEffect(() => {
      const unsubscribe = navigation.addListener("focus", async () => {
          if (authTokens != null && authTokens != 'null'){
        const restaurant_object = await getAndSetRestaurantObject(authTokens?.access);
        setRestaurantChosen(restaurant_object)
        setInitialPosition({...initialPosition, latitude: parseFloat(restaurant_object.latitud), longitude: parseFloat(restaurant_object.longitud)})
        setLoading(false)
      }
      });
      return unsubscribe;
    }, [navigation]);

    const getKimLocation = async (location, restaurantChosen_pk) => {
      location = location || {}
      try {
      const response = await fetch(BASE_URL + 'get-kim-location/' + restaurantChosen_pk.toString() + '/', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Bearer ' + String(authTokens?.access)
        },
        body: JSON.stringify({ ...userLocation })
      })
      const data = await response.json()
      if (data['status'] == 'nook'){
        throw new Error('There has been a problem')
      }
    } catch {
      const response = await fetch(BASE_URL + 'get-kim-location/' + restaurantChosen_pk.toString() + '/', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Bearer ' + String(authTokens?.access)
        },
        body: JSON.stringify({ ...location })
      })
      const data = await response.json()
    }
  }

  

    const createDirectionInstructionsAndGetKimLocation =  async () => {
      const restaurantChosen_pk = await getAndSetRestaurant(authTokens?.access, setRestaurantChosen);
      const location = await createDirectionInstructions()
      getKimLocation(location, restaurantChosen_pk)
    }

    
    const createDirectionInstructions = async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Hey! Dame permisos')
              
              return;
            }
      
            const location = await Location.getCurrentPositionAsync();


            setDisabled(true)
            setUserLocation(location);
            setCount(prev => prev + 1)
            timeoutRef.current = setTimeout(() => {
                if (count < 30){ //¿ESTO PARA QUE ES? Y FALTA CLEARTIMEOUT
                setDisabled(false)
                }
              }, 30000);
            return location;

}

useEffect(() => {
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);

    return (
        <View style={styles.container}>
            <View style={styles.contained}>
              <Text style={styles.textsmall}>Estás viendo la localización del restaurante { restaurantChosen.restaurant_name } localizado en {restaurantChosen.address}</Text>
              {loading ? <View style={styles.viewable}><ActivityIndicator size={33} /></View> :
                <MapView 
                style={styles.map} 
                showsUserLocation={true}
                region={{...initialPosition}}
                provider={PROVIDER_GOOGLE}
                >
                    <Marker coordinate={{...initialPosition}}/>
                    {(userLocation != null) && (userLocation != undefined)  ? <MapViewDirections
                    origin={{latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude}}
                    strokeColor="red"
                    strokeWidth={6}

                    destination={{...initialPosition}}
                    apikey='AIzaSyCUapNTP0prko0UaM6vw1TpUpPEPNZIqhM' //ESTA ES LA API KEY DE MY FIRST PROJECT
                    /> : null}
                </MapView>}
                <TouchableOpacity onPress={!disabled && createDirectionInstructionsAndGetKimLocation} disabled={disabled} style={disabled ? styles.buttondisabled : styles.button}><Text style={styles.textbutton}>¡Guíame! </Text></TouchableOpacity>
            </View>
            
        
      </View>    
    );
}
 
export default Localizacion;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
      },
      contained: {
        width: '80%',
        alignItems: 'center',
    },
    viewable: {
      padding: 20,
      flexGrow: 1,
      justifyContent: "center",
    },
      map: {
        width: 350,
        height: 350,
      },
      textbutton: {
        fontSize: 27,
        color: 'black',
        textAlign: 'center',
        fontFamily: 'Function-Regular',

    },
    button: {
        marginTop: 20,
        padding: 6,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 15,
        width: 350,

    },
    buttondisabled: {
        opacity: 0.4,
        marginTop: 20,
        padding: 6,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 15,
        width: 350,

    },
    textsmall: {
      color: "white",
      padding: 15,
      textAlign: "center",
      fontSize: 22,
      fontFamily: 'Function-Regular',
    },


})

//REPASADO Y LIMPIADO