import { ScrollView, FlatList, StyleSheet} from "react-native";
import CrossSellInList from "./CrossSellInList";

const CrossSellContainer = ({ crosssells }) => {

  const renderItem = ({ item }) => {
    return <CrossSellInList crosssell={item} key={item.id}/>;
  };

    return (
      <ScrollView>
        <FlatList
          style={styles.screen}
          data={[...crosssells]}
          keyExtractor={(item) => item.id}
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
export default CrossSellContainer;

//TENGO QUE REVISAR CROSSELLS Y UPSELLS