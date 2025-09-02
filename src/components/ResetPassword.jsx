import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Text, Alert, ActivityIndicator} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from '../services/index.jsx';


export default function SignUpWithEmail({ route }) {

    const [loading, setLoading] = useState(false)
    const checkIfPasswordsMatch = () => {
        if (password === password2) {
            return true;
        } else {
            Alert.alert('Las contraseñas no coinciden')
            return false;
        }
    }

    const gettingNewPasswordForEmail = async () => {
        setLoading(true)

        const passwordsMatch = checkIfPasswordsMatch()
        if (passwordsMatch === true) {
            let response = await fetch(BASE_URL + 'password_reset_dc_confirm/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "password": password, "token" : token })
            })
            const data = await response.json()
            if (data.hasOwnProperty("status") && data['status']== 'OK') {
                navigation.push('ResetPasswordDone')
            } else if (data.hasOwnProperty("detail") && data['detail'] == 'Not found.'){
                Alert.alert('Ha habido un error', 'No hemos encontrado el token para cambiar la contraseña. Vuelve a pedirlo, por favor. (Vuelve a pedir el reseteo de la contraseña)')
            } else if (data.hasOwnProperty("status") && data['status'] == 'expired'){
                Alert.alert('Ha habido un error', 'Pediste el reseteo de la contraseña hace más de un día, vuelve a pedirlo por favor.')
            } else{ 
                Alert.alert('Ha habido un error', data['password'].toString())
            }
            setLoading(false)
        }
    }

    const [email, setEmail] = useState(null)
    const [token, setToken] = useState(null)
    useEffect(() => {      
        const { queryParams } = route.params || {}
        const { email, token } = queryParams;
        setEmail(email)
        setToken(token)
    }, [route.params?.token])



    const navigation = useNavigation();
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    return (
        <KeyboardAvoidingView style={styles.viewable}>

            <Text style={styles.textbig}>Pon tu nueva contraseña dos veces</Text>

            <Text style={styles.text}>Password </Text>
            <TextInput secureTextEntry={true} style={styles.textinput} onChangeText={setPassword}
                value={password}
            />

            <Text style={styles.text}>Password (Otra vez) </Text>
            <TextInput secureTextEntry={true} style={styles.textinput} onChangeText={setPassword2}
                value={password2}
            />
            {loading ? <ActivityIndicator size="large" />: null}
            <TouchableOpacity onPress={() => { gettingNewPasswordForEmail() }} style={styles.button}>
                <Text style={styles.buttontext} >Cambiar contraseña</Text>
            </TouchableOpacity>
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
        fontSize: 38,
        marginBottom: 10,
        fontFamily: 'Function-Regular',
    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'Function-Regular',
    },
    textinput: {
        padding: 4,
        paddingHorizontal: 10,
        color: 'white',
        borderColor: 'white',
        borderWidth: 1,
        marginBottom: 10,

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
        fontFamily: 'Function-Regular',

    }
})

//REPASADO Y LIMPIO