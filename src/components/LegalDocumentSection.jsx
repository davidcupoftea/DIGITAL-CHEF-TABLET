import { View, FlatList, StyleSheet, Dimensions, Text } from "react-native";

const ElegirProductoSection = ({ displayed=false, clauses}) => {
  const renderItem = ({item}) => {
    return <><Text style={styles.textsmall}>{item.title}</Text><Text style={styles.textsmallnotcentered}>{item.description}</Text></>}
  return (
  <View style={styles.screen}>
      {displayed? (<FlatList
                   data={clauses}
                   keyExtractor={item=>item.id}
                   renderItem={renderItem}
                   scrollEnabled={false}
                   maxToRenderPerBatch={3}
                   updateCellsBatchingPeriod={1000}
                   initialNumToRender={3}
                   windowSize={3}
               />) : null}

  </View>

  );
};
const styles = StyleSheet.create({
  screen: {
      paddingHorizontal: Dimensions.get("window").width * 0.05,
      backgroundColor: 'rgb(107,106,106)',
  },
  textsmall: {
    color: "white",
    padding: 15,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
  },
  textsmallnotcentered: {
    color: "white",
    padding: 15,
    fontSize: 17,
    fontFamily: "Function-Regular",
  },
})

export default ElegirProductoSection;

//REPASADO Y LIMPIADO
