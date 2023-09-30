import React, { useState, useEffect, useContext, Fragment } from "react";
import { UserContext } from "../contexts/UserContext";
import { DataContext } from "../contexts/DataContext";
import { isLogged, req, download_file, logout, postReq } from "../helper";
import { Redirect } from "react-router-dom";
import AnimateNav from "./AnimateNav";
import { useToasts } from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { createTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import {
  faEdit,
  faExclamationCircle,
  faMicrophoneAltSlash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";
import CustomSelect from "./CustomSelect";

function Echeance(props) {
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(true);
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);

  const [startDate, handleDateChange] = useState(new Date());
  const [endDate, handleEndChange] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  );

  const [selectedDate,setSelectedDate] = useState(new Date());

  const [Echeance, setEcheance] = useState([]);

  const [Open, setOpen] = useState(false);


  const [Options, setOptions] = useState([
    {
      name: "Client",
      value: 0,
    },
    {
      name: "Fournisseur",
      value: 1,
    },
  ]);

  const [SelectedOption,setSelectedOption] = useState(0);
  const [SelectedName, setSelectedName] = useState(null);
  const [ConfirmOpen,setConfirm] = useState(false);
  const [modifyOpen,setModify] = useState(false);

  const [modifyData, setmodifyData] = useState({
    id : null,
    total : 0,
    paid : 0,
    dateEcheance: null,
  });

  function loadModify(id){
    for (let i = 0 ; i < Echeance.length ; i++){
      if(Echeance[i].id == id){
        let c = Echeance[i]
        let b = {
          id : c.id,
          total : c.total,
          paid : c.paid,
          dateEcheance : new Date(c.dateEcheance)
        }
        setmodifyData(b);
        break;
      }
    }
    setModify(!modifyOpen);
  }

  function delData(id){
    console.log(id);
    for (let i = 0 ; i < Echeance.length ; i++){
      if(Echeance[i].id == id){
        let c = Echeance[i]
        let b = {
          name : c.name,
          id : c.id,
          total : c.total,
          paid : c.paid,
          dateEcheance : new Date(c.dateEcheance)
        }
        setmodifyData(b);
        break;
      }
    }
    setConfirm(!ConfirmOpen)
  }

  async function del(id) {
    let resp = await postReq("delecheance/" + id,{});
    let p = Echeance.filter((e) => e.id == id)[0];
    if (resp) {
      addToast("Echeance de " + p.name + " a ete supprime", {
        appearance: "success",
        autoDismiss: true,
      });
      updateEch();
      setConfirm(!ConfirmOpen);
    }
  }

  function handleDateModify(d){
    console.log(d);
    let c = {...modifyData}
    c.dateEcheance = d;
    setmodifyData(c);
  }

  function handleField(e){
    let t = e.target;
    let key = t.id;
    let v = t.value;
    let c = {...modifyData}
    c[key] = v;
    setmodifyData(c);
  }

  async function modify(id){
    let resp = await postReq('modecheance/'+id,modifyData);
    if (resp){
      addToast("Succès", {
        appearance: "success",
        autoDismiss: true,
      });
      updateEch();
    }else{
      addToast("Erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }

  }

  const materialTheme = createTheme({
    overrides: {
      MuiPickersToolbar: {
        toolbar: {
          backgroundColor: "#282828",
        },
      },
      MuiPickersCalendarHeader: {
        switchHeader: {
          /* backgroundColor: "#000",
          color: "white", */
        },
      },
      MuiPickersDay: {
        day: {
          color: "#000",
        },
        daySelected: {
          backgroundColor: "#b187ff",
          "&:hover": {
            background: "##5900ff",
          },
        },
        dayDisabled: {
          color: "#ff0000",
        },
        current: {
          color: "#b187ff",
          "&:hover": {
            background: "##5900ff",
          },
        },
      },
      MuiPickersModal: {
        dialogAction: {
          color: "#000",
        },
      },
    },
  });

  useEffect(() => {
    async function test() {
      let resp = await isLogged();
      console.log(resp);
      if (resp) {
        let obj = { ...User };
        obj.logged = true;
        obj.username = resp.username;
        obj.email = resp.email;
        setUser(obj);
        let resp2 = await updateEch();
        await updateUsers();
        /* if (resp2){
          for ( let i = 0 ; i < resp.length ; i++){
            let de = new Date()
          }
        } */
        return obj;
      } else {
        logout(setUser, User);
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
    });
  }, []);

  async function updateUsers(){
    let supResp = await  req('client');
    let supResp2 = await req('provider')
    let obj2 = {...Data};
    obj2.Clients = supResp;
    obj2.Suppliers = supResp2;
    setData(obj2);
  }

  function changeStart(date) {
    console.log(date);
    handleDateChange(date);
    updateEch(date, null);
  }

  function changeEnd(date) {
    console.log(date);
    handleEndChange(date);
    updateEch(null, date);
  }

  async function updateEch(startdate = null, enddate = null) {
    if (!startdate) {
      startdate = startDate;
    }

    if (!enddate) {
      enddate = endDate;
    }

    let body = {
      startdate,
      enddate,
    };
    let resp = await postReq("echeancesfilter", body);
    if (resp) {
      setEcheance(resp);
      return resp;
    }
  }

  function handleOption(v){
    setSelectedOption(v[0].value);
  }

  function handleUser(v){
    if(v.length > 0){
      setSelectedName(v[0].name);
    }else{
      setSelectedName(null);
    }
    
  }

  function formatPrice(e) {
    let t = e.target;

    t.value = t.value.split(" ")[0].replace(",", ".") + " DH";
  }

  async function createEcheance() {
    
    let total = document.getElementById('total').value.split(' ')[0];
    let paid = document.getElementById('paid').value.split(' ')[0];
    let body = {
      name: SelectedName,
      total,
      paid,
      dateEcheance : selectedDate,
      type : SelectedOption
    }

    console.log(body);
    let resp = await postReq('createecheance',body);
    if (resp){
      addToast("Succès", {
        appearance: "success",
        autoDismiss: true,
      });
      updateEch();
    }else{
      addToast("Erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }

  }

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const NotFound = (
    <div className="not-found">
      <h2 className="error-text">Resultat : 0</h2>
      <FontAwesomeIcon icon={faExclamationCircle} className="error-circle" />
    </div>
  );

  const DataTable = (
    <Fragment>
      <div id="table-wrapper">
      <table id="status-table">
        <tbody>
          <tr>
            <th className="date">Nom</th>
            <th>Montant Total</th>
            <th>Montant Paye</th>
            <th>Montant Restant</th>
            <th classname="task-title">Date d'echeance</th>
            <th></th>
            <th></th>
          </tr>

          {Echeance.map((e) => {
            return (
              <tr>
                <td className="date">{e.name}</td>
                <td>{e.total + " DH"}</td>
                <td>{e.paid + " DH"}</td>
                <td>{e.reste + " DH"}</td>
                <td className="task-title">
                  {new Date(e.dateEcheance).toLocaleDateString(
                    "fr-FR",
                    options
                  )}
                </td>
                <td className="edit" onClick={() => { loadModify(e.id)}/*modify(e.product.p_id)*/}>
                  <FontAwesomeIcon icon={faEdit} className="trash" />
                </td>
                <td
                  onClick={() => {
                    //del(e.product.p_id);
                    delData(e.id);
                  }}
                  className="delete"
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="trash" />
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </Fragment>
  );

  const html = (
    <Fragment>
      <Modal open={ConfirmOpen} closeFunction={setConfirm}>
        <h1 className="title-modal m20">{"Voulez-vous supprimer l'echeance de "+modifyData.name +" ?"}</h1>
        <div className='modal-input-row'>
        <button onClick={() => {
                    del(modifyData.id);
                    //delData(e.product.p_id);
                  }} className="factsubmit" id="submit">Supprimer</button>
        </div>
      </Modal>
      <Modal open={modifyOpen} closeFunction={setModify}>
        <h1 className="title-modal">Modification d'echeance</h1>
        <div className="modal-input">
<ThemeProvider theme={materialTheme}>
                <DatePicker
                  variant="inline"
                  label=""
                  value={modifyData.dateEcheance}
                  onChange={handleDateModify}
                />
              </ThemeProvider>
          <div className="input-wrapper">
            <label for="vente">Montant Total</label>
            <input
              type="text"
              placeholder="0 DH"
              onChange={handleField}
              defaultValue = {modifyData.total +" DH"}
              onBlur={formatPrice}
              id="total"
            ></input>
          </div>
          <div className="input-wrapper">
            <label for="vente">Montant Payé</label>
            <input
              type="text"
              placeholder="0 DH"
              onChange={handleField}
              defaultValue = {modifyData.paid +" DH"}
              onBlur={formatPrice}
              id="paid"
            ></input>
          </div>
          

          <button id="submit" onClick={() => {modify(modifyData.id)} }>
            Modifier
          </button>
        </div>
      </Modal>
      <Modal open={Open} closeFunction={setOpen}>
        <h1 className="title-modal">Ajout d'echeance</h1>
        <div className="modal-input">
        
          <CustomSelect
              options={Options}
              changeFunc={handleOption}
              label="name"
              fvalue="value"
              clearable={false}
              values={[
                Options.find((opt) => opt.value == SelectedOption ),
              ]}
              placeholder="Client / Fournisseur"
            />

<CustomSelect
              options={SelectedOption == 0 ? Data.Clients : Data.Suppliers}
              changeFunc={handleUser}
              label="name"
              fvalue="value"
              /* values={[
                Options.find((opt) => opt.value == ),
              ]} */
              placeholder= {SelectedOption == 0 ? "Choisir un Client" : "Choisir un Fournisseur"} 
            />

<ThemeProvider theme={materialTheme}>
                <DatePicker
                  variant="inline"
                  label=""
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </ThemeProvider>
          <div className="input-wrapper">
            <label for="vente">Montant Total</label>
            <input
              type="text"
              placeholder="0 DH"
              onBlur={formatPrice}
              id="total"
            ></input>
          </div>
          <div className="input-wrapper">
            <label for="vente">Montant Payé</label>
            <input
              type="text"
              placeholder="0 DH"
              onBlur={formatPrice}
              id="paid"
            ></input>
          </div>
          

          <button id="submit" onClick={createEcheance}>
            Creer
          </button>
        </div>
      </Modal>

      <AnimateNav />
      <section className="card Supplier">
        <h1 className="card-title text-center">Echeance</h1>
        <div className="filtre-row seperate">
          <div className="filtre-group">
            <div className="date-container">
              <ThemeProvider theme={materialTheme}>
                <DatePicker
                  variant="inline"
                  label="Date Debut"
                  value={startDate}
                  onChange={changeStart}
                />
              </ThemeProvider>
            </div>
            <div className="date-container">
              <ThemeProvider theme={materialTheme}>
                <DatePicker
                  variant="inline"
                  label="Date Fin"
                  value={endDate}
                  onChange={changeEnd}
                />
              </ThemeProvider>
            </div>
          </div>
          <button
            class="btn-main"
            onClick={() => {
              setOpen(!Open);
            }}
          >
            Ajouter une Echeance
          </button>
        </div>

        {Echeance.length == 0 ? NotFound : DataTable}
      </section>
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

export default Echeance;
