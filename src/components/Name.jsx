import { useState, useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, View, Text, Alert} from 'react-native'
import { AuthFlowContext } from './AuthUseContextProvider.jsx'
import { BASE_URL } from '../services/index.jsx';

export default function Name() {
    const [name, setName] = useState('')
    let { authTokensObject, nameSate, getUserData } = useContext(AuthFlowContext)
    const [authTokens, setAuthTokens] = authTokensObject;
    const [nameFromAuth, setNameFromAuth] = nameSate;

    const sendingName = async () => {
        if (name.length < 1){
            Alert.alert('¡Proporciona un nombre!')
            return
        }

        let response = await fetch(BASE_URL + 'flow-auth-dc/put/', {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + String(authTokens?.access)
            },
            body: JSON.stringify({ "nombre": name })
        })
        const data = await response.json()

        if (response.status === 200) {
            setNameFromAuth(data.nombre === null)
        }else {
            getUserData();
        }
    }
    return (
        <KeyboardAvoidingView style={styles.viewable}>
            <View style={styles.insideviewable}>
                <Text style={styles.text}>Nombre y apellidos</Text>
                <TextInput style={styles.textinput} onChangeText={setName}
                    value={name}
                />
                <TouchableOpacity onPress={() => {sendingName()}} style={styles.button}>
                    <Text style={styles.buttontext} >Guardar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    viewable: {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
    },
    insideviewable: {
        marginTop: 20,
    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontSize: 25,
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
        fontSize: 25,
        fontFamily: 'Function-Regular',
    }
})

//REPASADO Y REVISADO - SI QUE SE UTILIZA