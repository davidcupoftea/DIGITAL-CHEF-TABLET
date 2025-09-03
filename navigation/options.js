import { Ionicons } from "@expo/vector-icons"

export const navOptions = (nav) => {
    return {
        headerTintColor: 'white',
        headerStyle: {
            backgroundColor: 'rgb(107,106,106)'
        },
        headerRight: () =>(
            <Ionicons
            name="menu"
            size={45}
            color="white"
            onPress={()=>nav.toggleDrawer()}
            />
        ),
        headerTitleAlign: "center",
}
}

//REPASADO Y LIMPIO
