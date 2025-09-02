import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import LegalDocumentSection from "./LegalDocumentSection.jsx";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import {
  BASE_URL,
} from "../services/index.jsx";

const TermsAndPrivacy = () => {
  const [loading, setLoading] = useState(false);
  const [checkbox, setCheckbox] = useState(false)

  const [legalDocuments, setLegalDocuments] = useState([]);
  const [legalClauses, setLegalClauses] = useState([]);
  const [legalDocumentsVisible, setLegalDocumentsVisible] = useState({});

  let { authTokensObject, privacyAcceptation, getUserData, logOutFunction } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;
  const [isPrivacyNotAccepted, setIsPrivacyNotAccepted] = privacyAcceptation;

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  const navigation = useNavigation();


  const sendingPrivacyAcceptance = async () => {


    if (!checkbox){
      Alert.alert('¡Tienes que aceptar las condiciones!')
      return
    }
    let response = await fetch(BASE_URL + "flow-auth-dc/put/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
      body: JSON.stringify({ shown_privacy_policy: checkbox }),
    });
    const data = await response.json();

    if (response.status === 200) {
      getUserData();
    } else {
      getUserData();
    }
  };

  const fetchLegalDocuments = async () => {
    const res = await fetch(BASE_URL + "get-legal-documents-digital-chef/", {
      method: "GET",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens?.access),
      },
    });

    var jsonData3 = await res.json();

    setLegalDocuments(jsonData3.data);

    if (jsonData3.data != undefined) {
      for (let i = 0; i < jsonData3.data.length; i++) {
        setLegalDocumentsVisible((prevState) => ({ ...prevState, [i]: false }));
      }
    }
  };


  const myFunc = async (legalDocument) => {
    const res = await fetch(
      BASE_URL +
        "get-legal-document-clauses-digital-chef/" +
        legalDocument.id +
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
    var jsonData = await res.json();

    setLegalClauses((prevState) => {
      jsonData.data.sort((a, b) => Number(a.order) - Number(b.order));
      let new_legalClauses = [
        ...prevState,
        { title_of_document: legalDocument, clauses: jsonData.data },
      ];
      new_legalClauses.sort(
        (a, b) =>
          Number(a.title_of_document.order) - Number(b.title_of_document.order)
      );
      return new_legalClauses;
    });
  };


  useEffect(() => {
    for (var legalDocument of legalDocuments) {
      myFunc(legalDocument);
    }
  }, [legalDocuments]);

  useEffect(() => {

    
    const unsubscribe = navigation.addListener("focus", async () => {
      if (authTokens != null && authTokens != 'null'){
      fetchLegalDocuments();
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text style={styles.textBold}>
              Necesitamos que leas y aceptes nuestros términos de uso y nuestra
              política de privacidad.
            </Text>

            {legalClauses.map((element, index) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => {
                    const numberOfLegalDocumentsVisible = Object.keys(
                      legalDocumentsVisible
                    ).length;
                    newState = {};

                    for (let i = 0; i < numberOfLegalDocumentsVisible; i++) {
                      if (i != index) {
                        newState[i] = false;
                      } else {
                        newState[i] = !legalDocumentsVisible[i];
                      }
                    }
                    setLegalDocumentsVisible(newState);
                  }}
                >
                  <Text style={styles.textBold}>
                    {element.title_of_document.legal_document_category}{" "}
                    <Image
                      style={{ height: 12, width: 20 }}
                      source={
                        legalDocumentsVisible[index]
                          ? require("../../assets/arrow-up-white.png")
                          : require("../../assets/arrow-down-white.png")
                      }
                    />
                  </Text>
                </TouchableOpacity>

                <LegalDocumentSection
                  displayed={legalDocumentsVisible[index]}
                  anotherkey={index}
                  clauses={element.clauses}
                ></LegalDocumentSection>
              </View>
            ))}
          </>
        )}
      </ScrollView>
      <BouncyCheckbox
                size={25}
                isChecked={checkbox}
                fillColor="black"
                unFillColor="#FFFFFF"
                useBuiltInState={false}
                text="Acepto la política de privacidad y los términos y condiciones"
                iconStyle={{ borderColor: "white" }}
                innerIconStyle={{ borderWidth: 2 }}
                style={{ margin: 15 }}
                textStyle={{
                  fontFamily: "Function-Regular",
                  fontSize: 20,
                  color: "white",
                  textDecorationLine: "none",
                }}
                onPress={(checkbox) => {
                  setCheckbox(!checkbox);
                }}
              />
      <TouchableOpacity
        style={styles.googlesign}
        onPress={() => {
          sendingPrivacyAcceptance();
        }}
      >
        <Text style={styles.googlesigntext}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textBold: {
    color: "white",
    fontSize: 23,
    textAlign: "center",
    marginTop: 15,
    fontFamily: "Function-Regular",
  },
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
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
  }
});
export default TermsAndPrivacy;

//REPASADO Y REVISADO
