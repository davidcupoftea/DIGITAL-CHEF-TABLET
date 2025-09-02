import {
    StyleSheet,
    Text,
    TouchableOpacity,
  } from "react-native";

const ManuallyTableReservation = ({ table, addTable, tablesChosen, removeTable}) => {

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
        (tablesChosen.includes(table.id)? styles.selected:styles.not_selected)
      }
      onPress={() => selectTable(table.id)}
    >
      <Text style={styles.buttontextforlogout}>{table.name_of_the_table}{table.in_patio? ' - T': null}{table.near_a_window? ' - V': null} - (C. max.:{table.number_of_comensals})</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    not_selected: {
      marginTop: 20,
      padding: 10,
      borderColor: "white",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
    
    },
    selected: {
        marginTop: 20,
        padding: 10,
        borderColor: "green",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
      buttontextforlogout: {
        padding: 2,
        color: "white",
        textAlign: "center",
        fontFamily: "Function-Regular",
        fontSize: 17,
      }
  });
  

export default ManuallyTableReservation;
//REVISADO Y LIMPIADO
