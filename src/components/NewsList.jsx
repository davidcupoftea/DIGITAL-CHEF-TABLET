import { useContext } from "react";
import { ScrollView, FlatList, StyleSheet, Text, Dimensions} from "react-native";
import NewsInList from "./NewsInList.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  WARNING_NOT_SCROLLABLE
} from "../services/index.jsx";

const NewsList = ({ onlylastweek = false, noticias, fetchNoticias}) => {

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


  const renderItem = ({ item }) => {
    return <NewsInList offer={item} isstatus={""} fetchNoticias={fetchNoticias} />;
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

        {finalnoticias2.length != 0 ? 
        (<FlatList
          style={styles.screen}
          data={[...finalnoticias2]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={3000}
          initialNumToRender={2}
          windowSize={3}
          scrollEnabled={false}
        />) : (<Text style={styles.textsmall}>No hay novedades aún.</Text>)}
      </ScrollView>
    );
  //}
};

const styles = StyleSheet.create({
  screen: {
    marginHorizontal: Dimensions.get('window').width * 0.05,
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