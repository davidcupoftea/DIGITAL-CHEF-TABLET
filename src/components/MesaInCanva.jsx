import { useState, useRef, useEffect } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";

const MesaInCanva = ({ mesa, isEditing, initialX, initialY }) => {
  const [isRounded, setIsRounded] = useState(false);

  console.log('mesa x is', mesa.x)
  console.log('mesa y is', mesa.y)

  const size = 50; // tamaño de la mesa

  // Animated.ValueXY para manejar posición
  const position = useRef(
    new Animated.ValueXY({ x: initialX || 0, y: initialY || 0 })
  ).current;

  const handleTap = () => {
    if (isEditing) setIsRounded(!isRounded);
  };

//   useEffect(() => {
//   position.setValue({ x: initialX, y: initialY });
// }, [initialX, initialY]);

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
      position.setOffset({
        x: position.x.__getValue(),
        y: position.y.__getValue(),
      });
      position.setValue({ x: 0, y: 0 });
    }

    if (event.nativeEvent.state === State.END) {
      position.flattenOffset();
      mesa.x = position.x.__getValue();
      mesa.y = position.y.__getValue();
    }
  };

  const fillColor = 'gray'
  const borderWidth = '3'
  // Determinar color del borde según estado de la mesa
  let borderColor = "white";

  if (mesa.has_order_with_reservation) borderColor = "green";
  else if (mesa.has_order_without_reservation) borderColor = "#C7F6C7";
  else if (mesa.is_reserved) borderColor = "#2271b3";
  else if (mesa.has_only_conceptos_extra) borderColor = "#FFF9C4";

  //const displayText = `${mesa.name_of_the_table} - (C.max:${mesa.number_of_comensals})`;

  return (
    <TapGestureHandler onActivated={handleTap}>
      <PanGestureHandler
        onGestureEvent={isEditing ? handleDrag : null}
        onHandlerStateChange={isEditing ? handleStateChange : null}
      >
    <Animated.View
      style={{
            position: "absolute",
            width: size,
        alignItems: "center",
        transform: position.getTranslateTransform(),
      }}
    >
      {/* Mesa cuadrada o circular */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: isRounded ? size / 2 : 0,
          backgroundColor: "gray",
          borderWidth: 3,
          borderColor: borderColor,
        }}
      />
      {/* Texto debajo de la mesa */}
      <Text
        style={{
          color: borderColor,
          fontSize: 12,
          textAlign: "center",
          marginTop: 5, // separa el texto de la mesa
          width: size + 20, // un poco más ancho para que quepa el texto
        }}
        numberOfLines={3} // opcional, si quieres limitar líneas
      >
        {`Mesa ${mesa.name_of_the_table} - (C.max:${mesa.number_of_comensals})`}
      </Text>
    </Animated.View>
      </PanGestureHandler>
    </TapGestureHandler>
  );
};

export default MesaInCanva;
