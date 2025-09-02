import {
    StyleSheet,
    Text,
    TouchableOpacity,
  } from "react-native";


const MesaTablePanelControlHorizontal = ({ table, addTable, removeTable, tablesChosen}) => {
    

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
      style={tablesChosen.includes(table.id)?styles.selected:styles.normal}
      onPress={() => selectTable(table.id)}
    >
      <Text style={styles.buttontext}>{table.name_of_the_table}{table.in_patio? ' - T': null}{table.near_a_window? ' - V': null} - (C. max.:{table.number_of_comensals})</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    normal: {
      marginTop: 15,
      padding: 10,
      borderColor: "white",
      borderRadius: 20,
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 2,
      marginHorizontal: 10,
    },
    selected: {
      marginTop: 15,
      padding: 10,
      borderColor: "#C7F6C7",
      borderRadius: 20,
      backgroundColor: "rgb(107,106,106)",
      borderWidth: 4,
      marginHorizontal: 10,
    },
    buttontext: {
      padding: 3,
      color: "white",
      textAlign: "center",
      fontFamily: "Function-Regular",
      fontSize: 20,
    },
  });
  

export default MesaTablePanelControlHorizontal;
//REVISADO Y LIMPIADO
