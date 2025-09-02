import { Text, View, StyleSheet, TouchableOpacity} from "react-native";
import { useNavigation } from "@react-navigation/native";

function TicketInList({ticket} ) {
  const navigation = useNavigation();

return(
    <View style={styles.card}>
        <Text style={styles.text}>Ticket #{ticket.pk_of_ticket}</Text>
        <Text style={styles.text}>Consumición el {ticket.datetime.toString().split('T')[0]} a las {ticket.datetime.toString().split('T')[1].slice(0,5)}</Text>
        <Text style={styles.text}>La cantidad reclamada por ti es {ticket.amount_redeemed/100} €</Text>
        <Text style={styles.text}>La cantidad total reclamable en el ticket es {ticket.amount/100} €</Text>
        <Text style={styles.text}>La cantidad total de puntos obtenida es {ticket.points}</Text>
        {ticket.completed ? (null): (<TouchableOpacity style={styles.googlesign} onPress={()=>{navigation.navigate('Cambiar cantidad canjeada',{pk: ticket.pk})}}>
            <Text style={styles.googlesigntext}>Ver</Text>
        </TouchableOpacity>)}
    </View>
)
}

const styles = StyleSheet.create({
    card: {
      flexDirection: "column",
      justifyContent: "center",
      minHeight: 80,
      marginTop: 10,
      padding: 15,
      backgroundColor: "black",
      borderWidth: 1,
      borderColor: "white",
      borderRadius: 30,
      alignSelf: "stretch",
      marginHorizontal: 15,
    },
    text: {
      color: "white",
      fontSize: 23,
      fontFamily: 'Function-Regular',
      textAlign: 'center'
    },
    googlesign: {
      backgroundColor: "white",
      padding: 15,
      borderWidth: 1,
      borderColor: "white",
      borderRadius: 15,
      marginTop: 20,
    },
    googlesigntext: {
      color: "black",
      textAlign: "center",
      fontSize: 23,
      fontFamily: 'Function-Regular',
    }
  });

export default TicketInList;

//REPASADO Y REVISADO