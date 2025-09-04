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
const CustomFastAndFunctionalScaledImage = ({ uri, style }) => {
  const isMounted = useRef(true);
  const [imgUri, setUri] = useState("");

  const [finalWidth, setFinalWidth] = useState('')
  const [finalHeight, setFinalHeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerWidth) return; // esperamos a saber el ancho disponible

    async function loadImg() {
      let imgXt = getImgXtension(uri);
      if (!imgXt || !imgXt.length) return;

      let uriwithoutkeys = uri.split(/[?]/).shift();
      let imgXistsInCache = await findImageInCache(uriwithoutkeys, imgXt);
      var { cacheKey } = imgXistsInCache;
      var cacheFileUri = `${FileSystem.cacheDirectory}${cacheKey}.${imgXt[0]}`;

      if (imgXistsInCache.exists) {
        setUri(cacheFileUri);
        Image.getSize(
          cacheFileUri,
          (width, height) => {
            const ratio = height / width;
            setFinalWidth(containerWidth);
            setFinalHeight(containerWidth * ratio);
            setLoading(false);
          },
          () => {}
        );
      } else {
        let cached = await cacheImage(uri, cacheFileUri, () => {});
        if (cached.cached) {
          setUri(cacheFileUri);
          Image.getSize(
            cacheFileUri,
            (width, height) => {
              const ratio = height / width;
              setFinalWidth(containerWidth);
              setFinalHeight(containerWidth * ratio);
              setLoading(false);
            },
            () => {}
          );
        }
      }
    }

    loadImg();
    return () => (isMounted.current = false);
  }, [containerWidth, uri]);
  return (
    <View
      style={{ ...style }}
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
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
    </View>
  );
};
export default CustomFastAndFunctionalScaledImage; //ARCHIVO REPASADO X2
