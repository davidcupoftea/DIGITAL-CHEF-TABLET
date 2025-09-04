import { useContext, useState} from "react";
import { ScrollView, FlatList, Text, Dimensions, View} from "react-native";
import TrabajosInList from "./TrabajosInList";
import { StyleSheet } from "react-native";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  WARNING_NOT_SCROLLABLE, getOffset
} from "../services/index.jsx";

const TrabajosList = ({trabajos, fetchTrabajos}) => {
    const margin = Dimensions.get('window').width * 0.01
    const cardsPerRow = 3;
    const [containerWidth, setContainerWidth] = useState(0);

    let { restaurantChosenObject } = useContext(RestaurantChosenContext);
    const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  renderItem = ({ item, index }) => {
            const itemWidth = (containerWidth - margin  * (cardsPerRow-1)) / cardsPerRow;
        return (
          <View style={[styles.item, { width: itemWidth, marginRight: (index + 1) % cardsPerRow === 0 ? 0 : margin, }]}>
    <TrabajosInList offer={item} fetchTrabajos={fetchTrabajos} />
    </View>)
  };

    var offersFilteredNoFuture = (offers) => {
      return offers.filter(function (obj) {
        const offset = getOffset()
        const dateOfOffer = obj.startdate;
        const [yof, Mof, dof] = dateOfOffer.match(/\d+/g);
        let startDateOfOfferStringFormatted = `${yof}-${Mof}-${dof}`;
        let startDateOfOffer = new Date(startDateOfOfferStringFormatted);
        let startDateOfOfferInTime = startDateOfOffer.getTime();

        let date = new Date();
        currentDateInTime = new Date(date).getTime();

        return currentDateInTime + offset*60*60*1000 > startDateOfOfferInTime;
      })}

    const sortByDate = (a, b) => {
      let dateOfA = a.startdate;
      const [ya, Ma, da] = dateOfA.match(/\d+/g);
      let startDateOfAStringFormatted = `${ya}-${Ma}-${da}`;
      let startDateOfA = new Date(startDateOfAStringFormatted);
      let startDateOfAInTime = startDateOfA.getTime();

      let dateOfB = b.startdate;
      const [yb, Mb, db] = dateOfB.match(/\d+/g);
      let startDateOfBStringFormatted = `${yb}-${Mb}-${db}`;
      let startDateOfB = new Date(startDateOfBStringFormatted);
      let startDateOfBInTime = startDateOfB.getTime();

      if (startDateOfAInTime !== startDateOfBInTime) {
        return startDateOfBInTime - startDateOfAInTime;
      } else {
        finnishOfA = a.finishdate;
        const [yaf, Maf, daf] = finnishOfA.match(/\d+/g);
        finnishDateOfAStringFormatted = `${yaf}-${Maf}-${daf}`;
        finnishDateOfA = new Date(finnishDateOfAStringFormatted);
        finnishDateOfAInTime = finnishDateOfA.getTime();

        finnishOfB = b.finishdate;
        const [ybf, Mbf, dbf] = finnishOfB.match(/\d+/g);
        finnishDateOfBStringFormatted = `${ybf}-${Mbf}-${dbf}`;
        finnishDateOfB = new Date(finnishDateOfBStringFormatted);
        finnishDateOfBInTime = finnishDateOfB.getTime();

        return finnishDateOfBInTime - finnishDateOfAInTime;
      }
    };


  let finaltrabajos2 = offersFilteredNoFuture(trabajos);
  let finaltrabajos3 = finaltrabajos2.sort(sortByDate);

  return (
    <ScrollView>
     {!WARNING_NOT_SCROLLABLE ? <Text style={styles.textsmall}>Estás viendo el feed de trabajos del restaurante {restaurantChosen.franchise} localizado en {restaurantChosen.address}</Text>: null}
         <View style={[styles.screen, { marginHorizontal: margin }]} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
   
 
     {finaltrabajos3 == 0 ? <Text style={styles.textsmall}>No hay trabajos aún.</Text> :
<FlatList style={styles.screen}
        data={finaltrabajos3}
        keyExtractor={item=>item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        numColumns={cardsPerRow}
        columnWrapperStyle={{ justifyContent: "flex-start"}}
    />}
    </View>
    </ScrollView>
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

export default TrabajosList;

//REPASADO Y REVISADO
