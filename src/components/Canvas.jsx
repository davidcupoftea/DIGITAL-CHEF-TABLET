//import { View } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import MesaInCanva from './MesaInCanva.jsx'

const CanvasMesas = ({ mesas, isEditing }) => {


  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: "gray" }}>
      <Svg width="100%" height="100%">
        {mesas.map((mesa) => {
            <MesaInCanva mesa={mesa} isEditing={isEditing}/>
        })}
      </Svg>
    </View>
  );
};

export default CanvasMesas;