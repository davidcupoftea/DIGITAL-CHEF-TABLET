import { ScrollView, FlatList, StyleSheet} from "react-native";
import UpsellInList from './UpsellInList'

const UpsellContainer = ({ upsells }) => {

  const renderItem = ({ item }) => {
    return <UpsellInList upsell={item}/>;
  };

    return (
      <ScrollView>
        <FlatList
          style={styles.screen}
          data={[...upsells]}
          keyExtractor={(item) => item.original_dish.id.toString() + item.upsell.id.toString()}
          renderItem={renderItem}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={3000}
          initialNumToRender={2}
          windowSize={3}
          scrollEnabled={false}
        />
      </ScrollView>
    );

};

const styles = StyleSheet.create({
  screen: {
    marginHorizontal: 15,
    backgroundColor: "rgb(107,106,106)",
  }
});
export default UpsellContainer;

//LIMPIADO Y REPASADO