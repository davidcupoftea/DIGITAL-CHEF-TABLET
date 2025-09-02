import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import ScaledImage from "./CustomFastAndFunctionalScaledImageFromDevice.jsx";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import {
  BASE_URL
} from "../services/index.jsx";
import { getImgXtension } from "./CustomFastAndFunctionalScaledImage.jsx";
import { getImgName } from "./CustomFastAndFunctionalScaledImage.jsx";

const RewardScreen = (variable) => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({});

  const [reward, setReward] = useState(null);
  const [numberOfReward, setNumberOfReward] = useState(null);
  const [rewardDescription, setRewardDescription] = useState(null);
  const [
    rewardDescriptionBeforeDelivered,
    setRewardDescriptionBeforeDelivered,
  ] = useState(null);
  const [image, setImage] = useState(null);
  const [imageLink, setImageLink] = useState(null);
  const [pointsPrice, setPointsPrice] = useState(null);
  const [imageOrVideoName, setImageOrVideoName] = useState(null);
  const [imageOrVideoType, setImageOrVideoType] = useState(null);
  const [imageNotUpdated, setImageNotUpdated] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const navigation = useNavigation();

  let { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });

    if (!result.canceled) {
      setImage(true);
      setImageLink(result.assets[0].uri);
      setImageOrVideoName(result.assets[0].fileName);
      setImageOrVideoType(result.assets[0].mimeType);
      setImageNotUpdated(false);
    }
  };

  const updateReward = async (restaurantChosen_pk) => {
    setDisabled(true);

    if (
      !reward ||
      !numberOfReward ||
      !rewardDescription ||
      !rewardDescriptionBeforeDelivered ||
      !imageLink ||
      !pointsPrice
    ) {
      setDisabled(false);
      Alert.alert(
        "¡Tienes que rellenar todos los campos!",
        "(Incluido lo imagen)"
      );
      return;
    }
    let data = new FormData();
    data.append("pk_of_reward", variable.route.params.eventId.toString());
    data.append("reward", reward);
    data.append("number_of_reward", numberOfReward);
    data.append("reward_description", rewardDescription);
    data.append(
      "reward_description_before_delivered",
      rewardDescriptionBeforeDelivered
    );
    data.append("image_link", imageLink);
    data.append("points_price", pointsPrice);
    if (image && imageLink && !imageNotUpdated) {
      data.append("image", true);
      data.append("image_link", {
        name: imageOrVideoName,
        uri: imageLink,
        type: imageOrVideoType,
      });
    } else if (!image && !imageNotUpdated) {
      data.append("image", false);
    } else {
    }
    const res4 = await fetch(
      BASE_URL +
        "update-reward-digital-chef/" +
        restaurantChosen_pk +
        "/" +
        variable.route.params.eventId.toString() +
        "/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: data,
      }
    );
    var jsonData4 = await res4.json();
    if (jsonData4.status == "ok") {
      setDisabled(false);
      Alert.alert("Éxito", "Se ha actualizado la recompensa");
      navigation.goBack();
    } else if (jsonData4.hasOwnProperty("message")) {
      setDisabled(false);
      Alert.alert("Ha habido un problema", jsonData4.message);
    }
  };

  const fetchNews = async (restaurantChosen_pk) => {
    const res4 = await fetch(
      BASE_URL +
        "rewards-not-gained-dc/" +
        restaurantChosen_pk +
        "/" +
        variable.route.params.eventId.toString() +
        "/",
      {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    var jsonData4 = await res4.json();
    let item = jsonData4;
    setReward(item.reward);
    setNumberOfReward(item.number_of_reward);
    setRewardDescription(item.reward_description);
    setRewardDescriptionBeforeDelivered(
      item.reward_description_before_delivered
    );
    setImageLink(item.image_link);
    setPointsPrice(item.points_price.toString());
    if (item.image_link != null && item.image_link != "null") {
      setImage(true);
      const imgExtension = getImgXtension(item.image_link);
      setImageOrVideoType(imgExtension[0]);
      const imgName = getImgName(item.image_link);
      setImageOrVideoName(imgName);
      setImageNotUpdated(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews(restaurantChosen.pk);
  }, []);

  return (
    <>
      {loading ? (
        <ActivityIndicator size={33} />
      ) : (
        <ScrollView>
          <View style={styles.viewable}>
            <View>
              <Text style={styles.text}>Recompensa </Text>
              <TextInput
                style={styles.textinput}
                onChangeText={setReward}
                value={reward}
              ></TextInput>
            </View>
            <View>
              <Text style={styles.text}>
                Número de la recompensa (por ejemplo: 1, 2, 3...)
              </Text>
              <TextInput
                style={styles.textinput}
                onChangeText={setNumberOfReward}
                value={numberOfReward.toString()}
              ></TextInput>
            </View>
            <View>
              <Text style={styles.text}>Descripción </Text>
              <TextInput
                style={styles.textinput}
                multiline={true}
                numberOfLines={4}
                onChangeText={setRewardDescription}
                value={rewardDescription}
              ></TextInput>
            </View>
            <View>
              <Text style={styles.text}>
                Descripción (que se muestre antes de revelar la recompensa){" "}
              </Text>
              <TextInput
                style={styles.textinput}
                multiline={true}
                numberOfLines={4}
                onChangeText={setRewardDescriptionBeforeDelivered}
                value={rewardDescriptionBeforeDelivered}
              ></TextInput>
            </View>
            <View>
              <Text style={styles.text}>
                Puntos a alcanzar para conseguir la recompensa
              </Text>
              <TextInput
              keyboardType='numeric'
                style={styles.textinput}
                onChangeText={setPointsPrice}
                value={pointsPrice}
              ></TextInput>
            </View>
            {image ? (
              imageLink != null && imageLink != undefined ? (
                <ScaledImage
                  style={{ marginTop: 20, marginBottom: 20 }}
                  uri={imageLink}
                  finalwidth={300}
                />
              ) : null
            ) : null}
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                pickImage();
              }}
            >
              <Text style={styles.buttontext}>Seleccionar imagen</Text>
            </TouchableOpacity>

            {image && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setImage(false);
                  setImageLink(null);
                  setImageOrVideoName(null);
                  setImageOrVideoType(null);
                  setImageNotUpdated(false);
                }}
              >
                <Text style={styles.buttontext}>Borrar imagen</Text>
              </TouchableOpacity>
            )}
            {disabled ? <ActivityIndicator size="large" /> : null}
            <TouchableOpacity
              activeOpacity={disabled ? 1 : 0.7}
              style={styles.savebutton}
              onPress={() => {
                updateReward(restaurantChosen.pk);
              }}
            >
              <Text style={styles.savebuttontext}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  viewable: {
    padding: 20,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    padding: 6,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
  },
  savebutton: {
    marginTop: 20,
    padding: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "black",
  },
  buttontext: {
    fontSize: 26,
    padding: 5,
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  savebuttontext: {
    fontSize: 26,
    padding: 5,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
  }
});

export default RewardScreen;

//REPASADO Y REVISADO
