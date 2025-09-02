import { useEffect, useState, useContext } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import ScaledImage from './CustomFastAndFunctionalScaledImage.jsx'
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from '../services/index.jsx';
import getAndSetRestaurant from '../services/apiCallFavouriteRestaurant.jsx'

function Recompensas() {
    const navigation = useNavigation();

    const [recompensas, setRecompensas] = useState([])
    const [pointsPerEuro, setPointsPerEuro] = useState(0)
    const [pointsPerInvitation, setPointsPerInvitation] = useState(0)
    const [loading, setLoading] = useState(true)
    const [notAbleToFetch, setNotAbleToFetch] = useState(false)

    const { authTokensObject, findIsPhoneVerified, phoneVerifiedObject } = useContext(AuthFlowContext);
    const [authTokens, setAuthTokens] = authTokensObject;
    const [isPhoneVerified, setIsPhoneVerified] = phoneVerifiedObject;
    let { restaurantChosenObject } = useContext(RestaurantChosenContext);
    const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

    var fetchRecompensasNoGanadas = async (restaurantPk) => {
        const res = await fetch(BASE_URL + 'rewards-not-gained-dc/' + restaurantPk.toString() + '/', {
            method: "GET",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + String(authTokens?.access)
            }
        })
        const jsonData2 = await res.json()
        if (jsonData2.hasOwnProperty('status') && jsonData2.status == 'nook'){
        Alert.alert('Error', jsonData2.message)
        setNotAbleToFetch(true)
        } else {
        setRecompensas(jsonData2)
        setLoading(false)
        }
    }

    const editReward = (pk) => {
        navigation.navigate('Editar recompensa',{ eventId: pk })
    }

    useEffect(()=>{
        const unsubscribe = navigation.addListener('focus', async () => {
            const restaurantChosen_pk = await getAndSetRestaurant(authTokens?.access, setRestaurantChosen);
            gettingPoints(restaurantChosen_pk); fetchRecompensasNoGanadas(restaurantChosen_pk)       
     });
        return unsubscribe;
    }, [navigation])

    const gettingPoints = async (restaurantPk) => {
        
        let response = await fetch(
          BASE_URL + "getting-points-dc/" + restaurantPk.toString() + '/',
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + String(authTokens?.access),
            }
          }
        );
        const data = await response.json();
    
        if (data.status === "ok") {
          setPointsPerInvitation(data.points_per_invitation)
          setPointsPerEuro(data.points_per_euro)
        } else {

        }
      };

    return (
        <View style={styles.container}>
             <View><Text style={styles.pointstext}>Invitar o ser invitado por un amigo otorga {pointsPerInvitation} puntos.</Text><Text style={styles.pointstext}> Cada euro gastado en el restaurante otorga {pointsPerEuro} puntos.</Text></View>
            <ScrollView>

                <View>
                    {notAbleToFetch ? <Text style={styles.text}>No puedes acceder a estos datos</Text>:loading ? <ActivityIndicator size={33}/> : !loading && recompensas.length == 0 ? <Text style={styles.pointstext}> No hay recompensas aún</Text> : (recompensas.map((recompensa) => (
                        <View key={recompensa.number_of_reward} style={styles.card}>
                            {recompensa.hasOwnProperty('image_link_before_delivered') ? <ScaledImage uri={recompensa.image_link_before_delivered} finalwidth={150} style={{ marginVertical: 15 }} /> : null}
                            {recompensa.hasOwnProperty('image_link') ? <ScaledImage uri={recompensa.image_link} finalwidth={150} style={{ marginVertical: 15 }} /> : null}
                            <Text style={styles.text}>{recompensa.reward}</Text>
                            <Text style={styles.text}>{recompensa.reward_description_before_delivered === undefined ? (recompensa.reward_description) :
                                (recompensa.reward_description_before_delivered)}</Text>
                            {!recompensa.hasOwnProperty('code') ? <Text style={styles.text}>Puntos: {recompensa.points_price}</Text> : null}
                            
                            {(!recompensa.hasOwnProperty('code')) ? null : recompensa.used? <Text style={styles.textnotactive}> CODIGO:  {recompensa.code} (CANJEADA)</Text> :<Text style={styles.textactive}> CODIGO:  {recompensa.code}</Text>}
                            {!recompensa.hasOwnProperty('code') ?  <TouchableOpacity style={styles.button} onPress={async ()=>{await editReward(recompensa.pk)}}><Text style={styles.textbutton}>Editar</Text></TouchableOpacity > : null}
                            </View>)))}

                </View>
            </ScrollView>
            <TouchableOpacity style={styles.applesign} onPress={
                () => {
                    navigation.navigate('Crear recompensa')
                }}>
                <Text style={styles.applesigntext}>Crear recompensa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googlesign} onPress={
                () => {
                    navigation.navigate('Ver códigos de recompensa')
                }}>
                <Text style={styles.googlesigntext}>Ver códigos de recompensa</Text>
            </TouchableOpacity>
           </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flex: 1

    },
    googlesign: {
        backgroundColor: 'white',
        padding: 15,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 15,
        margin: 15,

    },
    pointstext: {
        color: 'white',
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 20,
        fontFamily: 'Function-Regular',
    },
    googlesigntext: {
        color: 'black',
        textAlign: 'center',
        fontSize: 25,
        fontFamily: 'Function-Regular',
    },
    applesigntext: {
        color: 'white',
        textAlign: 'center',
        fontSize: 25,
        fontFamily: 'Function-Regular',
    },
    applesign: {
        backgroundColor: "rgb(107,106,106)",
        padding: 15,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 15,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,

    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Function-Regular',
        fontSize: 22,
    },
    card: {
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 150,
        marginTop: 10,
        padding: 15,
        backgroundColor: 'rgb(107,106,106)', 
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 30,
        marginHorizontal: 15,
    },
    textactive: {
        color: 'green',
        textAlign: 'center',
        fontFamily: 'Function-Regular',
    },
    textnotactive: {
        color: 'red',
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

    },
    textbutton: {
        fontSize: 25,
        color: 'black',
        textAlign: 'center',
        fontFamily: 'Function-Regular',

    },
})

export default Recompensas

//LIMPIADO Y REVISADO