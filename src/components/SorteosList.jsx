
import { useState, useEffect, useContext} from "react";
import { StyleSheet, FlatList, ScrollView, Text, Dimensions, View} from "react-native";
import SorteoInList from "./SorteoInList";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { WARNING_NOT_SCROLLABLE } from '../services/index.jsx';

const SorteosList = ({ sorteos, onlylastweek=false, fetchSorteos }) => {
  const [loading, setLoading] = useState(true);
  let [finalsorteos, setFinalSorteos] = useState(null);

  const margin = Dimensions.get('window').width * 0.01
  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  renderItem = ({ item, index }) => {
            const itemWidth = (containerWidth - margin  * (cardsPerRow-1)) / cardsPerRow;
        return (
          <View style={[styles.item, { width: itemWidth, marginRight: (index + 1) % cardsPerRow === 0 ? 0 : margin, }]}>
    <SorteoInList offer={item} fetchSorteos={fetchSorteos}/>
    </View>)
  
  };

  useEffect(() => {
      let finalsorteos2 = sorteos.sort(sortByDate);
      setFinalSorteos(finalsorteos2);
      setLoading(false);
  }, [sorteos]);


  const sortByDate = (a, b) => {
    let dateOfA = a.startdate;
    const [ya, Ma, da] = dateOfA.match(/\d+/g);
    let startDateOfAStringFormatted = `${ya}-${Ma}-${da}`;
    let startDateOfA = new Date(startDateOfAStringFormatted);
    let startDateOfAInTime = startDateOfA.getTime();

    let dateOfB = b.startdate;
    const [db, Mb, yb] = dateOfB.match(/\d+/g);
    let startDateOfBStringFormatted = `${yb}-${Mb}-${db}`;
    let startDateOfB = new Date(startDateOfBStringFormatted);
    let startDateOfBInTime = startDateOfB.getTime();

    if (startDateOfAInTime !== startDateOfBInTime) {
      return startDateOfAInTime - startDateOfBInTime;
    } else {
      const finnishOfA = a.finishdate;
      const [yaf, Maf, daf] = finnishOfA.match(/\d+/g);
      const finnishDateOfAStringFormatted = `${yaf}-${Maf}-${daf}`;
      const finnishDateOfA = new Date(finnishDateOfAStringFormatted);
      const finnishDateOfAInTime = finnishDateOfA.getTime();

      const finnishOfB = b.finishdate;
      const [ybf, Mbf, dbf] = finnishOfB.match(/\d+/g);
      const finnishDateOfBStringFormatted = `${ybf}-${Mbf}-${dbf}`;
      const finnishDateOfB = new Date(finnishDateOfBStringFormatted);
      const finnishDateOfBInTime = finnishDateOfB.getTime();

      return finnishDateOfAInTime - finnishDateOfBInTime;
    }
  };


  return (
    <><ScrollView>{!WARNING_NOT_SCROLLABLE && onlylastweek==false? <Text style={styles.textsmall}>Estás viendo el feed de sorteos del restaurante {restaurantChosen.franchise} localizado en {restaurantChosen.address}</Text>: null}
      <View style={[styles.screen, { marginHorizontal: margin }]} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      
    
      {loading
        ? null : finalsorteos.length == 0 ? <Text style={styles.textsmall}>No hay sorteos aún.</Text>
        : <FlatList
        style={styles.screen}
        data={[...finalsorteos]}
        keyExtractor={item=>item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        numColumns={cardsPerRow}
        columnWrapperStyle={{ justifyContent: "flex-start"}}/>}
        </View>
        </ScrollView>
        
    </>
  );

};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "rgb(107,106,106)",
  },
  textsmall: {
      color: "white",
      padding: 15,
      textAlign: "center",
      fontSize: 20,
      fontFamily: 'Function-Regular',
    },
});

export default SorteosList;

//REPASADO Y REVISADO
