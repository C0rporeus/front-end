// alert context y auth context para manejar estados de alertas y autenticacion a continuacion
import { createContext, useContext, useState } from "react";

export function AlertContext() {
    var _useState = useState({}),
        alert = _useState[0],
        setAlert = _useState[1];

    return {
        alert: alert,
        setAlert: setAlert
    };
}

export const AuthContext = createContext({
    user: null,
    setUser: function setUser() { }
});
