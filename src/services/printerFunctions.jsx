import {
  BluetoothManager,
  BluetoothEscposPrinter,
} from "react-native-bluetooth-escpos-printer";
import { BASE_URL } from "../services/index.jsx";
import Decimal from "decimal.js";
import { Alert } from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getNumeroInstalacion = async () => {
const INSTALL_KEY = 'numero_instalacion';
const existingDate = await AsyncStorage.getItem(INSTALL_KEY);
return existingDate
}


const printInAddressAndWithText = async (address, text, qr_tributario_url=null, qr_recompensa=null) => {
  const result = await BluetoothManager.connect(address);
  console.log("result is", result);
  console.log('qr_tributario_url es', qr_tributario_url)
  await BluetoothEscposPrinter.printerInit();
  if (qr_tributario_url != null){
    console.log('qr_tributario_url es', qr_tributario_url)
  await BluetoothEscposPrinter.printText("QR tributario:\n\r",{})
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
  await BluetoothEscposPrinter.printQRCode(qr_tributario_url, 350, 1);
  await BluetoothEscposPrinter.printText("Factura verificable en la sede electrónica de la AEAT\n\r", {});
  await BluetoothEscposPrinter.printText("\n\r", {});
  }
  await BluetoothEscposPrinter.printText("" + text.toString() + "\n\r", {});
  if (qr_recompensa != null){
  await BluetoothEscposPrinter.printText("Escanea el siguiente QR para obtener tu recompensa\n\r", {});
  await BluetoothEscposPrinter.printQRCode(qr_recompensa, 350, 1); 
  }
};

const get_ticket_identifier = async (
  pk,
  authTokens_access,
  simplified,
  nombre = null,
  domicilio = null,
  nif = null
) => {
  console.log("authTokens_access is", authTokens_access);

  const numero_instalacion = await getNumeroInstalacion()
  const res = await fetch(
    BASE_URL + "ticket-identifier/" + pk.toString() + "/", //NO PROBLEMO AQUI, PODRÍA SER CUALQUIERA DE LOS RESTAURANTES_PK DE LA FRANQUICIA
    {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens_access),
      },
      body: JSON.stringify({
        simplified: simplified,
        nombre: nombre,
        domicilio_fiscal: domicilio,
        nif: nif,
        numero_instalacion: numero_instalacion
      }),
    }
  );
  var jsonData2 = await res.json();
  console.log("jsonData 2 Ticketidentifier is", jsonData2);
  if (jsonData2.code == "token_not_valid") {
    Alert.alert("Logueate de nuevo para activar esta función de nuevo");
    return { status: "nook" };
  } else if (jsonData2.message == "control_panel") {
    Alert.alert(
      "Ups",
      "Los elementos de este pedido se deben manejar desde el panel de control o si ya están facturados desde facturas."
    )
    return { status: "nook" };
  } else if (jsonData2.status == 'nook'){
    Alert.alert(
      "Ups",
      jsonData2.message
    )
    return { status: "nook" };
  }
  if (jsonData2.ticket_identifier.slice(0, 2) == "F2"||jsonData2.ticket_identifier.slice(0, 2) == "R5") {
    return {
      status: "ok",
      ticket_identifier: jsonData2.ticket_identifier,
      created: jsonData2.created,
      factura_rectificada: jsonData2.factura_rectificada,
      qr_tributario_url: jsonData2?.qr_tributario_url ?? null,
      qr_recompensa: jsonData2?.qr_recompensa ?? null
    };
  } else if (jsonData2.ticket_identifier.slice(0, 2) == "F1"||jsonData2.ticket_identifier.slice(0, 2) == "R4"){
    return {
      status: "ok",
      ticket_identifier: jsonData2.ticket_identifier,
      nombre_final: jsonData2.nombre,
      nif_final: jsonData2.nif,
      domicilio_final: jsonData2.domicilio_fiscal,
      created: jsonData2.created,
      factura_rectificada: jsonData2.factura_rectificada,
      qr_tributario_url: jsonData2?.qr_tributario_url ?? null,
      qr_recompensa: jsonData2?.qr_recompensa ?? null
    };
  }
};

const get_order_elements_second = (order_elements) => {
    const items = Array.isArray(order_elements) && order_elements.length > 0
    ? order_elements
        .map(({ dish_price,dish_name, quantity, price_corrected, new_price_corrected, tax }) => {
          const unitPrice = price_corrected && new_price_corrected != null
            ? new Decimal(new_price_corrected)
            : new Decimal(dish_price);
          const totalPrice = unitPrice.mul(quantity).toFixed(2);
          return `-${dish_name} (x${quantity}) = ${totalPrice} Euros (Impuestos: ${tax} %) (Base Imponible: ${new Decimal(totalPrice).dividedBy((100 + parseInt(tax, 10)).toString()).times('100').toDP(2).toString()})`;
        })
        .join("\n")
    : "No hay ítems seleccionados";

    return items
}


const get_order_elements = (order_elements) => {
  const items = order_elements
    .map(({ dish, quantity, price, tax }) => {
      console.log("price is", price);
      const order_element =
        "-" +
        dish.toString() +
        " [" +
        price.toString() +
        " Euros] (x" +
        quantity.toString() +
        ") = " +
        new Decimal(price.toString()).times(quantity.toString()) +
        " Euros (Impuestos: " +
        tax +
        "%; Base imponible: " +
        new Decimal(price.toString())
          .times(quantity.toString())
          .dividedBy((100 + parseInt(tax, 10)).toString())
          .times("100")
          .toDP(2) +
        ")";
      return order_element;
    })
    .join("\n\r");
  return items;
};

const get_concepto_elements = (concepto_elements) => {
  const items = concepto_elements
    .map(({ description, price, tax }) => {
      console.log("price is", price);
      const concepto_element =
        "-" +
        description.toString() +
        " [" +
        price.toString() +
        " Euros] (Impuestos: " +
        tax +
        "%; Base imponible: " +
        new Decimal(price.toString())
          .dividedBy((100 + parseInt(tax, 10)).toString())
          .times("100")
          .toDP(2) +
        ")";
      return concepto_element;
    })
    .join("\n\r");
  return items;
};

const createText = (
  ticket_identifier,
  created,
  nombre_final = null,
  domicilio_final = null,
  nif_final = null,
  factura_rectificada = null,
  restaurant,
  items,
  order
) => {
  console.log("restaurant2 inside createText is", restaurant);
  console.log('factura_rectificada es', factura_rectificada)

  if (ticket_identifier.slice(0, 2) == "F1") {
    var tipo_de_factura = "FACTURA COMPLETA\n\r";
  } else if (ticket_identifier.slice(0, 2) == "F2") {
    var tipo_de_factura = "FACTURA SIMPLIFICADA\n\r";
  } else if (ticket_identifier.slice(0, 2) == "R4") {
    var tipo_de_factura =
      "FACTURA RECTIFICATIVA\n\r" +
      "FACTURA QUE SE RECTIFICA: " +
      factura_rectificada.toString() +
      "\n\r";
  } else if (ticket_identifier.slice(0, 2) == "R5") {
    var tipo_de_factura = 
    "FACTURA RECTIFICATIVA\n\r" +
    "FACTURA QUE SE RECTIFICA: " +
      factura_rectificada.toString() +
      "\n\r";
  }

  var text =
    tipo_de_factura +
    "\n\r" +
    "ID: " +
    ticket_identifier.toString() +
    "\n\r" +
    restaurant.franchise_legal_name +
    "\n\r" +
    restaurant.nif +
    "\n\r" +
    restaurant.address +
    ", " +
    restaurant.localidad +
    "\n\r" +
    created.slice(0, 10).toString() +
    " " +
    created.slice(11, 16).toString() +
    "\n\rPRODUCTOS:\n\r" +
    items +
    "\n\rTOTAL:\n\r" +
    order.price_paid +
    " Euros \n\r";

  if (nombre_final != null) {
    addedText =
      "Nombre del receptor:\n\r" +
      nombre_final +
      "\n\r" +
      "Domicilio fiscal del receptor:\n\r" +
      domicilio_final +
      "\n\r" +
      "NIF del receptor:\n\r" +
      nif_final +
      "\n\r";

    text += addedText;
  }

  return text;
};

export const imprimirProforma = async (
  selectedPrinters,
  restaurant = null,
  order = null
) => {
  console.log("imrprimir proforma triggered");
  const items = get_order_elements(order.items);
  console.log("restaurant2 is", restaurant);

  let d = new Date();
  let date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  let time = `${d.getHours()}:${d.getMinutes()}`;
  console.log("date is ", date);
  const text =
    "PROFORMA\n\r" +
    restaurant.franchise_legal_name +
    "\n\r" +
    restaurant.nif +
    "\n\r" +
    date.toString() +
    " " +
    time.toString() +
    "\n\rPRODUCTOS:\n\r" +
    items +
    "\n\rTOTAL:\n\r" +
    order.price_paid +
    " Euros \n\r";

  for (const element of selectedPrinters) {
    printInAddressAndWithText(element.address, text);
  }
};

export const imprimirProformaTextoPanelControl = async (
  selectedPrinters,
  restaurant = null,
  items,
  total
) => {
  let d = new Date();
  let date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  let time = `${d.getHours()}:${d.getMinutes()}`;
  console.log("date is ", date);
  const text =
    "PROFORMA\n\r" +
    restaurant.franchise_legal_name +
    "\n\r" +
    restaurant.nif +
    "\n\r" +
    date.toString() +
    " " +
    time.toString() +
    "\n\rPRODUCTOS:\n\r" +
    items +
    "\n\rTOTAL:\n\r" +
    total.toString() +
    " Euros \n\r";

  for (const element of selectedPrinters) {
    printInAddressAndWithText(element.address, text);
  }
};

export const imprimirTicketTextoPanelControl = async (
  selectedPrinters,
  restaurant = null,
  items,
  total,
  ticket_identifier,
  created,
  qr_tributario_url,
  qr_recompensa
) => {
  const text =
    "FACTURA SIMPLIFICADA\n\r" +
    "ID: " +
    ticket_identifier.toString() +
    "\n\r" +
    restaurant.franchise_legal_name +
    "\n\r" +
    restaurant.nif +
    "\n\r" +
    restaurant.address +
    ", " +
    restaurant.localidad +
    "\n\r" +
    created.slice(0, 10).toString() +
    " " +
    created.slice(11, 16).toString() +
    "\n\rPRODUCTOS:\n\r" +
    items +
    "\n\rTOTAL:\n\r" +
    total.toString() +
    " Euros \n\r";

  for (const element of selectedPrinters) {
    printInAddressAndWithText(element.address, text, qr_tributario_url, qr_recompensa);
  }
};

export const imprimirTicket = async (
  selectedPrinters = null,
  restaurant = null,
  order = null,
  authTokens = null
) => {
  const items = get_order_elements(order.items);
  console.log("restaurant is ", restaurant);

  const simplified = true;
  const {
    status,
    ticket_identifier,
    created,
    nombre_final,
    domicilio_final,
    nif_final,
    factura_rectificada,
    qr_tributario_url,
    qr_recompensa
  } = await get_ticket_identifier(order.pk, authTokens, simplified);

  console.log('QR_TRIBUTARIO_URL NO ES NULL', qr_tributario_url)


  if (status == "ok") {
    const text = createText(
      ticket_identifier,
      created,
      nombre_final,
      domicilio_final,
      nif_final,
      factura_rectificada,
      restaurant,
      items,
      order
    );



    for (const element of selectedPrinters) {
      console.log('SI LLEGA AQUI DEBERÍA IMPRIMIR EL QR')
      printInAddressAndWithText(element.address, text, qr_tributario_url, qr_recompensa);
    }
  }
};

export const imprimirFacturaCompleta = async (
  selectedPrinters = null,
  restaurant = null,
  order = null,
  authTokens = null,
  nombre = null,
  domicilio = null,
  nif = null
) => {
  const items = get_order_elements(order.items);

  const simplified = false;
  const {
    status,
    ticket_identifier,
    created,
    nombre_final,
    domicilio_final,
    nif_final,
    factura_rectificada,
    qr_tributario_url,
    qr_recompensa
  } = await get_ticket_identifier(
    order.pk,
    authTokens,
    simplified,
    nombre,
    domicilio,
    nif
  );

  //LOS NOMBRES DE AQUI ABAJO NO COINCIDEN PORQUE EL BACKEND COMPARA EL NOMBRE CON HACIENDA Y LO CAMBIA
  // if (nombre != nombre_final && nombre_final != null){
  //   Alert.alert('Advertencia', 'El nombre provisto no concuerda con el del sistema, si quieres cambiarlo necesitas crear una factura rectificativa')
  // }
  //LOS NOMBRES DE AQUI ARRIBA NO COINCIDEN PORQUE EL BACKEND COMPARA EL NOMBRE CON HACIENDA Y LO CAMBIA
  if (domicilio != domicilio_final && domicilio_final != null) {
    Alert.alert(
      "Advertencia",
      "El domicilio provisto no concuerda con el del sistema, si quieres cambiarlo necesitas crear una factura rectificativa"
    );
  }
  if (nif != nif_final && nif_final != null) {
    console.log("nif is", nif);
    console.log("nif_final is", nif_final);
    Alert.alert(
      "Advertencia",
      "El nif provisto no concuerda con el del sistema, si quieres cambiarlo necesitas crear una factura rectificativa"
    );
  }

  if (status == "ok") {
    const text = createText(
      ticket_identifier,
      created,
      nombre_final,
      domicilio_final,
      nif_final,
      factura_rectificada,
      restaurant,
      items,
      order
    );

    for (const element of selectedPrinters) {
      printInAddressAndWithText(element.address, text, qr_tributario_url, qr_recompensa);
    }
  }
  if (status == 'ok'){
  return {'status': 'ok'}
  } else {
    return {'status': 'nook'}
  }
};

const getInfoForTicketOrProformaControlPanel = async (
  elementsChosen,
  conceptosChosen,
  authTokens_access,
  ticket = false,
  restaurantChosen,
) => {
  const numero_instalacion = await getNumeroInstalacion()
  const res = await fetch(BASE_URL + "get-info-ticket-o-proforma/" + restaurantChosen.pk + '/', {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens_access),
    },
    body: JSON.stringify({
      elements_chosen: elementsChosen,
      conceptos_chosen: conceptosChosen,
      ticket: ticket,
      numero_instalacion: numero_instalacion
    }),
  });
  var jsonData2 = await res.json();
  if (jsonData2.status == 'nook'){
    Alert.alert('Error',jsonData2.message)
    return {status : 'nook'}
  }
  return {
    order_elements: jsonData2.order_elements,
    concepts: jsonData2.concepts,
    total: jsonData2.total,
    ticket_identifier: jsonData2?.ticket_identifier ?? null,
    created: jsonData2?.created ?? null,
    qr_tributario_url: jsonData2?.qr_tributario_url ?? null,
    qr_recompensa: jsonData2?.qr_recompensa ?? null
  };
};

export const imprimirProformaPanelControl = async (
  elementsChosen,
  conceptosChosen,
  selectedPrinters,
  restaurantChosen,
  authTokens_access
) => {
  const result = await getInfoForTicketOrProformaControlPanel(
    elementsChosen,
    conceptosChosen,
    authTokens_access,
    false,
    restaurantChosen
  );

  if (result.status == 'nook'){
    return
  }

  await console.log('RESULT IS ', result)

  const order_elements_text = await get_order_elements_second(result.order_elements);
  const concept_elements_text = await get_concepto_elements(result.concepts);
  const total = await result.total;
  const final_text = concept_elements_text
  ? order_elements_text + "\n" + concept_elements_text
  : order_elements_text;

  imprimirProformaTextoPanelControl(
    selectedPrinters,
    restaurantChosen,
    final_text,
    total
  );
};

export const imprimirTicketPanelControl = async (
  elementsChosen,
  conceptosChosen,
  selectedPrinters,
  restaurantChosen,
  authTokens_access,
  añadirConceptosFacturados,
  añadirItemsFacturados,
  setElementsChosen,
) => {
  const result = await getInfoForTicketOrProformaControlPanel(
    elementsChosen,
    conceptosChosen,
    authTokens_access,
    true,
    restaurantChosen
  );

  if (result.status == 'nook'){
    return
  }
  

  const order_elements_text = await get_order_elements_second(result.order_elements);
  const concept_elements_text = await get_concepto_elements(result.concepts);
  const total = await result.total;
  const qr_tributario_url = await result.qr_tributario_url
  const qr_recompensa = await result.qr_recompensa
  const final_text = concept_elements_text
  ? order_elements_text + "\n" + concept_elements_text
  : order_elements_text;

  imprimirTicketTextoPanelControl(
    selectedPrinters,
    restaurantChosen,
    final_text,
    total, result.ticket_identifier,
    result.created,
    qr_tributario_url,
    qr_recompensa
  );

  añadirConceptosFacturados(conceptosChosen)
  añadirItemsFacturados(elementsChosen)
};

export const getInfoFacturaCompletaControlPanel = async (
  elementsChosen,
  conceptosChosen,
  authTokens_access,
  restaurantChosen,
  nombre,
  domicilio,
  nif,
  setDisabledEditing,
  añadirConceptosFacturados
) => {

   const numero_instalacion = await getNumeroInstalacion()
  
  console.log('authTokens_access es', authTokens_access)
  const res = await fetch(BASE_URL + "factura-completa-panel-de-control/" + restaurantChosen.pk + '/', {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens_access),
    },
    body: JSON.stringify({
      elements_chosen: elementsChosen,
      conceptos_chosen: conceptosChosen,
      nombre_destinatario: nombre,
      domicilio_fiscal: domicilio,
      nif_destinatario: nif,
      numero_instalacion: numero_instalacion,
    }),
  });
  var jsonData2 = await res.json();
  console.log('HEREE, jsonData2 is', jsonData2)
  if (jsonData2.status == 'nook'){
    Alert.alert('Error',jsonData2.message)
    setDisabledEditing(false)
    return {status: 'nook'}
  } else if( jsonData2.status == 'ok'){
    console.log('conceptosChosen son', conceptosChosen)
    añadirConceptosFacturados(conceptosChosen)

  }
  return {
    order_elements: jsonData2?.order_elements?? null,
    concepts: jsonData2?.concepts?? null,
    total: jsonData2?.total?? null,
    ticket_identifier: jsonData2?.ticket_identifier ?? null,
    created: jsonData2?.created ?? null,
    nombre_final: jsonData2?.nombre_final ?? null,
    domicilio_final: jsonData2?.domicilio_final ?? null,
    nif_final: jsonData2?.nif_final ?? null,
    ticket_identifier_pk: jsonData2?.ticket_identifier_pk ?? null,
    qr_tributario_url: jsonData2?.qr_tributario_url ?? null,
    qr_recompensa: jsonData2?.qr_recompensa ?? null
  };
};

const imprimirFacturaCompletaTextoPanelControl = async (selectedPrinters,
    restaurant,
    items,
    total,
    ticket_identifier,
    created,
    nombre_final,
    domicilio_final,
    nif_final,
    qr_tributario_url,
    qr_recompensa
  ) => {

  var text =
    "FACTURA COMPLETA\n\r" +
    "ID: " +
    ticket_identifier.toString() +
    "\n\r" +
    restaurant.franchise_legal_name +
    "\n\r" +
    restaurant.nif +
    "\n\r" +
    restaurant.address +
    ", " +
    restaurant.localidad +
    "\n\r" +
    created.slice(0, 10).toString() +
    " " +
    created.slice(11, 16).toString() +
    "\n\rPRODUCTOS:\n\r" +
    items +
    "\n\rTOTAL:\n\r" +
    total +
    " Euros \n\r";

  if (nombre_final != null) {
    addedText =
      "Nombre del receptor:\n\r" +
      nombre_final +
      "\n\r" +
      "Domicilio fiscal del receptor:\n\r" +
      domicilio_final +
      "\n\r" +
      "NIF del receptor:\n\r" +
      nif_final +
      "\n\r";

    text += addedText;
  }

  for (const element of selectedPrinters) {
    printInAddressAndWithText(element.address, text, qr_tributario_url,qr_recompensa);
  }

}

export const imprimirFacturaCompletaPanelControl = async (
  elementsChosen,
  conceptosChosen,
  selectedPrinters,
  restaurantChosen,
  authTokens_access,
  nombre,
  domicilio,
  nif,
  setDisabledEditing,
  añadirConceptosFacturados
) => {

  const result = await getInfoFacturaCompletaControlPanel(
  elementsChosen,
  conceptosChosen,
  authTokens_access,
  restaurantChosen,
  nombre,
  domicilio,
  nif,
  setDisabledEditing,
  añadirConceptosFacturados
)

  if (result.status == 'nook'){
    return {'status': 'nook'}
  }

  const order_elements_text = await get_order_elements_second(result.order_elements);
  const concept_elements_text = await get_concepto_elements(result.concepts);
  const total = await result.total;
  const final_text = concept_elements_text
  ? order_elements_text + "\n" + concept_elements_text
  : order_elements_text;


    if (domicilio != result.domicilio_final) {
    Alert.alert(
      "Advertencia",
      "El domicilio provisto no concuerda con el del sistema, si quieres cambiarlo necesitas crear una factura rectificativa"
    );
  }
  if (nif != result.nif_final) {
    console.log("nif is", nif);
    console.log("nif_final is", nif_final);
    Alert.alert(
      "Advertencia",
      "El nif provisto no concuerda con el del sistema, si quieres cambiarlo necesitas crear una factura rectificativa"
    );
  }

  imprimirFacturaCompletaTextoPanelControl(
    selectedPrinters,
    restaurantChosen,
    final_text,
    total,
    result.ticket_identifier,
    result.created,
    result.nombre_final,
    domicilio,
    nif,
    result.qr_tributario_url,
    result.qr_recompensa
  );

  return { 'ticket_identifier_pk': result.ticket_identifier_pk, 'ticket_identifier': result.ticket_identifier }

}



export const soloImprimir = async (ticketIdentifierPk, restaurantChosen, authTokens_access, selectedPrinters) => {

    const res = await fetch(BASE_URL + "get-info-ticket-identifier-factura/" + restaurantChosen.pk + '/', {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens_access),
    },
    body: JSON.stringify({
      ticket_identifier_pk: ticketIdentifierPk
    }),
  });
  var jsonData2 = await res.json();
  console.log('soloImprimir function is', jsonData2)

  console.log('jsonData2.ticket_identifier.order_elements', jsonData2.ticket_identifier.order_elements)
  console.log('jsonData2.ticket_identifier.total', jsonData2.ticket_identifier.total)


  const order_elements_text = await get_order_elements_second(jsonData2.ticket_identifier.order_elements);
  const concept_elements_text = await get_concepto_elements(jsonData2.ticket_identifier.conceptos_extra);
  const final_text = concept_elements_text
  ? order_elements_text + "\n" + concept_elements_text
  : order_elements_text;

    imprimirFacturaCompletaTextoPanelControl(
    selectedPrinters,
    restaurantChosen,
    final_text,
    jsonData2.ticket_identifier.total,
    jsonData2.ticket_identifier.ticket_identifier,
    jsonData2.ticket_identifier.created,
    jsonData2.ticket_identifier.nombre_o_razon_social,
    jsonData2.ticket_identifier.domicilio_fiscal,
    jsonData2.ticket_identifier.nif,
    jsonData2.ticket_identifier?.qr_tributario_url ?? null,
    jsonData2.ticket_identifier?.qr_recompensa ?? null
  );

}

const createTextFacturaInList = (
  ticket_identifier,
  created,
  nombre_final = null,
  domicilio_final = null,
  nif_final = null,
  factura_rectificada = null,
  restaurant,
  items,
  total
) => {
  console.log("restaurant2 inside createText is", restaurant);
  console.log('ticket_identifier es', ticket_identifier);
  console.log('created es', created);
  console.log('nombre_final es', nombre_final);
  console.log('domicilio_final es', domicilio_final);
  console.log('nif_final es', nif_final);
  console.log('factura_rectificada es', factura_rectificada);
  console.log('restaurant es', restaurant);
  console.log('items es', items);
  console.log('total es', total);

  if (ticket_identifier.slice(0, 2) == "F1") {
    var tipo_de_factura = "FACTURA COMPLETA\n\r";
  } else if (ticket_identifier.slice(0, 2) == "F2") {
    var tipo_de_factura = "FACTURA SIMPLIFICADA\n\r";
  } else if (ticket_identifier.slice(0, 2) == "R4"||ticket_identifier.slice(0, 2) == "R5") {
    var tipo_de_factura =
      "FACTURA RECTIFICATIVA\n\r" +
      "FACTURA QUE SE RECTIFICA: " +
      factura_rectificada.toString() +
      "\n\r";
  } else {
    var tipo_de_factura = "FACTURA";
  }

  var text =
    tipo_de_factura +
    "ID: " +
    ticket_identifier.toString() +
    "\n\r" +
    restaurant.franchise_legal_name +
    "\n\r" +
    restaurant.nif +
    "\n\r" +
    restaurant.address +
    ", " +
    restaurant.localidad +
    "\n\r" +
    created.slice(0, 10).toString() +
    " " +
    created.slice(11, 16).toString() +
    "\n\rPRODUCTOS:\n\r" +
    items +
    "\n\rTOTAL:\n\r" +
    total +
    " Euros \n\r";

  if (nombre_final != null) {
    addedText =
      "Nombre del receptor:\n\r" +
      nombre_final +
      "\n\r" +
      "Domicilio fiscal del receptor:\n\r" +
      domicilio_final +
      "\n\r" +
      "NIF del receptor:\n\r" +
      nif_final +
      "\n\r";

    text += addedText;
  }

  return text;
};

export const soloImprimirFacturaAsociada = async (ticketIdentifierPk, restaurantChosen, authTokens_access, selectedPrinters) => {

    const res = await fetch(BASE_URL + "get-info-ticket-identifier-factura-asociada/" + restaurantChosen.pk + '/', {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens_access),
    },
    body: JSON.stringify({
      ticket_identifier_pk: ticketIdentifierPk
    }),
  });
  var jsonData2 = await res.json();
  console.log('soloImprimir function is', jsonData2)

  console.log('jsonData2.ticket_identifier.order_elements', jsonData2.ticket_identifier.order_elements)
  console.log('jsonData2.ticket_identifier.total', jsonData2.ticket_identifier.total)


  const order_elements_text = await get_order_elements_second(jsonData2.ticket_identifier.order_elements);
  const concept_elements_text = await get_concepto_elements(jsonData2.ticket_identifier.conceptos_extra);
  const items = concept_elements_text
  ? order_elements_text + "\n" + concept_elements_text
  : order_elements_text;


  const final_text = createTextFacturaInList(
  jsonData2.ticket_identifier.ticket_identifier,
  jsonData2.ticket_identifier.created,
  jsonData2.ticket_identifier.nombre_o_razon_social,
  jsonData2.ticket_identifier.domicilio_fiscal,
  jsonData2.ticket_identifier.nif,
  jsonData2.ticket_identifier.rectificada?.ticket_identifier,
  restaurantChosen,
  items,
  jsonData2.ticket_identifier.total
)

    for (const element of selectedPrinters) {
      printInAddressAndWithText(element.address, final_text, jsonData2.ticket_identifier?.qr_tributario_url, jsonData2.ticket_identifier?.qr_recompensa);
    }



}
