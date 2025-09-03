import { View } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import MesaInCanva from './MesaInCanva.jsx'

const CanvasMesas = ({ mesas, isEditing }) => {
const size = 50;
const padding = 10;
const mesasPorFila = 5; 

  mesas.forEach((mesa, index) => {
    if (mesa.x == null || mesa.y == null) {
      const fila = Math.floor(index / mesasPorFila);
      const col = index % mesasPorFila;
      mesa.x = col * (size + padding);
      mesa.y = fila * (size + padding);
    }
  });

  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: "gray" }}>
      <Svg width="100%" height="100%">
        {mesas.map((mesa) => (
            <MesaInCanva key={mesa.id} mesa={mesa} isEditing={isEditing}/>
        ))}
      </Svg>
    </View>
  );
};

export default CanvasMesas;