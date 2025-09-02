import { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import ScaledImage from "./CustomFastAndFunctionalScaledImageFromDevice.jsx";
import * as Device from "expo-device";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import * as ImagePicker from "expo-image-picker";
import {
  BASE_URL
} from "../services/index.jsx";

const TrabajosScreen = (variable) => {

  const [title, setTitle] = useState(null);
  const [readableDate, setReadableDate] = useState(null);
  const [description, setDescription] = useState(null);
  const [visible, setVisible] = useState(false);

  const [image, setImage] = useState(false);
  const [imageLink, setImageLink] = useState(null);
  const [imageOrVideoName, setImageOrVideoName] = useState(null);
  const [imageOrVideoType, setImageOrVideoType] = useState(null);
  const [typeOfMedia, setTypeOfMedia] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const [publishingDate, setPublishingDate] = useState(new Date());
  const [startedEditingPublishingDate, setStartedEditingPublishingDate] =
    useState(false);
  const [publishingDateString, setPublishingDateString] = useState("");

  const [publishingDate2, setPublishingDate2] = useState(new Date());
  const [startedEditingPublishingDate2, setStartedEditingPublishingDate2] =
    useState(false);
  const [publishingDateString2, setPublishingDateString2] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [showPicker2, setShowPicker2] = useState(false);

  const video = useRef(null);
  const [status, setStatus] = useState({});

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const toggleDatePicker2 = () => {
    setShowPicker2(!showPicker2);
  };

  const onChangePicker = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setPublishingDate(currentDate);
      if (Device.osName === "Android" || Platform.OS === "android") {
        let Day = String(currentDate.getDate()).padStart(2, "0");
        let Month = String(currentDate.getMonth() + 1).padStart(2, "0");
        let Year = currentDate.getFullYear();
        toggleDatePicker();
        setPublishingDateString(`${Year}-${Month}-${Day}`);
      }
    } else {
      toggleDatePicker();
    }
  };

  const onChangePicker2 = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setPublishingDate2(currentDate);
      if (Device.osName === "Android" || Platform.OS === "android") {
        let Day = String(currentDate.getDate()).padStart(2, "0");
        let Month = String(currentDate.getMonth() + 1).padStart(2, "0");
        let Year = currentDate.getFullYear();
        toggleDatePicker2();
        setPublishingDateString2(`${Year}-${Month}-${Day}`);
      }
    } else {
      toggleDatePicker2();
    }
  };

  const confirmIOSDate = () => {
    let Day = String(reservationDate.getDate()).padStart(2, "0");
    let Month = String(reservationDate.getMonth() + 1).padStart(2, "0");
    let Year = reservationDate.getFullYear();
    setPublishingDateString(`${Year}-${Month}-${Day}`);
    toggleDatePicker();
  };

  const confirmIOSDate2 = () => {
    let Day = String(reservationDate.getDate()).padStart(2, "0");
    let Month = String(reservationDate.getMonth() + 1).padStart(2, "0");
    let Year = reservationDate.getFullYear();
    setPublishingDateString2(`${Year}-${Month}-${Day}`);
    toggleDatePicker2();
  };

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  useEffect(() => {

    if (imageLink != undefined && imageLink != null) {

      let result = isVideoOrImage(imageLink);
      setTypeOfMedia(result);
    }
  }, [imageLink]);

  const navigation = useNavigation();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });

    if (!result.canceled) {
      setImage(true);
      setImageLink(result.assets[0].uri);
      setImageOrVideoName(result.assets[0].fileName);
      setImageOrVideoType(result.assets[0].mimeType);
    }
  };

  const createJob = async (restaurantChosen_pk) => {
    setDisabled(true);
    if (
      !title ||
      !description ||
      !readableDate ||
      !publishingDateString ||
      !publishingDateString2
    ) {
      setDisabled(false);
      Alert.alert("¡Tienes que rellenar todos los campos!");
      return;
    }
    let data = new FormData();
    data.append("title", title);
    data.append("readableDate", readableDate);
    data.append("startDate", publishingDateString);
    data.append("finishDate", publishingDateString2);
    data.append("description", description);
    data.append("visible", visible);
    if (image && imageLink) {
      data.append("image", image);
      data.append("image_link", {
        name: imageOrVideoName,
        uri: imageLink,
        type: imageOrVideoType,
      });
    } else {
      data.append("image", false);
      data.append("image_link", null);
    }
    const res4 = await fetch(
      BASE_URL + "crear-trabajo-digital-chef/" + restaurantChosen_pk + "/",
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
      Alert.alert("Éxito", "Se ha creado el trabajo");
      navigation.goBack();
    } else if (jsonData4.status == 'nook'){
      Alert.alert('Error', jsonData4.message)

    }
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
    const imageExtensions = [".gif", ".jpeg", ".png", ".jpg"];

    imagestatus = false;

    imageExtensions.map((e) => {
      if (v.includes(e)) {
        imagestatus = true;
      }
    });
    return imagestatus;
  };
  const isVideo = (v) => {
    const videoExtensions = [".mpg", ".mp2", ".mpeg", ".mpe", ".mpv", ".mp4"]; //you can add more extensions

    videostatus = false;
    videoExtensions.map((e) => {
      if (v.includes(e)) {
        videostatus = true;
      }
    });
    return videostatus;
  };

  return (
    <>
      <ScrollView>
        <View style={styles.viewable}>
          <View>
            <Text style={styles.text}>Titulo </Text>
            <TextInput
              style={styles.textinput}
              onChangeText={setTitle}
              value={title}
            ></TextInput>
          </View>
          <View>
            <Text style={styles.text}>Selecciona la fecha de inicio</Text>
            <Pressable
              onPress={() => {
                setShowPicker(true);
                setStartedEditingPublishingDate(true);
              }}
            >
              <TextInput
                style={styles.textinput}
                placeholder="El día que quieres que empiece"
                value={publishingDateString}
                onChangeText={setPublishingDate}
                placeholderTextColor="white"
                editable={false}
                onPressIn={toggleDatePicker}
              />
            </Pressable>
            {showPicker == false &&
            publishingDateString.length == 0 &&
            startedEditingPublishingDate == true ? (
              <Text style={styles.texterror}>
                Tienes que rellenar este campo
              </Text>
            ) : null}
            {showPicker && (
              <RNDateTimePicker
                mode="date"
                display="spinner"
                value={publishingDate}
                onChange={onChangePicker}
                dateFormat="day month year"
                style={styles.datePicker}
                textColor="white"
              />
            )}

            {showPicker &&
              (Device.osName === "iOS" ||
                Device.osName === "iPadOS" ||
                Platform.OS === "ios") && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <TouchableOpacity style={styles.button}>
                    <Text
                      style={styles.buttontextCancel}
                      onPress={toggleDatePicker}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.button}>
                    <Text
                      style={styles.buttontextConfirm}
                      onPress={confirmIOSDate}
                    >
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
          <View>
            <Text style={styles.text}>
              Selecciona la fecha de finalización (no incluida)
            </Text>
            <Pressable
              onPress={() => {
                setShowPicker2(true);
                setStartedEditingPublishingDate2(true);
              }}
            >
              <TextInput
                style={styles.textinput}
                placeholder="El día que quieres que finalice"
                value={publishingDateString2}
                onChangeText={setPublishingDate2}
                placeholderTextColor="white"
                editable={false}
                onPressIn={toggleDatePicker2}
              />
            </Pressable>
            {showPicker2 == false &&
            publishingDateString2.length == 0 &&
            startedEditingPublishingDate2 == true ? (
              <Text style={styles.texterror}>
                Tienes que rellenar este campo
              </Text>
            ) : null}
            {showPicker2 && (
              <RNDateTimePicker
                mode="date"
                display="spinner"
                value={publishingDate2}
                onChange={onChangePicker2}
                dateFormat="day month year"
                style={styles.datePicker}
                textColor="white"
              />
            )}

            {showPicker2 &&
              (Device.osName === "iOS" ||
                Device.osName === "iPadOS" ||
                Platform.OS === "ios") && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <TouchableOpacity style={styles.button}>
                    <Text
                      style={styles.buttontextCancel}
                      onPress={toggleDatePicker2}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.button}>
                    <Text
                      style={styles.buttontextConfirm}
                      onPress={confirmIOSDate2}
                    >
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
          <View>
            <Text style={styles.text}>Fecha (en palabras) </Text>
            <TextInput
              style={styles.textinput}
              onChangeText={setReadableDate}
              value={readableDate}
            ></TextInput>
          </View>
          <View>
            <Text style={styles.text}>Descripción </Text>
            <TextInput
              style={styles.textinput}
              multiline={true}
              numberOfLines={4}
              onChangeText={setDescription}
              value={description}
            ></TextInput>
          </View>
          {image ? (
            typeOfMedia == "image" &&
            imageLink != null &&
            imageLink != undefined ? (
              <ScaledImage
                style={{ marginTop: 20, marginBottom: 20 }}
                uri={imageLink}
                finalwidth={300}
              />
            ) : (
              <Video
                ref={video}
                source={{ uri: imageLink }}
                useNativeControls
                style={styles.video}
                resizeMode="contain"
                isLooping
                onPlaybackStatusUpdate={setStatus}
                onReadyForDisplay={updateVideoRatioOnDisplay}
              />
            )
          ) : null}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              pickImage();
            }}
          >
            <Text style={styles.buttontext}>Seleccionar imagen o vídeo</Text>
          </TouchableOpacity>

          {image && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setImage(false);
                setImageLink(null);
                setImageOrVideoName(null);
                setImageOrVideoType(null);
              }}
            >
              <Text style={styles.buttontext}>Borrar imagen</Text>
            </TouchableOpacity>
          )}

          <BouncyCheckbox
            size={25}
            isChecked={visible}
            fillColor="black"
            unFillColor="#FFFFFF"
            useBuiltInState={false}
            text="Visible"
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 2 }}
            style={{ marginTop: 15 }}
            textStyle={{
              fontFamily: "Function-Regular",
              fontSize: 20,
              color: "white",
              textDecorationLine: "none",
            }}
            onPress={(visible) => {
              setVisible(!visible);
            }}
          />
          {disabled ? <ActivityIndicator size="large" /> : null}
          <TouchableOpacity
            activeOpacity={disabled ? 1 : 0.7}
            style={styles.savebutton}
            onPress={() => {
              createJob(restaurantChosen.pk);
            }}
          >
            <Text style={styles.savebuttontext}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  texterror: {
    color: "red",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
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
  },
  video: {
    flex: 1,
    width: 380,
    height: 380,
    alignSelf: "center",
  },
});

export default TrabajosScreen;

//REPASADO Y REVISADO
