export const BASE_URL = "https://digitalchef.es/";
export const WARNING_NOT_SCROLLABLE = false
export const RESERVATIONS = true
export const RESERVATIONS_CHOOSE_WINDOW_OR_PATIO = true
export const RESERVATIONS_ASK_INTOLLERANCIES = true
export const RESERVATIONS_ASK_CHILDREN = true
export const FETCH_BLOCKED_HOURS = true
export const PRINTING_FEATURE = true


export const getOffset= () => {
    let currentDate = new Date()
    var myYear = parseInt(currentDate.getFullYear())

    var date_to_construct_sunday = '' + myYear.toString() + '-04-01T00:00:00.000000000Z'
    var date_to_get_sunday = new Date(date_to_construct_sunday)
    var what_Weekday_Apr1 = date_to_get_sunday.getDay()
    var DST_startdate_to_substract

    switch(what_Weekday_Apr1){
        case 0:
            DST_startdate_to_substract = -7
            break;
        case 1:
            DST_startdate_to_substract = -1
            break;
        case 2:
            DST_startdate_to_substract = -2
            break;
        case 3:
            DST_startdate_to_substract = -3
            break;
        case 4:
            DST_startdate_to_substract = -4
            break;
        case 5:
            DST_startdate_to_substract = -5
            break;
        case 6:
            DST_startdate_to_substract = -6
            break;

    }

    var time = date_to_get_sunday.getTime()
    dateOffset = (24*60*60*1000)* DST_startdate_to_substract
    dayStartsDst = new Date(time + dateOffset + (60*60*1000))

    var date_to_construct_sunday_2 = '' + myYear.toString() + '-11-01T00:00:00.000000000Z'
    var date_to_get_sunday_2 = new Date(date_to_construct_sunday_2)
    var what_Weekday_Nov1 = date_to_get_sunday_2.getDay()

    var DST_startdate_to_substract

    switch(what_Weekday_Nov1){
        case 0:
            DST_startdate_to_substract = -7
            break;
        case 1:
            DST_startdate_to_substract_2 = -1
            break;
        case 2:
            DST_startdate_to_substract_2 = -2
            break;
        case 3:
            DST_startdate_to_substract_2 = -3
            break;
        case 4:
            DST_startdate_to_substract_2 = -4
            break;
        case 5:
            DST_startdate_to_substract_2 = -5
            break;
        case 6:
            DST_startdate_to_substract_2 = -6
            break;

    }
    var time = date_to_get_sunday_2.getTime()
    dateOffset = (24*60*60*1000)* DST_startdate_to_substract_2
    dayEndsDst = new Date(time + dateOffset + 60*60*1000)


    if (dayStartsDst <= currentDate && currentDate <= dayEndsDst){
        isDst = true
    } else {
        isDst = false
    }

    let offset = isDst ? 2 : 1

    return offset
}

export const checkTimeIsLower = (takeawayTime, plusFifteenMinutes=false) => {

    //let currentDate = new Date('2025-03-30T02:00:00.000000000Z') //ESTO LO DEJO AQUI POR SI QUIERO TESTEAR DST OTRA VEZ
    let currentDate = new Date()

    // let currentDay= String(currentDate.getDate()).padStart(2, '0');
    // let currentMonth = String(currentDate.getMonth()+1).padStart(2,"0");
    // let currentYear = String(currentDate.getFullYear())

    // let hourAndMinutes  = takeawayTimeString.split(':')
    // let timestamp = `${currentYear}-${currentMonth}-${currentDay}T${hourAndMinutes[0]}:${hourAndMinutes[1]}:00.000000000Z`

    var myYear = parseInt(currentDate.getFullYear())

    var date_to_construct_sunday = '' + myYear.toString() + '-04-01T00:00:00.000000000Z'
    var date_to_get_sunday = new Date(date_to_construct_sunday)

    var what_Weekday_Apr1 = date_to_get_sunday.getDay()

    var DST_startdate_to_substract

    switch(what_Weekday_Apr1){
        case 0:
            DST_startdate_to_substract = -7
            break;
        case 1:
            DST_startdate_to_substract = -1
            break;
        case 2:
            DST_startdate_to_substract = -2
            break;
        case 3:
            DST_startdate_to_substract = -3
            break;
        case 4:
            DST_startdate_to_substract = -4
            break;
        case 5:
            DST_startdate_to_substract = -5
            break;
        case 6:
            DST_startdate_to_substract = -6
            break;

    }

    var time = date_to_get_sunday.getTime()

    dateOffset = (24*60*60*1000)* DST_startdate_to_substract

    dayStartsDst = new Date(time + dateOffset + (60*60*1000))


    var date_to_construct_sunday_2 = '' + myYear.toString() + '-11-01T00:00:00.000000000Z'
    var date_to_get_sunday_2 = new Date(date_to_construct_sunday_2)
    var what_Weekday_Nov1 = date_to_get_sunday_2.getDay()

    var DST_startdate_to_substract

    switch(what_Weekday_Nov1){
        case 0:
            DST_startdate_to_substract = -7
            break;
        case 1:
            DST_startdate_to_substract_2 = -1
            break;
        case 2:
            DST_startdate_to_substract_2 = -2
            break;
        case 3:
            DST_startdate_to_substract_2 = -3
            break;
        case 4:
            DST_startdate_to_substract_2 = -4
            break;
        case 5:
            DST_startdate_to_substract_2 = -5
            break;
        case 6:
            DST_startdate_to_substract_2 = -6
            break;

    }

    var time = date_to_get_sunday_2.getTime()

    dateOffset = (24*60*60*1000)* DST_startdate_to_substract_2

    dayEndsDst = new Date(time + dateOffset + 60*60*1000)

    if (dayStartsDst <= currentDate && currentDate <= dayEndsDst){
        isDst = true
    } else {
        isDst = false
    }

    let offset = isDst ? 2 : 1
    var currentDateInSeconds = currentDate.getTime()
    currentDateInSeconds += 60*60*1000*offset

    if (plusFifteenMinutes==true){

        currentDate = new Date(currentDateInSeconds + 15*60*1000)
    } else {
        currentDate = new Date(currentDateInSeconds)
    }

    if (currentDate > new Date(takeawayTime)){
      return true
    } else {
      return false
    }
  }

//COSAS QUE HACER:
//-HAY QUE HACER EN EL BACKEND PARA QUE EN LAS OFERTAS (CUANDO SE CREAN) SE AÑADAN A TODOS LOS USUARIOS QUE DEBERÍAN DE VERLAS
//TAL VEZ HACER QUE QUEDE REGISTRADO CUANDO LA OFERTA INICIAL HA SIDO CANJEADA O NO

//REPASADO Y LIMPIADO