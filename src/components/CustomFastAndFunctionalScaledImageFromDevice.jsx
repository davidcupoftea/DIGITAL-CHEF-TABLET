import { useEffect, useRef, useState } from "react";
import { Alert, View, ActivityIndicator, Image, StyleSheet, Text} from "react-native";

export function getImgXtension(uri) {
  var basename = uri.split(/[\\/]/).pop();
  var basename = basename.split(/[?]/).shift();
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
}


const CustomFastAndFunctionalScaledImage = ({ uri, style, finalwidth, finalheight }) => {
  const isMounted = useRef(true);
  const [imgUri, setUri] = useState(uri);

  const [finalWidth, setFinalWidth] = useState('')
  const [finalHeight, setFinalHeight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function loadImg() {
      let imgXt = getImgXtension(uri);
      if (!imgXt || !imgXt.length) {
        //Alert.alert(`Couldn't load Image!`);
        return;
      }
        Image.getSize(
          `${imgUri}`,
          (width, height)=>{
            if (finalwidth && !finalheight) {
              setFinalHeight(parseInt(height*finalwidth/width))
              setFinalWidth(finalwidth)
            } else if (!finalwidth && finalheight) {
              setFinalWidth(parseInt(width*finalheight/height))
              setFinalHeight(finalheight)
            } else {
              setFinalHeight(finalheight)
              setFinalWidth(finalwidth)
            }
            setLoading(false)
          },
          (error)=>{
            Alert.alert(error.toString())
        })

    }
    loadImg();
    return () => (isMounted.current = false);
  }, []);
  return (
    <>
      {imgUri ? ( loading ?
                       <View
                       style={{ ...style, alignItems: "center", justifyContent: "center", marginTop: 5 }}
                     >
                       <ActivityIndicator size={33}/>
                       <Text style={styles.text}>Is not loaded</Text>
                     </View>:
        <Image source={{ uri: imgUri , cache: 'default'}} style={{ ...style, width: finalWidth, height: finalHeight, alignSelf: 'center' }} />
      ) : (
        <View
          style={{ ...style, alignItems: "center", justifyContent: "center", marginTop: 5 }}
        >
          <ActivityIndicator size={33} />
          <Text style={styles.text}>There is no imgUri</Text>
        </View>
      )}
    </>
  );
};
export default CustomFastAndFunctionalScaledImage; //ARCHIVO REPASADO X2

const styles = StyleSheet.create({
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Function-Regular",
  }})
