import { useContext, useState, useEffect } from "react";
import { ScrollView, FlatList, StyleSheet, Text, Dimensions, View} from "react-native";
import NewsInList from "./NewsInList.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  WARNING_NOT_SCROLLABLE
} from "../services/index.jsx";

const NewsList = ({ onlylastweek = false, noticias, fetchNoticias}) => {
  const margin = Dimensions.get('window').width * 0.01
  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  //const [gapWidth, setGapWidth] = useState(0);

  // useEffect(() => {
  //   setGapWidth(containerWidth * 0.02);
  // }, [containerWidth]);

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;


  const sortByDate = (a, b) => {
    dateOfA = a.publishingdate;
    const [ya, Ma, da] = dateOfA.match(/\d+/g);
    startDateOfAStringFormatted = `${ya}-${Ma}-${da}`;
    startDateOfA = new Date(startDateOfAStringFormatted);
    startDateOfAInTime = startDateOfA.getTime();

    dateOfB = b.publishingdate;
    const [yb, Mb, db] = dateOfB.match(/\d+/g);
    startDateOfBStringFormatted = `${yb}-${Mb}-${db}`;
    startDateOfB = new Date(startDateOfBStringFormatted);
    startDateOfBInTime = startDateOfB.getTime();

    if (startDateOfBInTime !== startDateOfAInTime) {
      return startDateOfBInTime - startDateOfAInTime;
    } else {
      return b.id - a.id;
    }
  };



  const renderItem = ({ item, index }) => {
        const itemWidth = (containerWidth - margin  * (cardsPerRow-1)) / cardsPerRow;
    return (
      <View style={[styles.item, { width: itemWidth, marginRight: (index + 1) % cardsPerRow === 0 ? 0 : margin, }]}>
        <NewsInList offer={item} isstatus={""} fetchNoticias={fetchNoticias} />
      </View>
    );
    //return <NewsInList offer={item} isstatus={""} fetchNoticias={fetchNoticias} />;
  };


    finalnoticias2 = noticias.sort(sortByDate);


  // if (onlylastweek === true) {
  //   return (<>
  //     {finalnoticias2.length != 0 ? (<View style={styles.screen}>
  //       {finalnoticias2.map((offer) => (
  //         <NewsInList key={offer.id} offer={offer} fetchNoticias={fetchNoticias} />
  //       ))}
  //     </View>) : (<Text style={styles.textsmall}>No hay novedades esta semana.</Text>)}</>
  //   );
  // } else {
    return (
      <ScrollView>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo el feed de noticias del restaurante
            {" "} {restaurantChosen.franchise} localizado en
            {" "} {restaurantChosen.address}
          </Text>
        ) : null}

         <View style={[styles.screen, { marginHorizontal: margin }]} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
  

        {finalnoticias2.length != 0 ? 
        (containerWidth > 0 && (<FlatList
          style={styles.screen}
          data={[...finalnoticias2]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={3000}
          initialNumToRender={2}
          windowSize={3}
          scrollEnabled={false}
          numColumns={cardsPerRow}
          columnWrapperStyle={{ justifyContent: "flex-start"}}
        />)) : (<Text style={styles.textsmall}>No hay novedades aún.</Text>)}
        </View>
      </ScrollView>
    );
  //}
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
  }
});
export default NewsList;

//REPASADO DISEÑO