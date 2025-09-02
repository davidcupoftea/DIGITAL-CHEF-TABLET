import { useState, useRef } from "react";
import { Animated } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { PanGestureHandler, TapGestureHandler, State } from "react-native-gesture-handler";

const MesaInCanva = ({ mesa, isEditing }) => {
  const [isRounded, setIsRounded] = useState(false);

  // Posición inicial desde mesa
  const position = useRef(
    new Animated.ValueXY({ x: mesa.x || 50, y: mesa.y || 50 })
  ).current;

  const handleTap = () => {
    if (isEditing) setIsRounded(!isRounded);
  };

  const handleDrag = Animated.event(
    [
      {
        nativeEvent: {
          translationX: position.x,
          translationY: position.y,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const handleStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      // Guardamos el offset actual antes de empezar a mover
      position.setOffset({
        x: position.x.__getValue(),
        y: position.y.__getValue(),
      });
      position.setValue({ x: 0, y: 0 });
    }

    if (event.nativeEvent.state === State.END) {
      // Acumulamos el offset cuando termina
      position.flattenOffset();

      // Guardamos coordenadas absolutas en la mesa (opcional)
      mesa.x = position.x.__getValue();
      mesa.y = position.y.__getValue();
    }
  };

  return (
    <TapGestureHandler onActivated={handleTap}>
      <PanGestureHandler
        onGestureEvent={handleDrag}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View
          style={{
            width: 50,
            height: 50,
            transform: position.getTranslateTransform(),
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