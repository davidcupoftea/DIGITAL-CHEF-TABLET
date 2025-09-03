import { useEffect, useState, useContext } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  View,
  ScrollView
} from "react-native";
import { AuthFlowContext } from "./AuthUseContextProvider.jsx";
import { PrinterContext } from "./PrintersContextProvider.jsx";
import { useNavigation } from "@react-navigation/native";
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer'; //DESCOMENTAR PARA LA VERSION CON IMPRESORA
import { PermissionsAndroid, Platform } from "react-native";

// Dentro de tu componente, antes de escanear o conectar:

const Impresoras = () => {

  const [printers, setPrinters] = useState([])

  const { selectedPrinters, setSelectedPrinters } = useContext(PrinterContext);

  const requestBluetoothPermissions = async () => {
  if (Platform.OS === "android" && Platform.Version >= 31) { // Android 12+
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);

      const allGranted = Object.values(granted).every(value => value === PermissionsAndroid.RESULTS.GRANTED);
      if (!allGranted) {
        Alert.alert("Permisos denegados", "Necesitas permitir Bluetooth para usar la impresora.");
        return false;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true; // Android < 12 o iOS no requieren permisos explícitos
  }
};

  useEffect(() => {
  const reconnectPrinters = async () => {
    if (selectedPrinters.length > 0) {
      for (let printer of selectedPrinters) {
        try {
          await BluetoothManager.connect(printer.address); // usa address/MAC
          //console.log("Conectado con:", printer.name);
        } catch (e) {
          //console.log("No se pudo conectar con", printer.name, e);
        }
      }
    }
  };

  reconnectPrinters();
}, [selectedPrinters]);


  const addPrinter = async (element) => {
    setSelectedPrinters((prevState) => [...prevState, element]);
  }
  const removePrinter = (element) => {
    let new_printers = [...selectedPrinters];
    new_printers = new_printers.filter((element_to_delete) => JSON.stringify(element_to_delete) != JSON.stringify(element));
    setSelectedPrinters(new_printers);
  };


const contains = (array, element_to_compare) => {
  return array.some((element)=>JSON.stringify(element) === JSON.stringify(element_to_compare))
}

  const selectThisPrinter = (element) =>{

if (!contains(selectedPrinters, element)){
  addPrinter(element)
} else {
  removePrinter(element)
}
  }

  // useEffect(()=>{
  //  console.log('printers are', printers)
  // },[printers])

  // useEffect(()=>{
  //   console.log('actual printers are', selectedPrinters)
  //  },[selectedPrinters])
  
  
  const getDevicesPaired = async (r) => {
    var paired = []
    if(r && r.length>0){
      for(var i=0;i<r.length;i++){
          try{
              paired.push(JSON.parse(r[i])); // NEED TO PARSE THE DEVICE INFORMATION
          }catch(e){
            Alert.alert(e)
          }
      }
  }
  return paired
}


  const scanDevices = async () =>{

  const ok = await requestBluetoothPermissions();
  if (!ok) return;
  

    var enabled = await BluetoothManager.isBluetoothEnabled()
    if (!enabled) {
      var r = await BluetoothManager.enableBluetooth()
      var paired = await getDevicesPaired(r)
      //console.log('paired', paired)
    }else{
      var r = await BluetoothManager.enableBluetooth()
      var paired = await getDevicesPaired(r)
      //console.log('paried', paired)
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    setPrinters(paired)

    //await BluetoothManager.init();

    var devices = await BluetoothManager.scanDevices()
    //console.log('devices are',devices)
    var ss = JSON.parse(devices)
    console.log(ss)
  }

  const navigation = useNavigation();

  const { authTokensObject, logOutFunction } =
    useContext(AuthFlowContext);
  const [authTokens, setAuthTokens] = authTokensObject;


  return (
    <KeyboardAvoidingView style={styles.viewable}>
      <ScrollView>
        <Text style={styles.text}>Impresoras conectadas:</Text>
        {selectedPrinters.map((element, index)=>(
          <Text key={index} style={styles.textgreen}>{element.name}</Text>

        ))}

        <TouchableOpacity
          onPress={() => scanDevices()}
          style={styles.buttonforlogout}
        >
          <Text style={styles.buttontextforlogout}>Escanear dispositivos bluetooth</Text>

        </TouchableOpacity>
        <Text style={styles.text}>Dispositivos disponibles (elige la/s impresora/s):</Text>

        {printers.map((element,index)=>(
          <TouchableOpacity key={index} onPress={()=>{selectThisPrinter(element)}}><View style={contains(selectedPrinters, element)? styles.greencard :styles.card}><Text style={styles.textcard}>{element.name}</Text></View></TouchableOpacity>

        ))}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Impresoras;

const styles = StyleSheet.create({
  viewable: {
    padding: 20,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
  textgreen: {
    color: "#C7F6C7",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  },
  textcard: {
    color: "black",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Function-Regular",
  },
  card: {
    flexDirection: "column",
    marginTop: 20,
    padding: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    elevation: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: "#f0ffff",
    shadowOpacity: 0.8,
  },
  greencard: {
    flexDirection: "column",
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "white",
    borderWidth: 6,
    borderColor: "green",
    borderRadius: 40,
    elevation: 10,
    shadowOffset:{
        width: 5,
        height:5,
    },
    shadowColor: '#f0ffff',
    shadowOpacity: 0.8,
  },
  buttonforlogout: {
    marginTop: 15,
    marginBottom: 25,
    padding: 10,
    borderColor: "white",
    backgroundColor: "rgb(107,106,106)",
    borderWidth: 1,
  },
  buttontextforlogout: {
    padding: 5,
    color: "white",
    textAlign: "center",
    fontFamily: "Function-Regular",
    fontSize: 25,
  }
});

//REPASADO Y LIMPIADO
