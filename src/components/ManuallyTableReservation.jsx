import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
  } from "react-native";


const ManuallyTableReservation = ({ table, addTable, tablesChosen, removeTable, tablesOfItsReservation=[]}) => {
    

    const selectTable = (pk) => {
        if (!tablesChosen.includes(pk)){
        if (table.occupied && !tablesOfItsReservation.includes(pk)){
        Alert.alert('Estás a punto de seleccionar una mesa ya ocupada', 'Esta mesa está ocupada, ¿estás seguro de que quieres seleccionarla?',[
            {
                text: 'No, déjame cambiarla',
                style: 'cancel',
            },
            {
                text: 'Sí',
                onPress: () => addTable(pk),
            },
        ])
        } else {
            addTable(pk)
        }}
        else {
            removeTable(pk)
        }
    }
  return (
    <TouchableOpacity
      style={
        (table.occupied
          ? (tablesChosen.includes(table.pk)? (tablesOfItsReservation.includes(table.pk)? styles.of_its_reservation_selected :styles.selected_occupied) : (tablesOfItsReservation.includes(table.pk)? styles.of_its_reservation_not_selected :styles.not_selected_occupied))
          : (tablesChosen.includes(table.pk)? styles.selected_not_occupied :styles.not_selected_not_occupied))
      }
      onPress={() => selectTable(table.pk)}
    >
      <Text style={styles.buttontextforlogout}>{table.name_of_the_table}{table.in_patio? ' - T': null}{table.near_a_window? ' - V': null} - (C. max.:{table.comensals})</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    not_selected_not_occupied: {
      marginTop: 30,
      padding: 10,
      borderColor: "white",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
    },
    not_selected_occupied: {
      marginTop: 30,
      padding: 10,
      borderColor: "white",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
      opacity: 0.5,
    },
    selected_not_occupied: {
        marginTop: 30,
        padding: 10,
        borderColor: "green",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
      of_its_reservation_selected: {
        marginTop: 30,
        padding: 10,
        borderColor: "blue",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
      of_its_reservation_not_selected: {
        marginTop: 30,
        padding: 10,
        borderColor: "#2271b3",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
      selected_occupied: {
        marginTop: 30,
        padding: 10,
        borderColor: "yellow",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
        opacity: 0.5,
      },
    buttontextforlogout: {
      padding: 5,
      color: "white",
      textAlign: "center",
      fontFamily: "Function-Regular",
      fontSize: 25,
    },
  });
  

export default ManuallyTableReservation;

//REPASADO Y LIMPIADO
