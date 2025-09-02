import {useEffect, useState} from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native'
import { useNavigation } from "@react-navigation/native";

const ResetPasswordDone = () => {
  const [seconds, setSeconds] = useState(10)
  const [loaded, setLoaded] = useState(false)
  const navigation = useNavigation();

  useEffect(()=>{
    if (seconds == '0' && loaded== true) {
      setLoaded(false)
      return () => {
        clearInterval(timer2)
        navigation.navigate('Login con Email')

      }
    }

    let timer2 = setInterval(() => {
      if(loaded == true){
      setSeconds(String(seconds -1))
      }

    }, 1000);


    return () => {
      clearInterval(timer2);
    };

  }, [seconds, loaded])

  useEffect(()=>{
    setLoaded(true)
  }, [])

  return (
    <View style={styles.viewable}>
      <Text style={styles.textbig}>Éxito.</Text>
      <Text style={styles.text}>Has cambiado tu contraseña correctamente. Redireccionando a la pantalla de login en {seconds} segundos.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  viewable: {
      padding: 20,
      flexGrow: 1,
  },
  textbig: {
      color: 'white',
      textAlign: 'center',
      fontSize: 38,
      marginBottom: 10,
      marginTop: StatusBar.currentHeight,
      fontFamily: 'Function-Regular',
  },
  text: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
      marginBottom: 10,
      fontFamily: 'Function-Regular',
  }  
})

export default ResetPasswordDone

//REPASADO Y LIMPIADO