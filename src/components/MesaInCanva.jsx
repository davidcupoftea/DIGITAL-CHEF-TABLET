import { useState, useRef } from "react";
import { Animated } from "react-native";
import Svg, { Rect, Circle, Text as SvgText} from "react-native-svg";
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";

const MesaInCanva = ({ mesa, isEditing }) => {
  const [isRounded, setIsRounded] = useState(false);

  // Posición inicial desde mesa
  const position = useRef(
    new Animated.ValueXY({ x: mesa.x || 50, y: mesa.y || 50 })
  ).current;

  const handleTap = () => {
    if (isEditing) setIsRounded(!isRounded);
  };

  const borderColor = (() => {
    if (mesa.has_order_with_reservation) return "green";
    if (mesa.has_order_without_reservation) return "#C7F6C7";
    if (mesa.is_reserved) return "#2271b3";
    if (mesa.has_only_conceptos_extra) return "#FFF9C4";
    return "white";
  })();

  const backgroundColor = "rgb(107,106,106)";
  const size = 50;
  const strokeWidth = 4;

  // Texto que se muestra dentro de la mesa
  const displayText = `${mesa.name_of_the_table} - (C. max:${mesa.number_of_comensals})`;

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
        enabled={isEditing}
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
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={(size - strokeWidth) / 2}
                fill={backgroundColor}
                stroke={borderColor}
                strokeWidth={strokeWidth}
              />
            ) : (
                <>
              <Rect
                x={0}
                y={0}
                width={size}
                height={size}
                fill={backgroundColor}
                stroke={borderColor}
                strokeWidth={strokeWidth}
              />
            
            <SvgText
              x={size / 2}
              y={size / 2}
              fontSize={10}
              fill="white"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {displayText}
            </SvgText>
            </>
            )}
          </Svg>
        </Animated.View>
      </PanGestureHandler>
    </TapGestureHandler>
  );
};

export default MesaInCanva;
