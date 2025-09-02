import { useState } from "react";
import { View } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { PanGestureHandler, TapGestureHandler } from "react-native-gesture-handler";

const MesaInCanva = ({ mesa, isEditing }) => {
  const [isRounded, setIsRounded] = useState(false);
  const [x, setX] = useState(mesa.x || 50);
  const [y, setY] = useState(mesa.y || 50);

  const handleTap = () => {
    console.log('taaaaap')
    if (isEditing) setIsRounded(!isRounded);
  };

  const handleDrag = (event) => {
    console.log('draaag')
    console.log('event is', event)
    setX(event.nativeEvent.translationX);
    setY(event.nativeEvent.translationY);
  };

  return (
    <TapGestureHandler onActivated={handleTap}>
      <PanGestureHandler onGestureEvent={handleDrag}>
        <Svg x={x} y={y} width={50} height={50}>
          {isRounded ? (
            <Circle cx={25} cy={25} r={25} fill="orange" />
          ) : (
            <Rect x={0} y={0} width={50} height={50} fill="orange" />
          )}
        </Svg>
      </PanGestureHandler>
    </TapGestureHandler>
  );
};

export default MesaInCanva;