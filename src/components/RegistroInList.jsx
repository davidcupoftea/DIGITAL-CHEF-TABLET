import { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";

const NewsInList = ({ registro, fetchFacturas }) => {


  return (
    <>
      <View style={registro.tipo_operacion=='Anulacion'?styles.cardred:styles.card}>
        <View style={styles.insidecard}>
          <View>
            <Text style={registro.tipo_operacion=='Anulacion'?styles.textred:styles.textgreen}>Tipo operación:{'\n'}{registro.tipo_operacion}</Text>
          </View>
          {registro.ticket_identifier?(
          <View>
            <Text style={styles.textunderlined}>Identificador de la factura asociada:{'\n'}{registro.ticket_identifier?registro.ticket_identifier.ticket_identifier:null}</Text>
          </View>):null}
          <View>
            <Text style={styles.textunderlined}>Numero serie factura:{'\n'}{registro.numero_serie_factura}</Text>
          </View>
          <View>
            <Text style={styles.textunderlined}>Creado a las:{'\n'}{registro.created.toString()}</Text>
          </View>
          <View>
            <Text style={styles.text}>Restaurante:{'\n'}{registro.restaurant.franchise}, en {registro.restaurant.address}, {registro.restaurant.localidad}</Text>
          </View>
          <View>
            <Text style={styles.text}>Primer registro:{'\n'}{registro.primer_registro.toString()}</Text>
          </View>
          <View>
            <Text style={registro.estado_registro != 'Correcto'?styles.textunderlinedred:styles.text}>Estado registro:{'\n'}{registro.estado_registro}</Text>
          </View>
          <View>
            <Text style={registro.estado_registro != 'Correcto'?styles.textunderlinedred:styles.text}>Codigo error registro:{'\n'}{registro.codigo_error_registro?registro.codigo_error_registro:'No hay código de error'}</Text>
          </View>
          <View>
            <Text style={registro.estado_registro != 'Correcto'?styles.textunderlinedred:styles.text}>Descripcion error registro:{'\n'}{registro.descripcion_error_registro?registro.descripcion_error_registro:'No hay descripcion error registro'}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>Nombre obligado:{'\n'}{registro.nombre_obligado}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>NIF obligado:{'\n'}{registro.nif_obligado}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>Remisión voluntaria:{'\n'}{registro.remision_voluntaria.toString()}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>Incidencia:{'\n'}{registro.incidencia?registro.incidencia.toString():'No'}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>Tiempo de espera:{'\n'}{registro.tiempo_espera}</Text>
          </View>
          <View>
            <Text style={styles.text}>Estado envío:{'\n'}{registro.estado_envio}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>ID emisor envio:{'\n'}{registro.id_emisor_factura}</Text>
          </View>
          <View>
            <Text style={styles.text}>Serie:{'\n'}{registro.ticket_identifier_serie?registro.ticket_identifier_serie:'No hay serie'}</Text>
          </View>
          <View>
            <Text style={styles.text}>Fecha:{'\n'}{registro.fecha}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>Subsanaación:{'\n'}{registro.subsanacion.toString()}</Text>
          </View>
          <View>
            <Text style={styles.textgreen}>Rechazo previo:{'\n'}{registro.rechazo_previo}</Text>
          </View>
          {registro.nombre_destinatario?(
          <View>
            <Text style={styles.text}>Nombre destinatario:{'\n'}{registro.nombre_destinatario?registro.nombre_destinatario:'No hay destinatario'}</Text>
          </View>):null}
          {registro.nif_destinatario?(
          <View>
            <Text style={styles.text}>Nif destinatario:{'\n'}{registro.nif_destinatario?registro.nif_destinatario:'No hay destinatario'}</Text>
          </View>):null}
          <View>
            <Text style={styles.textgreen}>Huella:{'\n'}{registro.huella}</Text>
          </View>
          {}
          <View>
            {!registro.primer_registro?<Text style={styles.text}>Numero serie factura anterior:{'\n'}{registro.numero_serie_factura_anterior}</Text>:null}
          </View>
          <View>
            {!registro.primer_registro?<Text style={styles.text}>Fecha factura anterior:{'\n'}{registro.fecha_factura_anterior}</Text>:null}
          </View>
          <View>
            {!registro.primer_registro?<Text style={styles.text}>Huella factura anterior:{'\n'}{registro.huella_factura_anterior}</Text>:null}
          </View>
          <View>
            <Text style={styles.textblue}>Nombre sistema informático:{'\n'}{registro.nombre_sistema_informatico}</Text>
          </View>
          <View>
            <Text style={styles.textblue}>Nif sistema informático:{'\n'}{registro.nif_sistema_informatico}</Text>
          </View>
          <View>
            <Text style={styles.textblue}>Id sistema informático:{'\n'}{registro.id_sistema_informatico}</Text>
          </View>
          <View>
            <Text style={styles.textblue}>Número instalación:{'\n'}{registro.numero_instalacion}</Text>
          </View>
          <View>
            <Text style={styles.textblue}>Nombre sistema informatico comercial:{'\n'}{registro.nombre_sistema_informatico_comercial}</Text>
          </View>
          <View>
            <Text style={styles.textblue}>Descripcion:{'\n'}{registro.descripcion}</Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 30,
    marginHorizontal:15,
  },
    cardred: {
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 280,
    marginTop: 20,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "red",
    borderRadius: 30,
    marginHorizontal:15,
  },
  text: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textblue: {
    color: "blue",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
    textgreen: {
    color: "green",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
    textred: {
    color: "red",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
  },
  textunderlined:{
    color: "black",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
    textunderlinedred:{
    color: "red",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Function-Regular",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  insidecard: {
    padding: 15,
  }
});

export default memo(NewsInList);

//REPASADO Y LIMPIADO
