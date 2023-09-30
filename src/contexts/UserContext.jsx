import React , {useState , useContext , createContext} from 'react';


export const UserContext = createContext();

export const UserProvider = props => {

    let obj = {
        logged : false,
        username : null,
        email : null
    }
    
    const [user,setUser] = useState(obj);

    return <UserContext.Provider value= {[user,setUser]}>{props.children}</UserContext.Provider>

}