import { useRef, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import ScaledImage from "./CustomFastAndFunctionalScaledImageContainerWidth.jsx";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";
import { BASE_URL } from "../services/index.jsx";
//import { FacturadosContext} from "./ConceptosFacturadosProvider.jsx";


const RestaurantInList = ({ offer }) => {
  const [selected, setSelected] = useState(false);

  // const { conceptosFacturadosObject, añadirConceptosFacturados, limpiarConceptosFacturados } = useContext(FacturadosContext);
  // const [conceptosFacturados, setConceptosFacturados] = conceptosFacturadosObject;


  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const video = useRef(null);
  const [status, setStatus] = useState({});

  const defaultScreenRatio = 1 / 1.76;
  const [videoRatio, setVideoRatio] = useState(defaultScreenRatio);

  const updateVideoRatioOnDisplay = (videoDetails) => {
    const { width, height } = videoDetails.naturalSize;
    const newVideoRatio = width / height;

    setVideoRatio(newVideoRatio);
  };

  const isVideoOrImage = (link) => {
    const isImageVar = isImage(link);
    const isVideoVar = isVideo(link);

    if (isImageVar == true && isVideoVar == false) {
      isstatusagain = "image";
    } else if (isImageVar == false && isVideoVar == true) {
      isstatusagain = "video";
    }

    return isstatusagain;
  };

  const isImage = (v) => {
    const imageExtensions = [".gif", ".jpeg", ".png", ".jpg", ".heic"];

    let imagestatus = false;

    imageExtensions.map((e) => {
      if ((isstatus = v.includes(e))) {
        imagestatus = true;
      }
    });
    return imagestatus;
  };
  const isVideo = (v) => {
    const videoExtensions = [
      ".mpg",
      ".mp2",
      ".mpeg",
      ".mpe",
      ".mpv",
      ".mp4",
      ".mov",
    ]; //you can add more extensions

    let videostatus = false;
    videoExtensions.map((e) => {
      if (v.includes(e)) {
        videostatus = true;
      }
    });
    return videostatus;
  };

  const setDefaultRestaurant = async (pk) => {
    setSelected(true);
    const res = await fetch(BASE_URL + "set-restaurant-digital-chef/", {
      method: "POST",
      body: JSON.stringify({ favourite_restaurant: pk }),
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });
    var jsonData = await res.json();
    getAndSetRestaurant(authTokens?.access, setRestaurantChosen);
    //limpiarConceptosFacturados()
    setSelected(false);
  };

  return (
    <View
      style={offer.restaurant.pk == restaurantChosen.pk ? styles.greencard : styles.card}
    >
      {offer.restaurant.image ? (
        isVideoOrImage(offer.restaurant.image) == "image" ? (
          <ScaledImage
            style={
              offer.restaurant.pk == restaurantChosen.pk
                ? styles.imageGreenCard
                : styles.image
            }
            uri={offer.restaurant.image}
            finalwidth={
              offer.restaurant.pk == restaurantChosen.pk
                ? styles.imageGreenCard.width
                : styles.image.width
            }
          />
        ) : (
          <View style={styles.videowrapper}>
            <Video
              ref={video}
              source={{ uri: offer.restaurant.image_link }}
              useNativeControls
              style={{ ...styles.video, aspectRatio: videoRatio }}
              resizeMode="contain"
              isLooping
              onPlaybackStatusUpdate={setStatus}
              onReadyForDisplay={updateVideoRatioOnDisplay}
            />
          </View>
        )
      ) : null}
      <View style={styles.insidecard}>
        <View>
          <Text
            style={
              offer.restaurant.pk == restaurantChosen.pk
                ? styles.greenTextBold
                : styles.textBold
            }
          >
            {offer.restaurant.restaurant_name}
          </Text>
        </View>

        <View>
          <Text
            style={
              offer.restaurant.pk == restaurantChosen.pk ? styles.greentext : styles.text
            }
          >
            {offer.restaurant.address}
          </Text>
        </View>

        {selected ? <ActivityIndicator size={33} /> : null}

        {offer.restaurant.pk == restaurantChosen.pk ? null : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setDefaultRestaurant(offer.restaurant.pk);
            }}
          >
            <Text style={styles.textbutton}>Elegir como predilecto</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default RestaurantInList;

const styles = StyleSheet.create({
  image: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: '100%',
  },
  imageGreenCard: {
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    width: '100%',
  },
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 30,
    overflow: 'hidden'
  },
  greencard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "green",
    borderRadius: 30,
    overflow: 'hidden',
  },
  insidecard: {
    padding: 15,
  },
  text: {
    color: "black",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  greentext: {
    color: "green",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textBold: {
    color: "black",
    fontSize: 34,
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  greenTextBold: {
    color: "green",
    fontSize: 34,
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  button: {
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
  },
  textbutton: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  videowrapper: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  video: {
    flex: 1,
    width: Dimensions.get("window").width * 0.9 - 2,
    alignSelf: "center",
  },
});
