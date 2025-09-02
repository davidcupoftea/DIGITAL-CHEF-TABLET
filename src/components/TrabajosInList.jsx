import { useRef, useState, useContext, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import ScaledImage from "./CustomFastAndFunctionalScaledImage.jsx";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { useNavigation } from "@react-navigation/native";
import {
  BASE_URL,
  getOffset
} from "../services/index.jsx";

const TrabajosInList = ({ offer, fetchTrabajos }) => {

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const navigation = useNavigation();
  const description = offer.description;
  const substring = description.substr(0, 90) + "\u2026";

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

    imagestatus = false;

    imageExtensions.map((e) => {
      if (v.includes(e)) {
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

    videostatus = false;
    videoExtensions.map((e) => {
      if (v.includes(e)) {
        videostatus = true;
      }
    });
    return videostatus;
  };

  const determineIfActive = (offer) => {
    const offset = getOffset();
    let date = new Date();
    let currentDateObject = new Date(date);

    const dateOfStart = offer.startdate;
    const [ya, Ma, da] = dateOfStart.match(/\d+/g);
    const DateOfStartStringFormatted = `${ya}-${Ma}-${da}`;
    const DateOfStart = new Date(DateOfStartStringFormatted);
    const DateOfStartInTime = DateOfStart.getTime();

    const dateOfFinnish = offer.finishdate;
    const [yb, Mb, db] = dateOfFinnish.match(/\d+/g);
    const DateOfFinnishStringFormatted = `${yb}-${Mb}-${db}`;
    const DateOfFinnish = new Date(DateOfFinnishStringFormatted);
    const DateOfFinnishInTime = DateOfFinnish.getTime();

    if (
      parseInt(DateOfStartInTime, 10) <
        parseInt(currentDateObject.getTime(), 10) + offset * 60 * 60 * 1000 &&
      parseInt(currentDateObject.getTime(), 10) + offset * 60 * 60 * 1000 <
        parseInt(DateOfFinnishInTime)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const askBeforeDeleting = (offer_id) => {
    Alert.alert(
      "¿Seguro que quieres borrarlo?",
      "¿Estás seguro de que quieres borrar este trabajo?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () => await deleteJob(offer_id),
        },
      ]
    );
  };

  const deleteJob = async (offer_id) => {
    Alert.alert('Borrando...', 'El elemento seleccionado se está borrando')
    const res = await fetch(
      BASE_URL + "delete-job/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ job: offer_id }),
      }
    );

    var jsonData2 = await res.json();
    if (jsonData2.status == 'ok'){
      fetchTrabajos(restaurantChosen.pk)

    }
  };

  return (
    <View style={offer.visible? styles.greencard : styles.redcard}>
      {offer.image_link ? (
        isVideoOrImage(offer.image_link) == "image" ? (
          <ScaledImage
            style={styles.image}
            uri={offer.image_link}
            finalwidth={styles.image.width}
          />
        ) : (
          <View style={styles.videowrapper}>
            <Video
              ref={video}
              source={{ uri: offer.image_link }}
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
          <Text style={styles.textBold}>{offer.title}</Text>
        </View>
        <View>
          <Text
            style={
              determineIfActive(offer)
                ? styles.textActive
                : styles.textNotActive
            }
          >
            {offer.readabledate}
          </Text>
        </View>
        <View>
          <Text style={styles.text}>{substring}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.navigate("Trabajo", { eventId: offer.id });
          }}
        >
          <Text style={styles.textbutton}>Ver trabajo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonred}
          onPress={() => {
            askBeforeDeleting(offer.id);
          }}
        >
          <Text style={styles.textbutton}>Borrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    marginBottom: 5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: Dimensions.get("window").width * 0.9 - 8,
  },
  greencard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "green",
    borderRadius: 30,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  redcard: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "red",
    borderRadius: 30,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  text: {
    color: "black",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textActive: {
    color: "green",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textNotActive: {
    color: "red",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  textBold: {
    color: "black",
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  insidecard: {
    padding: 15,
  },
  button: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
  },
  buttonred: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "black",
    shadowOpacity: 1,
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

export default memo(TrabajosInList);
//REPASADO Y LIMPIADO
