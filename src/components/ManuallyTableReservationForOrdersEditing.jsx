import {
    StyleSheet,
    Text,
    TouchableOpacity,
  } from "react-native";


const ManuallyTableReservation = ({ table, addTable, tablesChosen, removeTable, tablesOfItsReservation=[]}) => {

    const selectTable = (pk) => {
        if (!tablesChosen.includes(pk)){
            addTable(pk)
        }
        else {
            removeTable(pk)
        }
    }
  return (
    <TouchableOpacity
      style={
        tablesChosen.includes(table.id) 
        ? (tablesOfItsReservation.includes(table.id) ? styles.of_its_reservation_selected: styles.selected_not_occupied)
        : (tablesOfItsReservation.includes(table.id) ? styles.of_its_reservation_not_selected : styles.not_selected_not_occupied)
      }
      onPress={() => selectTable(table.id)}
    >
      <Text style={styles.buttontextforlogout}>{table.name_of_the_table}{table.in_patio? ' - T': null}{table.near_a_window? ' - V': null} - (C. max.:{table.number_of_comensals})</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    not_selected_not_occupied: {
      marginTop: 30,
      padding: 5,
      borderColor: "white",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
    },
    selected_not_occupied: {
        marginTop: 30,
        padding: 5,
        borderColor: "green",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
      of_its_reservation_selected: {
        marginTop: 30,
        padding: 5,
        borderColor: "blue",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
      of_its_reservation_not_selected: {
        marginTop: 30,
        padding: 5,
        borderColor: "#2271b3",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
    buttontextforlogout: {
      padding: 5,
      color: "white",
      textAlign: "center",
      fontFamily: "Function-Regular",
      fontSize: 17,
    },
  });
  

export default ManuallyTableReservation;

//REVISADO Y LIMPIADO
