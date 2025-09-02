import { useState, useRef } from "react";
import { View, Animated } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { PanGestureHandler, TapGestureHandler } from "react-native-gesture-handler";

const MesaInCanva = ({ mesa, isEditing }) => {
  const [isRounded, setIsRounded] = useState(false);

  // Animated.ValueXY para manejar posición fácilmente
  const position = useRef(new Animated.ValueXY({ x: mesa.x || 50, y: mesa.y || 50 })).current;

  const handleTap = () => {
    if (isEditing) setIsRounded(!isRounded);
  };

  // Se llama mientras arrastramos
  const handleDrag = (event) => {
    const { translationX, translationY } = event.nativeEvent;
    position.setValue({
      x: (mesa.x || 50) + translationX,
      y: (mesa.y || 50) + translationY,
    });
  };

  // Se llama al terminar el gesto
  const handleDragEnd = (event) => {
    const { translationX, translationY } = event.nativeEvent;
    // Actualizamos las coordenadas base de la mesa
    mesa.x = (mesa.x || 50) + translationX;
    mesa.y = (mesa.y || 50) + translationY;
    position.setValue({ x: mesa.x, y: mesa.y });
  };

  return (
    <TapGestureHandler onActivated={handleTap}>
      <PanGestureHandler onGestureEvent={handleDrag} onEnded={handleDragEnd}>
        <Animated.View
          style={{
            width: 50,
            height: 50,
            transform: [{ translateX: position.x }, { translateY: position.y }],
          }}
        >
          <Svg width={50} height={50}>
            {isRounded ? (
              <Circle cx={25} cy={25} r={25} fill="orange" />
            ) : (
              <Rect x={0} y={0} width={50} height={50} fill="orange" />
            )}
          </Svg>
        </Animated.View>
      </PanGestureHandler>
    </TapGestureHandler>
  );
};

export default MesaInCanva;