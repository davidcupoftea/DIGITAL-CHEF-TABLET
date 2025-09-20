import { useState } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import DishInMenu from "./DishInMenu.jsx";

const ElegirProductoSection = ({ displayed = false, anotherkey, dishes }) => {
  const margin = Dimensions.get("window").width * 0.01;
  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const renderItem = ({ item, index }) => {
    const itemWidth =
      (containerWidth - margin * (cardsPerRow - 1)) / cardsPerRow;
    return (
      <View
        style={[
          styles.item,
          {
            width: itemWidth,
            marginRight: (index + 1) % cardsPerRow === 0 ? 0 : margin,
          },
        ]}
      >
        <DishInMenu item={item} />
      </View>
    );
  };
  return (
    <View
      style={[styles.screen, { marginHorizontal: margin }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
        {displayed ? (
          <FlatList
            data={dishes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={1000}
            initialNumToRender={3}
            windowSize={3}
            numColumns={cardsPerRow}
            columnWrapperStyle={{ justifyContent: "flex-start" }}
          />
        ) : null}
      </View>
  );
};
const styles = StyleSheet.create({
  screen: {
    backgroundColor: "rgb(107,106,106)",
  },
});

export default ElegirProductoSection;

//REPASADO Y LIMPIADO
