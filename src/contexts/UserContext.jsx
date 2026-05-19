import React , {useState , createContext} from 'react';


export const UserContext = createContext();

export const UserProvider = props => {

    let obj = {
        logged : false,
        username : null,
        email : null,
        is_accounting_user: false
    }
    
    const [user,setUser] = useState(obj);

    return <UserContext.Provider value= {[user,setUser]}>{props.children}</UserContext.Provider>

}