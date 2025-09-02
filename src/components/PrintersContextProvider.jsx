import { useState, createContext } from "react";
import "core-js/stable/atob";
export const PrinterContext = createContext({});
import { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';


const PrintersProvider = ({ children }) => {
  let [selectedPrinters, setSelectedPrinters] = useState([])

    // Cargar impresoras guardadas al inicio
  useEffect(() => {
    const loadPrinters = async () => {
      try {
        const savedPrinters = await AsyncStorage.getItem("selectedPrinters");
        if (savedPrinters) {
          setSelectedPrinters(JSON.parse(savedPrinters));
        }
      } catch (e) {
        //console.log("Error cargando impresoras guardadas", e);
      }
    };
    loadPrinters();
  }, []);

  // Guardar impresoras cada vez que cambien
  useEffect(() => {
    const savePrinters = async () => {
      try {
        await AsyncStorage.setItem("selectedPrinters", JSON.stringify(selectedPrinters));
      } catch (e) {
        //console.log("Error guardando impresoras", e);
      }
    };
    savePrinters();
  }, [selectedPrinters]);
  return (
    <PrinterContext.Provider value={{selectedPrinters, setSelectedPrinters}}>
      {children}
    </PrinterContext.Provider>
  );
};

export default PrintersProvider;
