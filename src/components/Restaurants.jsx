import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import RestaurantInList from "../components/RestaurantInList";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { OrderContext } from "./OrderContextProvider.jsx";
import { BASE_URL } from "../services/index.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const Restaurants = () => {
  const navigation = useNavigation();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  let { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const { order, setOrder } = useContext(OrderContext);

  const margin = Dimensions.get("window").width * 0.01;
  const cardsPerRow = 3;
  const [containerWidth, setContainerWidth] = useState(0);

  const getRestaurants = async () => {
    setRestaurants([]); //ESTO ES UNA GUARRADA, NO SE COMO SOLUCIONARLO
    const res2 = await fetch(BASE_URL + "restaurants-digital-chef/", {
      method: "GET",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });

    var jsonData2 = await res2.json();
    setRestaurants([...jsonData2]);
    setLoading(false);
    setOrder({ products: [] });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getAndSetRestaurant(authTokens?.access, setRestaurantChosen);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getRestaurants();
    });
    return unsubscribe;
  }, [navigation]);

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
        <RestaurantInList key={item.id} offer={item} />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Aquí puedes ver los restaurantes a los que tienes acceso
      </Text>
      <ScrollView>
        <View style={[styles.screen, { marginHorizontal: margin }]} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
           
        {loading ? (
          <ActivityIndicator size={33} />
        ) : (
          <FlatList
            style={styles.screen}
            data={[...restaurants]}
            scrollEnabled={false}
            keyExtractor={(item) => item.restaurant.pk}
            renderItem={renderItem}
            numColumns={cardsPerRow}
            columnWrapperStyle={{ justifyContent: "flex-start"}}
          />
        )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.googlesign}
        onPress={() => {
          navigation.navigate("Únete a uno o varios restaurantes");
        }}
      >
        <Text style={styles.googlesigntext}>
          Reclamar pertenencia a uno u otro restaurante
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    backgroundColor: "rgb(107,106,106)",
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Function-Regular",
    paddingVertical: 15,
  },
  googlesign: {
    backgroundColor: "white",
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    margin: 15,
    textAlign: "center",
  },
  googlesigntext: {
    color: "black",
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Function-Regular",
  },
});

export default Restaurants;
//REPASADO Y LIMPIADO
