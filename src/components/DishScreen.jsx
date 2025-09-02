import { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Device from "expo-device";
import { Picker } from '@react-native-picker/picker';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import ScaledImage from "./CustomFastAndFunctionalScaledImageFromDevice.jsx";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import {
  BASE_URL,
} from "../services/index.jsx";
import { getImgXtension } from "./CustomFastAndFunctionalScaledImage.jsx";
import { getImgName } from "./CustomFastAndFunctionalScaledImage.jsx";

const DishScreen = (variable) => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [stock, setStock] = useState(0)

  const [dish, setDish] = useState(null);
  const [price, setPrice] = useState(null);
  const [visible, _setVisible] = useState(false);
  const [description, setDescription] = useState(null);
  const [image, setImage] = useState(false);
  const [imageLink, setImageLink] = useState(null);
  const [imageOrVideoName, setImageOrVideoName] = useState(null);
  const [imageOrVideoType, setImageOrVideoType] = useState(null);
  const [imageNotUpdated, setImageNotUpdated] = useState(false);
  const [disabled, setDisabled] = useState(false)

  const navigation = useNavigation();

  const [category, setCategory] = useState(0)
  const [categoryState, setCategoryState] = useState([])

  let { authTokensObject, logOutFunction } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const setVisible = (isvisible) =>{
    if (isvisible == true && stock >= 1){
      _setVisible(true)
    } else if (isvisible == true && stock == 0){
      Alert.alert('Elige un stock de más de 1 antes de hacer el plato visible')
    } else if (isvisible == false) {
      _setVisible(false)
    }
  }


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

  const renderCategoryList = () => {
    if(categoryState != []){
    return categoryState.map((categoryElement, index) => {
      return <Picker.Item label={categoryElement.menu_category} value={categoryElement.id} key={index}/>
    })}
  }

      const getPlatform = () => {
         if(Device.osName === "Android" || Platform.OS === "android"){
          return 'android'
         } else if (Device.osName === "iOS" || Device.osName === "iPadOS" || Platform.OS === "ios"){
          return 'ios'
         }
      }

  const updateNew = async (restaurantChosen_pk) => {
    setDisabled(true)

    if (!dish|| !description || !category || !price ){
      setDisabled(false)
      Alert.alert('¡Tienes que rellenar todos los campos!')
      return
    }

    let data = new FormData();
    data.append("pk_of_dish", variable.route.params.eventId.toString());
    data.append("dish", dish);
    data.append("price", price);
    data.append("description", description);
    data.append("visible", visible);
    data.append('category', category)
    data.append('stock', stock)
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
        "update-dish-digital-chef/" +
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
      setDisabled(false)
      Alert.alert("Éxito", "Se ha actualizado el plato");
      navigation.goBack();
    }
  };

  const fetchDish = async (restaurantChosen_pk) => {
    const res4 = await fetch(
      BASE_URL +
        "dish-detail-digital-chef/" +
        restaurantChosen_pk +
        "/" +
        variable.route.params.eventId.toString() +
        "/",
      {
        method: "GET",
        mode: "no-cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    let res = await res4.json();
    let item = res.data
    let menuCategories = res.menu_categories
    if (res.status == 'unauthorized'){
      Alert.alert('Problema','Necesitas ser propietario para cambiar las características de los platos')
      return
    }
    setCategory(menuCategories[0].id)
    setCategoryState(menuCategories)
    setItem(item);
    setDish(item.dish);
    setDescription(item.description);
    setPrice(item.price);
    setCategory(item.menu_dish.id)
    setStock(item.stock)
    if (item.visible){
      _setVisible(true)
    }
    if (item.image_link){
      setImage(true)
    }
    setImageLink(item.image_link);
    if (item.image_link != null && item.image_link != "null") {
      const imgExtension = getImgXtension(item.image_link);
      setImageOrVideoType(imgExtension[0]);
      const imgName = getImgName(item.image_link);
      setImageOrVideoName(imgName);
      setImageNotUpdated(true);
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchDish(restaurantChosen.pk);
  }, []);

  return (
    <>
      {loading ? (
        <ActivityIndicator size={33} />
      ) : (
        <ScrollView style={styles.scrollviewable}>
          <View style={styles.viewable}>
            <View>
              <Text style={styles.text}>Título</Text>
              <TextInput
                style={styles.textinput}
                onChangeText={setDish}
                value={dish}
              ></TextInput>
            </View>
            <View>
              <Text style={styles.text}>Description</Text>
              <TextInput
                style={styles.textinput}
                multiline={true}
                numberOfLines={4}
                onChangeText={setDescription}
                value={description}
              ></TextInput>
            </View>
            <View>
              <Text style={styles.text}>Precio</Text>
              <TextInput
                style={styles.textinput}
                onChangeText={setPrice}
                value={price}
              ></TextInput>
            </View>
            <View>
              <Text style={styles.text}>Categoría</Text>
              <View style={styles.category}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue, itemIndex) => {
                            setCategory(itemValue)}}
                        style={getPlatform()=='android'?styles.pickerstyleandroid : styles.pickerstyleios}
                        dropdownIconColor='white'
                        itemStyle={{ height: 40, color: 'white' }}
                    >
                        {renderCategoryList()}
                    </Picker>

                </View>
            </View>
            {image ? (
              imageLink != null &&
              imageLink != undefined ? (
                <ScaledImage
                  style={{ marginTop: 20, marginBottom: 20 }}
                  uri={imageLink}
                  finalwidth={300}
                />
              ) : (
                null //AQUÍ PODRÍA HABER EL VIDEO SI FINALMENTE SE IMPLEMENTA
              )
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
                  setImageNotUpdated(false)
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
            <Text style={styles.text}>Hoy se han vendido ({item.stock_sold}) unidades de este producto.</Text>
            <Text style={styles.text}>Stock</Text>
              <TextInput
                style={styles.textinput}
                onChangeText={setStock}
                value={stock.toString()}
              ></TextInput>
              {disabled ? <ActivityIndicator size="large" /> : null}
            <TouchableOpacity
              activeOpacity={disabled ? 1 : 0.7}
              style={styles.savebutton}
              onPress={() => {
                updateNew(restaurantChosen.pk);
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
  scrollviewable: {
    flex: 1,
    flexGrow: 1,
  },
  viewable: {
    padding: 20,
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
    marginTop: 20,
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
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
    pickerstyleios: {
        color: 'white',
        height: 40,

    },
    pickerstyleandroid: {
        color: 'white',

    },
    category:{
      borderColor: 'white', 
      borderWidth: 1, 
      backgroundColor: 'rgb(107,106,106)', 
      marginBottom: 10,
  }
});

export default DishScreen;

//REPASADO Y LIMPIO
