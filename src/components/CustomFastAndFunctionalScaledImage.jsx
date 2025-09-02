import { useEffect, useRef, useState } from "react";
import { Alert, View, ActivityIndicator, Image } from "react-native";
import * as FileSystem from "expo-file-system";
import md5 from 'md5';

export function getImgXtension(uri) {
  var basename = uri.split(/[\\/]/).pop();
  var basename = basename.split(/[?]/).shift();
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
}

export function getImgName(uri) {
  var basename = uri.split(/[\\/]/).pop();
  var basename = basename.split(/[?]/).shift();
  var finalname = basename.split(/\./).shift()
  return finalname
}
async function findImageInCache(uri, imgXt) {
  try {
    var cacheKey = md5(uri)
    var uriCache = `${FileSystem.cacheDirectory}${cacheKey}.${imgXt[0]}`
    let info = await FileSystem.getInfoAsync(uriCache);
    return { ...info, err: false, cacheKey: cacheKey };
  } catch (error) {
    return {
      exists: false,
      err: true,
      msg: error,
    };
  }
}
export async function cacheImage(uri, cacheUri, callback) {
  try {
    const downloadImage = FileSystem.createDownloadResumable(
      uri,
      cacheUri,
      {},
      callback
    );
    const downloaded = await downloadImage.downloadAsync();
    return {
      cached: true,
      err: false,
      path: downloaded.uri,
    };
  } catch (error) {
    return {
      cached: false,
      err: true,
      msg: error,
    };
  }
}
const CustomFastAndFunctionalScaledImage = ({ uri, style, finalwidth, finalheight }) => {
  const isMounted = useRef(true);
  const [imgUri, setUri] = useState("");

  const [finalWidth, setFinalWidth] = useState('')
  const [finalHeight, setFinalHeight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    var uriwithoutkeys = uri.split(/[?]/).shift()
    async function loadImg() {
      let imgXt = getImgXtension(uri);
      if (!imgXt || !imgXt.length) {
        //Alert.alert(`Couldn't load Image!`);
        return;
      }
      let imgXistsInCache = await findImageInCache(uriwithoutkeys, imgXt);
      var { cacheKey } = imgXistsInCache
      var cacheFileUri = `${FileSystem.cacheDirectory}${cacheKey}.${imgXt[0]}`;
      if (imgXistsInCache.exists) {
        setUri(cacheFileUri);
        Image.getSize(
          `${cacheFileUri}`,
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
            //Alert.alert(error.toString())
        })
      } else {
        let cached = await cacheImage(uri, cacheFileUri, () => { })
        if (cached.cached) {
          setUri(cacheFileUri)
          setLoading(false)
        } else {
          //Alert.alert(`Couldn't load Image!`);
        }
      }
    }
    loadImg();
    return () => (isMounted.current = false);
  }, [loading]);
  return (
    <>
      {imgUri ? ( loading ?
                       <View
                       style={{ ...style, alignItems: "center", justifyContent: "center", marginTop: 5 }}
                     >
                       <ActivityIndicator size={33}/>
                     </View>:
        <Image source={{ uri: imgUri , cache: 'default'}} style={{ ...style, width: finalWidth, height: finalHeight, alignSelf: 'center' }} />
      ) : (
        <View
          style={{ ...style, alignItems: "center", justifyContent: "center", marginTop: 5 }}
        >
          <ActivityIndicator size={33} />
        </View>
      )}
    </>
  );
};
export default CustomFastAndFunctionalScaledImage; //ARCHIVO REPASADO X2
