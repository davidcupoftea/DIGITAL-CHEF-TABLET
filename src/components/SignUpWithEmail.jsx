import { useState, useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Text, Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from './AuthUseContextProvider.jsx'
import { BASE_URL } from '../services/index.jsx';
import getuniqueIDorDeviceToken from "../services/getUniqueIDorDeviceToken.jsx";

export default function SignUpWithEmail() {
    const navigation = useNavigation();
    const [disabled, setDisabled] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [loading, setLoading] = useState(false)

    const { authTokensObject } = useContext(AuthFlowContext)
    const [authTokens, setAuthTokens] = authTokensObject;

    async function signUp() {

        var pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
        if (email.match(pattern)){
        }else{
            Alert.alert('El email no es válido')
            setLoading(false)
            return
        }
        if (password.length <= 5){
        Alert.alert('La contraseña tiene que ser de 6 carácteres o más')
        setLoading(false)
        return
    }

        const [android, ios, uniID, deviceToken] =  await getuniqueIDorDeviceToken();
        await getVerifiedEmail(android, ios, uniID, deviceToken);
    }


        async function getVerifiedEmail(android, ios, uniID, deviceToken) {
        var payload = JSON.stringify({
            'email': email.toString(),
            'password': password.toString(),
            'dispositivo': {
                'ios': ios,
                'android': android,
                'devicetoken': deviceToken,
                'uniqueid': uniID,
                //'pushnotificationsid': null,
            },
        });

        let response = await fetch(BASE_URL + 'emails-digital-chef/', {
            method: 'POST',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: payload,
        })
        const data = await response.json()

        if (response.status === 200) {
            setAuthTokens(data.token)
        } else {
            if (data.hasOwnProperty('email')){
            Alert.alert(data['email'].toString())}
            else {
                Alert.alert(data.toString())
            }
            setLoading(false)
        }
    }
    return (
        <KeyboardAvoidingView style={styles.viewable}>

            <Text style={styles.textbig}>Regístrate</Text>

            <Text style={styles.text}>Email </Text>
            <TextInput style={styles.textinput} onChangeText={setEmail}
                value={email}
            />

            <Text style={styles.text}>Password </Text>
            <TextInput secureTextEntry={true} style={styles.textinput} onChangeText={setPassword}
                value={password}
            />
            {loading ? <ActivityIndicator size={33} /> : null}
            <TouchableOpacity onPress={() => { setLoading(true);setDisabled(true); signUp() }} disabled={disabled} style={styles.button}>
                <Text style={styles.buttontext} >Registrarse</Text>
            </TouchableOpacity>
            <Text style={styles.textforregistering}>¿Ya tienes cuenta? Loguéate <Text onPress={() => { navigation.navigate('Login con Email') }} style={styles.textforregistering2}>aquí.</Text></Text>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    viewable: {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
    },
    textbig: {
        color: 'white',
        textAlign: 'center',
        fontSize: 42,
        marginBottom: 10,
        fontFamily: 'Function-Regular',
    },
    text: {
        color: 'white',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 25,
        fontFamily: 'Function-Regular',
    },
    textinput: {
        padding: 4,
        paddingHorizontal: 10,
        color: 'white',
        borderColor: 'white',
        borderWidth: 1,
        marginBottom: 10,
        fontSize: 17,

    },
    textforregistering: {
        color: 'white',
        textAlign: 'center',
        fontSize: 22,
        marginTop: 10,
        fontFamily: 'Function-Regular',
    },
    textforregistering2: {
        color: 'white',
        textAlign: 'center',
        fontSize: 22,
        marginTop: 10,
        textDecorationLine: 'underline',
        fontFamily: 'Function-Regular',
    },
    button: {
        borderColor: 'white',
        backgroundColor: 'white',
        borderWidth: 1,
        padding: 10,
        marginTop: 15,

    },
    buttontext: {
        padding: 5,
        color: 'black',
        textAlign: 'center',
        fontSize: 23,
        fontFamily: 'Function-Regular',

    }
})

//REPASADO Y REVISADO