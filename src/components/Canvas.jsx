import { useState, useRef, useEffect, useContext  } from "react";
import { View } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import MesaInCanva from "./MesaInCanva.jsx";
import {
  cargarPosiciones,
  guardarPosiciones,
} from "./storageHelperPositionTables.jsx";
import { RestaurantChosenContext } from "./RestaurantChosenProvider.jsx";
import getAndSetRestaurant from "../services/apiCallFavouriteRestaurant.jsx";

const CanvasMesas = ({ mesasOriginales, isEditing }) => {
  const [mesas, setMesas] = useState(mesasOriginales);

  let { restaurantChosenObject } = useContext(RestaurantChosenContext);
  const [restaurantChosen, setRestaurantChosen] = restaurantChosenObject;

  useEffect(() => {
    // Cargar mesas y sus posiciones
    const init = async () => {
      const posiciones = await cargarPosiciones();
      const posicionesRestaurante = posiciones.filter(p => p.restaurantId === restaurantChosen.pk);
      // tu array original de mesas
      // Aplicar posiciones guardadas
      if (posicionesRestaurante.length > 0) {
        const mesasIniciales = [...mesasOriginales];
        console.log("mesasIniciales es", mesasIniciales);
        console.log("posiciones.length es mayor de 0");
        mesasIniciales.forEach((m, index) => {
          const pos = posiciones.find((p) => p.id === m.id);
          if (pos) {
            m.x = pos.x;
            m.y = pos.y;
          }
        });
        console.log("mesasIniciales es", mesasIniciales);
        setMesas(mesasIniciales);
      } else {
        const mesasIniciales = [...mesasOriginales];
        mesasIniciales.forEach((mesa, index) => {
          if (mesa.x == null || mesa.y == null) {
            const fila = Math.floor(index / mesasPorFila);
            const col = index % mesasPorFila;
            mesa.x = col * (size + paddingHorizontal);
            mesa.y = fila * (size + paddingVertical);
          }
        });
        console.log(
          "mesasIniciales sin posicion predeterminada es",
          mesasIniciales
        );
        setMesas(mesasIniciales);
      }
    };
    init();
  }, [mesasOriginales]);

  const size = 50;
  //const padding = 10;
  const paddingHorizontal = 10;
  const paddingVertical = 50;
  const mesasPorFila = 5;

  const actualizarPosicionMesa = (mesaActualizada) => {
    setMesas((prev) => {
      const nuevoArray = prev.map((m) =>
        m.id === mesaActualizada.id ? mesaActualizada : m
      );
      guardarPosiciones(nuevoArray, restaurantChosen.pk); // ✅ guardar el array actualizado
      return nuevoArray;
    });
  };

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: "gray",
        position: "relative",
      }}
    >
      <Svg width="100%" height="100%">
        {mesas.map((mesa) => (
          <MesaInCanva
            key={mesa.id}
            mesa={mesa}
            initialX={mesa.x}
            initialY={mesa.y}
            isEditing={isEditing}
            onUpdate={actualizarPosicionMesa}
          />
        ))}
      </Svg>
    </View>
  );
};

export default CanvasMesas;
