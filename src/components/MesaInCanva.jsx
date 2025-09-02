import { useState } from "react";
import Svg, { Rect, Circle } from "react-native-svg";
import Draggable from "react-native-draggable";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";

const MesaInCanva = ({ mesa, isEditing }) => {
  const [isRounded, setIsRounded] = useState(false);
  const [x, setX] = useState(mesa.x || 50);
  const [y, setY] = useState(mesa.y || 50);

  const handleMesaPress = () => {
    console.log("isEditing is", isEditing);
    if (isEditing) {
      console.log("isEditing is", isEditing);
      setIsRounded(!isRounded); // Cambia forma en edición
    }
  };

  // Lo que dibuja la mesa
  const mesaComponent = isRounded ? (
    <Circle cx={25} cy={25} r={25} fill="orange" />
  ) : (
    <Rect x={0} y={0} width={50} height={50} fill="orange" />
  );

  return isEditing ? (
    <Draggable
      x={x}
      y={y}
      onDragRelease={(e, gestureState, bounds) => {
        setX(bounds.left);
        setY(bounds.top);
      }}
      onLongPress={() => console.log("long press")}
      onShortPressRelease={() => console.log("press drag")}
      onPressIn={() => console.log("in press")}
      onPressOut={() => console.log("out press")} // <--- TOQUE CORTO
    >
      {/* <Pressable
        style={{
          width: 50,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={handleMesaPress} // Esto sí se dispara
      >*/}
      <Svg width={50} height={50}>
        {mesaComponent}
      </Svg>
      {/* 
      </Pressable> */}
    </Draggable>
  ) : // En modo normal, se pinta en el SVG padre
  isRounded ? (
    <Circle cx={x + 25} cy={y + 25} r={25} fill="orange" />
  ) : (
    <Rect
      x={x}
      y={y}
      width={50}
      height={50}
      fill="orange"
      onPress={handleMesaPress}
    />
  );
};

export default MesaInCanva;
