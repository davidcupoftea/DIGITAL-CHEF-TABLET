import { useContext } from "react";
import { ScrollView, FlatList, StyleSheet, Text, Dimensions} from 'react-native'
import OfferInList from '../components/OfferInList'
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  WARNING_NOT_SCROLLABLE,
} from "../services/index.jsx";
//import getAndSetRestaurant from '../services/apiCallFavouriteRestaurant.jsx'


const OffersList = ({onlylastweek, ofertas, fetchOfertas}) => {


    let { restaurantChosenObject } = useContext(RestaurantChosenContext);
    const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;


    const sortByDate = (a, b) => {
        let dateOfA = a.startdate;
        const [ya, Ma, da] = dateOfA.match(/\d+/g);
        let startDateOfAStringFormatted = `${ya}-${Ma}-${da}`
        let startDateOfA = new Date(startDateOfAStringFormatted)
        let startDateOfAInTime = startDateOfA.getTime()

        let dateOfB = b.startdate;
        const [yb, Mb, db] = dateOfB.match(/\d+/g);
        let startDateOfBStringFormatted = `${yb}-${Mb}-${db}`
        let startDateOfB = new Date(startDateOfBStringFormatted)
        let startDateOfBInTime = startDateOfB.getTime()

        if (startDateOfAInTime !== startDateOfBInTime){
        return startDateOfBInTime - startDateOfAInTime
        }
        else {

            let finnishOfA = a.finishdate;
            const [yaf, Maf, daf] = finnishOfA.match(/\d+/g);
            let finnishDateOfAStringFormatted = `${yaf}-${Maf}-${daf}`
            let finnishDateOfA = new Date(finnishDateOfAStringFormatted)
            let finnishDateOfAInTime = finnishDateOfA.getTime()
    
            let finnishOfB = b.finishdate;
            const [ybf, Mbf, dbf] = finnishOfB.match(/\d+/g);
            let finnishDateOfBStringFormatted = `${ybf}-${Mbf}-${dbf}`
            let finnishDateOfB = new Date(finnishDateOfBStringFormatted)
            let finnishDateOfBInTime = finnishDateOfB.getTime()

            return finnishDateOfBInTime - finnishDateOfAInTime

        }
    }


        finaloffers = ofertas
        finaloffers2 = finaloffers.sort(sortByDate)

    const renderItem = ({item}) => {
        return <OfferInList key={item.id} offer={item} isstatus={''} fetchOfertas={fetchOfertas}/>
    }
    // if (onlylastweek === true){
    //     return ( <>{ finaloffers2 == 0 ? (<Text style={styles.textsmall}>No hay ofertas esta semana.</Text>): (
    //         <View style={styles.screen}>
    //         {finaloffers2.map(offer => (<OfferInList key={offer.id} offer={offer} isstatus={''} fetchOfertas={fetchOfertas}/>))} 
        
    //         </View>)}</>
    //         )
    // } else {    
     return ( 
        <ScrollView>
        {!WARNING_NOT_SCROLLABLE ? (
          <Text style={styles.textsmall}>
            Estás viendo el feed de ofertas del restaurante
            {" "} {restaurantChosen.franchise} localizado en
            {" "} {restaurantChosen.address}
          </Text>
        ) : null}
        {finaloffers2 == 0 ? (<Text style={styles.textsmall}>No hay ofertas aún.</Text>): (
        <FlatList style={styles.screen}
            data={[...finaloffers2]}
            keyExtractor={item=>item.id}
            renderItem={renderItem}
            scrollEnabled={false}
        />)}
     </ScrollView>
     )
    //}
 }

 
const styles = StyleSheet.create({
    screen: {
        marginHorizontal: Dimensions.get('window').width * 0.05,
        backgroundColor: 'rgb(107,106,106)',
    },
    textsmall: {
        color: "white",
        padding: 15,
        textAlign: "center",
        fontSize: 20,
        fontFamily: 'Function-Regular',
      },
})


export default OffersList
//REPASADO Y LIMPIO
