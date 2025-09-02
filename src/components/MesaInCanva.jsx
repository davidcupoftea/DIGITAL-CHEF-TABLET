import { useEffect, useState, useContext } from "react";
import Svg, { Rect, Circle } from "react-native-svg";
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
import Draggable from "react-native-draggable";


const MesaInCanva = ({ mesa, isEditing }) => {

    const [isRounded, setIsRounded] = useState(false)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)

      const handleMesaPress = () => {
        if (isEditing) {
          setIsRounded(!isRounded); // Cambia forma
        }
      };


      const mesaComponent = isRounded ? (
            //<Circle cx={25} cy={25} r={25} fill="orange" />
            <View><Text>Mesa redonda</Text></View>
          ) : (
            <View><Text>Mesa cuadrada</Text></View>
            //<Rect x={0} y={0} width={50} height={50} fill="orange" />
          );

          return isEditing ? (
            <Draggable
              key={mesa.id}
              x={x || 0}
              y={y || 0}
              onPress={() => handleMesaPress()}
              onDragRelease={(e, gestureState, bounds) => {
                setX(bounds.left);
                setY(bounds.top)
              }}
            >
              {mesaComponent}
            </Draggable>
          ) : (
            <Svg
              key={mesa.id}
              x={x || 0}
              y={y || 0}
              onPress={() => handleMesaPress()}
            >
              {mesaComponent}
            </Svg>
            )



}

export default MesaInCanva;