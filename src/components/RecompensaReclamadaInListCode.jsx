import { useState, useContext } from "react";
import { Text, Alert, View, StyleSheet, TouchableOpacity} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from '../services/index.jsx';

function RecompensaReclamadaInlistCode({code} ) {

      const confirmarRecompensaCanjeada = (pk) => {
          Alert.alert('¿Seguro que quieres marcarla como canjeada?', 'Esto quiere decir que la persona acaba de disfrutar de la recompensa, ¿cierto?', [
              {
                  text: 'No, me he equivocado',
                  style: 'cancel',
              },
              {
                  text: 'Sí, lo es',
                  onPress: async () => await claimReward(pk),
              },
          ])
      }

  const [ used, setUsed ] = useState(code.used)

    const { authTokensObject } = useContext(AuthFlowContext);
    const [authTokens, setAuthTokens] = authTokensObject;

    let { restaurantChosenObject } = useContext(RestaurantChosenContext);
    const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const claimReward = async (pk) => {
    const res = await fetch(
      BASE_URL + "claim-reward-code/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ code: pk }),
      }
    );

    var jsonData2 = await res.json();
    if (jsonData2.status == 'ok'){
      setUsed(true)
    }

  }

return(
    <View style={used ? styles.redcard : styles.greencard}>
        <Text style={styles.text}>CÓDIGO: {code.code}</Text>
        <Text style={styles.text}>USUARIO (EMAIL): {code.usertosend}</Text>
        <Text style={styles.text}>USUARIO (NÚMERO TLFN.): {code.user_phone?code.user_phone: 'No especificado'}</Text>
        <Text style={styles.text}>RECOMENSA NÚMERO: {code.number_of_reward}</Text>
        <Text style={styles.text}>DESCRIPCIÓN RECOMPENSA: {code.description_of_reward}</Text>
        <Text style={styles.text}>OBTENIDA EL: {code.date_added}</Text>
        <Text style={styles.text}>USADA: {used.toString()}</Text>
        {!code.used?<TouchableOpacity style={styles.buttonforlogout} onPress={()=>{confirmarRecompensaCanjeada(code.pk)}}><Text style={styles.buttontextforlogout}>Usar</Text></TouchableOpacity>:null}
    </View>
)
}

const styles = StyleSheet.create({
  greencard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 4,
    borderColor: "green",
    borderRadius: 30,
    
  },
  redcard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 4,
    borderColor: "red",
    borderRadius: 30,
  },
    text: {
      marginTop: 10,
      marginBottom: 10,
      color: "white",
      fontSize: 23,
      fontFamily: 'Function-Regular',
    },
    buttonforlogout: {
      marginTop: 15,
      padding: 8,
      borderColor: 'black',
      backgroundColor: 'white',
      borderWidth: 1,
      borderRadius: 30,
  },
  buttontextforlogout: {
    padding: 5,
    color: 'black',
    textAlign: 'center',
    fontSize: 25,
    fontFamily: 'Function-Regular',

}
  });

export default RecompensaReclamadaInlistCode;

//REPASADO Y LIMPIADO