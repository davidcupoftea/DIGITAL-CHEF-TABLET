import { useState, useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { AuthFlowContext } from './AuthUseContextProvider.jsx'

export default function SignInWithEmail() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const { signInFunction } = useContext(AuthFlowContext)


    return (
        <KeyboardAvoidingView style={styles.viewable}>

                <Text style={styles.textbig}>Loguéate</Text>

                <Text style={styles.text}>Email </Text>
                <TextInput style={styles.textinput} onChangeText={setEmail}
                    value={email}
                />

                <Text style={styles.text}>Password </Text>
                <TextInput secureTextEntry={true} style={styles.textinput} onChangeText={setPassword}
                    value={password}
                />
                {loading? <ActivityIndicator size={33} />: null}
                <TouchableOpacity onPress={() => {setLoading(true); signInFunction({email, password, setLoading})}} style={styles.button}>
                    <Text style={styles.buttontext} >Loguéate</Text>
                </TouchableOpacity>
                <Text style={styles.textforregistering}>¿No tienes cuenta? Regístrate <Text onPress={() => {navigation.navigate('Registrate con Email')}} style={styles.textforregistering2}>aquí.</Text></Text>
                <Text style={styles.textforregistering}>¿Has olvidado la contraseña? Haz click <Text onPress={() => {navigation.navigate('AskResettingPassword')}} style={styles.textforregistering2}>aquí.</Text></Text>
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
        fontSize: 25,
        marginBottom: 10,
        fontFamily: 'Function-Regular',
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
    textinput: {
        padding: 4,
        paddingHorizontal: 10,
        color: 'white',
        borderColor: 'white',
        borderWidth: 1,
        marginBottom: 10,
        fontSize: 17,

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