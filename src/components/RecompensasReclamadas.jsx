import { useState, useContext, useEffect} from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import RecompensaReclamadaInlistCode from "./RecompensaReclamadaInListCode.jsx";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import { BASE_URL } from "../services/index.jsx";

const RecompensasReclamadas = () => {
  const navigation = useNavigation();

  const { authTokensObject } = useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const [codes, setCodes] = useState([]);
  const [codeToSearch, setCodeToSearch] = useState("");
  const [used, setUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    setLoaded(false);
    const res = await fetch(
      BASE_URL + "get-reward-codes/" + restaurantChosen.pk + "/",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens?.access),
        },
        body: JSON.stringify({ code: codeToSearch, used: used }),
      }
    );

    var jsonData2 = await res.json();

    if (jsonData2.status == "ok") {
      setCodes(jsonData2.codes);
      setLoading(false);
      setLoaded(true);
    } else if (jsonData2.status == "nook") {
      setLoaded(true);
      setLoading(false);
      Alert.alert("Error", jsonData2.message);
    }
  };

    const cardsPerRow = 3;
    const [containerWidth, setContainerWidth] = useState(0);
    const [gapWidth, setGapWidth] = useState(0);
  
    useEffect(() => {
      setGapWidth(containerWidth * 0.02);
    }, [containerWidth]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.text}>
          Aquí podrás ver los códigos de las recompensas aún no canjeadas (y las
          canjeadas si lo necesitas).
        </Text>
        <Text style={styles.texttitle}>Código a canjear</Text>
        <TextInput
          style={styles.textinput}
          onChangeText={setCodeToSearch}
          value={codeToSearch}
        ></TextInput>
        <BouncyCheckbox
          size={25}
          isChecked={used}
          fillColor="black"
          unFillColor="#FFFFFF"
          useBuiltInState={false}
          text="Usadas también"
          iconStyle={{ borderColor: "white" }}
          innerIconStyle={{ borderWidth: 2 }}
          style={{ marginTop: 15 }}
          textStyle={{
            fontFamily: "Function-Regular",
            fontSize: 20,
            color: "white",
            textDecorationLine: "none",
          }}
          onPress={(used) => {
            setUsed(!used);
          }}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            fetchCodes(codeToSearch);
          }}
        >
          <Text style={styles.buttontext}>Buscar recompensa</Text>
        </TouchableOpacity>

        {!loaded && !loading ? (
          <Text style={styles.textsmall}>Pon el código y dale a buscar</Text>
        ) : null}

        {!loaded && loading ? <ActivityIndicator size="large" /> : null}

        <View
          style={styles.containerthreecolumns}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainerWidth(width);
          }}
        >

        {loaded && !loading && codes.length != 0
          ? codes.map((code, index) => {
                          const isLastInRow = (index + 1) % cardsPerRow === 0;
              return (
                <View
                  key={index}
                  style={{
                    flexBasis: `33.33%`,
                    flexGrow: 0,
                    marginBottom: 10,
                    paddingRight: isLastInRow ? 0 : gapWidth,
                  }}
                >
              <RecompensaReclamadaInlistCode
                key={code.pk}
                code={code}
              ></RecompensaReclamadaInlistCode>
              </View>)}
            )
          : null}

          </View>

        {loaded && !loading && codes.length == 0 ? (
          <Text style={styles.textsmall}>
            No hay resultados que coinciden con tu búsqueda
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default RecompensasReclamadas;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column-reverse",
    justifyContent: "flex-start",
    flex: 1,
    padding: 20,
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
    marginTop: 20,
    textAlign: "center",
  },
  text: {
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 22,
  },
  texttitle: {
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 22,
    marginTop: 20,
  },
  textsmall: {
    marginTop: 10,
    color: "white",
    textAlign: "center",
    fontSize: 19,
    fontFamily: "Function-Regular",
  },
  button: {
    marginTop: 30,
    marginBottom: 10,
    padding: 6,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
  },
  buttontext: {
    fontSize: 26,
    padding: 5,
    color: "black",
    textAlign: "center",
    fontFamily: "Function-Regular",
  },
  containerthreecolumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  }
});

//REPASADO Y LIMPIADO
