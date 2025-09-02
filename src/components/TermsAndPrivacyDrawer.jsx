import { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import LegalDocumentSection from "./LegalDocumentSection.jsx";
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import {
  BASE_URL
} from "../services/index.jsx";

const TermsAndPrivacy = () => {
  const [loading, setLoading] = useState(true);

  const [legalDocuments, setLegalDocuments] = useState([]);
  const [legalClauses, setLegalClauses] = useState([]);
  const [legalDocumentsVisible, setLegalDocumentsVisible] = useState({});

  let { authTokensObject, privacyAcceptation, getUserData, logOutFunction } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;


  const navigation = useNavigation();


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
    setLoading(false)
  };


  useEffect(() => {
    for (var legalDocument of legalDocuments) {
      myFunc(legalDocument);
    }
  }, [legalDocuments]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      fetchLegalDocuments();
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
  }
});
export default TermsAndPrivacy;

//REPASADO Y REVISADO
