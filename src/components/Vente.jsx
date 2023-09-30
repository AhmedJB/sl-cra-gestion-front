import React, { useState, useEffect, useContext , Fragment} from "react";
import { UserContext } from "../contexts/UserContext";
import { DataContext } from "../contexts/DataContext";
import { isLogged, req, download_file } from "../helper";
import { Redirect } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import styled from 'styled-components';
import Nav from "./Nav";


function Vente(props) {
    const { addToast } = useToasts();
    const [loading, setLoading] = useState(true);
    const [User, setUser] = useContext(UserContext);
    const [Data, setData] = useContext(DataContext);



    useEffect(() => {
        async function test() {
          let resp = await isLogged();
          if (resp) {
    
            let obj = { ...User };
            obj.logged = true;
            obj.username = resp.username;
            obj.email = resp.email;
            setUser(obj);
            return obj;
          }else {
            logout();
          }
        }
    
        test().then((obj) => {
          setLoading(false);
          console.log(obj);
          if (props.location.state) {
            if (props.location.state.success) {
              addToast("connecté en tant que " + obj.username, {
                appearance: "success",
                autoDismiss: true,
              });
            }
          }
          
          
        
        
        
        }
        
        
        );
      }, []);


      const html = (
          <Fragment>
              <Nav />
          </Fragment>
      );



      const loader = (
        <div className="animation-container">
          <div className="lds-facebook">
            <div />
            <div />
            <div />
          </div>
        </div>
      );
    
      return loading ? (
        loader
      ) : User.logged ? (
        html
      ) : (
        <Redirect
          to={{
            pathname: "/app/login",
            state: { error: true, msg: "Please Login" },
          }}
        />
      );

        }

export default Vente;