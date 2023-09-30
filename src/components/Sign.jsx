import React, { useEffect, useContext, useState } from "react";
import { Redirect } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import { UserContext } from '../contexts/UserContext';
import { isLogged, get_token, register } from "../helper";

function Sign(props) {


  const { addToast } = useToasts()
  const [User, setUser] = useContext(UserContext);
  const [loading, setLoading] = useState(true);


  useEffect(
    () => {
      async function test() {
        let resp = await isLogged();
        if (resp) {
          let obj = { ...User };
          obj.logged = true;
          obj.username = resp.username;
          obj.email = resp.email;
          setUser(obj);
        }
        setLoading(false);


      }
      test();



      if (props.location.state) {
        if (props.location.state.error) {
          addToast(props.location.state.msg, {
            appearance: 'error',
            autoDismiss: true,
          })
        }
      }
    }

    , [])



  async function Login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let resp = await get_token(username, password);
    if (resp) {
      let obj = { ...User };
      obj.logged = true;
      obj.username = resp.username;
      obj.email = resp.email;
      setUser(obj);
    } else {
      addToast("Failed to Login", {
        appearance: 'error',
        autoDismiss: true,
      })

    }
  }


  async function Register() {
    let username = document.getElementById('regusername').value;
    let password = document.getElementById('regpassword').value;
    let email = document.getElementById('regemail').value;
    let resp = await register(username, email, password);
    if (resp) {
      let obj = { ...User };
      obj.logged = true;
      obj.username = resp.username;
      obj.email = resp.email;
      setUser(obj);
    } else {
      addToast("Failed to Register", {
        appearance: 'error',
        autoDismiss: true,
      })

    }
  }




  const html = (
    <div id="lr">
      {" "}
      <main id="login-register">
        <section id="login-box">
          <div className="tabs">
            <Link to='/app/login'><span className={props.login ? "tab active" : "tab"}>Login</span></Link>
            <Link to='/app/register'><span className={props.login ? "tab" : "tab active"}>Register</span></Link>
          </div>
          <div id="login" className={props.login ? "form" : "form hide"}>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="field"
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="field"
            />
            <button id="submit" onClick={Login} >Submit</button>
          </div>
          <div id="register" className={props.login ? "form hide" : "form"}>
            <input
              type="text"
              id="regusername"
              placeholder="Username"
              className="field"
            />
            <input
              type="email"
              id="regemail"
              placeholder="Email"
              className="field"
            />
            <input
              type="password"
              id="regpassword"
              placeholder="Password"
              className="field"
            />
            <button id="submit" onClick={Register}>Submit</button>
          </div>

        </section>
      </main>
    </div>
  );

  const loader = (
    <div className='animation-container'><div className="lds-facebook"><div /><div /><div /></div>
    </div>

  );

  return (loading ? loader : (User.logged ? <Redirect
    to={{
      pathname: "/app/pannel",
      state: { success: true }
    }}
  /> : html));
}

export default Sign;
