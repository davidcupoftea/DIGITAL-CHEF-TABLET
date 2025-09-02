import { ScrollView, FlatList, StyleSheet } from "react-native";
import CodeInList from './CodeInList.jsx'
const CodeContainer = ({ codes }) => {

  const renderItem = ({ item }) => {
    return <CodeInList code={item}/>;
  };

    return (
      <ScrollView>
        <FlatList
          style={styles.screen}
          data={[...codes]}
          keyExtractor={(item) => item.dish.id}
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
export default CodeContainer;
//REPASADO Y LIMPIADO