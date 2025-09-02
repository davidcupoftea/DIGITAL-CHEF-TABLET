import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Text, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../services/index.jsx";

export default function AskResettingPassword() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false)

  const gettingEmailForNewPassword = async () => {
    setLoading(true)
    let response = await fetch(
      BASE_URL + "password_reset_dc/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      }
    );
    const data = await response.json();

    if (response.status === 200) {
      Alert.alert(
        "Email enviado",
        "Hemos enviado un email desde el cual podrás cambiar tu contraseña. Gracias por usar nuestra aplicación."
      );
    } else {
      Alert.alert(
        "Ha habido un problema",
        "¿Seguro que tienes conexión a internet? ¿Has puesto un email no registrado en la app?"
      );
    }
    setLoading(false)
  };
  return (
    <KeyboardAvoidingView style={styles.viewable}>
      <Text style={styles.textbig}>Pide una nueva contraseña</Text>

      <Text style={styles.text}>Email </Text>
      <TextInput
        style={styles.textinput}
        onChangeText={setEmail}
        value={email}
      />

     {loading ?<ActivityIndicator size="large" /> : null}

      <TouchableOpacity
        onPress={() => {
          gettingEmailForNewPassword();
        }}
        style={styles.button}
      >
        <Text style={styles.buttontext}>Pedir resetear la contraseña</Text>
      </TouchableOpacity>
      <Text style={styles.textforregistering}>
        ¿Ya recuerdas la contraseña? Loguéate{" "}
        <Text
          onPress={() => {
            navigation.navigate("Login con Email");
          }}
          style={styles.textforregistering2}
        >
          aquí.
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  viewable: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
  },
  textbig: {
    color: "white",
    textAlign: "center",
    fontSize: 42,
    marginBottom: 10,
    fontFamily: 'Function-Regular',
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 25,
    marginBottom: 10,
    fontFamily: 'Function-Regular',
  },
  textinput: {
    padding: 4,
    paddingHorizontal: 10,
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
  },
  textforregistering: {
    color: "white",
    textAlign: "center",
    marginTop: 10,
    fontFamily: 'Function-Regular',
    fontSize: 22,
  },
  textforregistering2: {
    color: "white",
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
    fontFamily: 'Function-Regular',
    fontSize: 22,
  },
  button: {
    borderColor: "white",
    backgroundColor: "white",
    borderWidth: 1,
    padding: 10,
    marginTop: 15,
  },
  buttontext: {
    padding: 5,
    color: "black",
    textAlign: "center",
    fontSize: 23,
    fontFamily: 'Function-Regular',
  },
});
//REPASADO Y LIMPIO