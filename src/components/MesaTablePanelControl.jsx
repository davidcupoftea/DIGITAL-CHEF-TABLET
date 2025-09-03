import {
    StyleSheet,
    Text,
    TouchableOpacity,
  } from "react-native";


const MesaTablePanelControl = ({ table, addTable, removeTable, tablesChosen}) => {

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
      style={table.has_order_with_reservation? styles.has_order_with_reservation: (table.has_order_without_reservation? styles.has_order_without_reservation: (table.is_reserved? styles.is_reserved : table.has_only_conceptos_extra? styles.only_conceptos_extra :styles.not_occupied))}
      onPress={() => selectTable(table.id)}
    >
      <Text style={styles.buttontext}>{table.name_of_the_table}{table.in_patio? ' - T': null}{table.near_a_window? ' - V': null} - (C. max.:{table.number_of_comensals})</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    not_occupied: {
      marginTop: 15,
      padding: 10,
      borderColor: "white",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
    },
    only_conceptos_extra: {
      marginTop: 15,
      padding: 10,
      borderColor: "#FFF9C4",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
    },
    has_order_with_reservation: {
      marginTop: 15,
      padding: 10,
      borderColor: "green",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
    },
    has_order_without_reservation: {
      marginTop: 15,
      padding: 10,
      borderColor: "#C7F6C7",
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
    },
      is_reserved: {
        marginTop: 15,
        padding: 10,
        borderColor: "#2271b3",
        backgroundColor: "rgb(107,106,106)",
        borderWidth: 4,
      },
      buttontext: {
      padding: 3,
      color: "white",
      textAlign: "center",
      fontFamily: "Function-Regular",
      fontSize: 20,
    },
  });
  

export default MesaTablePanelControl;
//REVISADO Y LIMPIO
