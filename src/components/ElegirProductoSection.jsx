import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import ElegirProductoInList from './ElegirProductoInList.jsx'

const ElegirProductoSection = ({ displayed=false, anotherkey, dishes}) => {
  const renderItem = ({item}) => {
    return <ElegirProductoInList item={item}/>}
  return (
  <View style={styles.screen}>
      {displayed? (<FlatList
                   data={dishes}
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
  }
})

export default ElegirProductoSection;

//REPASADO Y LIMPIO
