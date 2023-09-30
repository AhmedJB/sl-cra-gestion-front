import React, {
  useState,
  useEffect,
  useContext,
  Fragment,
  useRef,
} from "react";
import { UserContext } from "../contexts/UserContext";
import { DataContext } from "../contexts/DataContext";
import { isLogged, req, download_file, logout, postReq } from "../helper";
import { Redirect } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import AnimateNav from "./AnimateNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExclamationCircle,
  faMicrophoneAltSlash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-dropdown-select";
import CustomSelect from "./CustomSelect";
import Modal from "./Modal";
import usePagination from "./hooks/usePagination";
import Pagination from "./Utils/Pagination";

function Supplier(props) {
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(true);
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const [Suppliers, setSuppliers] = useState(Data.Suppliers);
  const [ConfirmOpen, setConfirm] = useState(false);

  const [open, setOpen] = useState(false);
  const [ModiyOpen, setModify] = useState(false);
  const [modifyData, setModifyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    credit: "",
    id: null,
  });

  // for pagination and loading loader
  const [Seperated, active, handleDirection] = usePagination(Suppliers);
  const [fetchLoading, setFetchLoading] = useState(true);

  const initiated = useRef(false);
  useEffect(() => {
    if (initiated.current) {
      setFetchLoading(false);
    } else {
      initiated.current = true;
    }
  }, [Suppliers]);

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
        await updateSuppliers();
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

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  async function updateSuppliers() {
    let supResp = await req("provider");
    let obj2 = { ...Data };
    obj2.Suppliers = supResp;
    setData(obj2);
    setSuppliers(supResp);
    return true;
  }

  async function createSupplier() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let address = document.getElementById("add").value;

    let body = {
      name,
      email,
      phone,
      address,
    };
    let resp = await postReq("provider", body);
    if (resp) {
      updateSuppliers();
      addToast("Succès", {
        appearance: "success",
        autoDismiss: true,
      });
    }
  }

  function formatPrice2(e) {
    let t = e.target;
    if (t.value != "") {
      t.value = t.value.split(" ")[0].replace(",", ".") + " DH";
    }
  }

  function filter(v) {
    var d = [];
    if (v != "") {
      let temp;
      for (let i = 0; i < v.length; i++) {
        temp = Data.Suppliers.filter((e) => e.id == v[i].id);
        for (let i = 0; i < temp.length; i++) {
          console.log(temp);
          d.push(temp[i]);
        }
      }
    } else {
      d = Data.Suppliers;
    }
    console.log(d);
    setSuppliers(d);
  }

  async function del(id) {
    let resp = await req("modprovider/" + String(id));
    let fourn = Data.Suppliers.filter((e) => e.id == id)[0];
    if (resp) {
      addToast("Fournisseur " + fourn.name + " a ete supprime", {
        appearance: "success",
        autoDismiss: true,
      });
      updateSuppliers();
      setConfirm(!ConfirmOpen);
    }
  }

  async function modify(id) {
    setModify(!ModiyOpen);
    let mod = Suppliers.filter((e) => e.id == id)[0];
    console.log(mod);
    setModifyData(mod);
    //let resp = await modifySupplier(id);
  }

  async function delData(id) {
    let mod = Suppliers.filter((e) => e.id == id)[0];
    console.log(mod);
    setModifyData(mod);
    setConfirm(!ConfirmOpen);
  }

  async function modifySupplier(id) {
    let name = document.getElementById("name_m").value;
    let email = document.getElementById("email_m").value;
    let phone = document.getElementById("phone_m").value;
    let address = document.getElementById("add_m").value;
    let credit = document.getElementById("credit_m").value.split(" ")[0];
    let creditp = document.getElementById("credit_pm").value.split(" ")[0];

    let body = {
      name,
      email,
      phone,
      address,
      credit,
      creditp,
    };
    let resp = await postReq("modprovider/" + String(id), body);
    if (resp) {
      addToast("Succès", {
        appearance: "success",
        autoDismiss: true,
      });
      updateSuppliers();
    } else {
      addToast("Erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }

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
              <th classname="task-title">Email</th>
              <th classname="status">Tel</th>
              <th className="address">Address</th>
              <th>Dette</th>
              <th classname="tel">Date</th>
              <th></th>
              <th></th>
            </tr>

            {Seperated[active] &&
              Seperated[active].map((e) => {
                return (
                  <tr>
                    <td className="date">{e.name}</td>
                    <td className="task-title">{e.email}</td>
                    <td className="status">{e.phone}</td>
                    <td className="address">{e.address}</td>
                    <td className="credit">{e.credit + " DH"}</td>
                    <td className="date">
                      {new Date(e.date).toLocaleDateString("fr-FR", options)}
                    </td>
                    <td className="edit" onClick={() => modify(e.id)}>
                      <FontAwesomeIcon icon={faEdit} className="trash" />
                    </td>
                    <td
                      onClick={() => {
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

  const loader = (
    <div className="animation-container">
      <div className="lds-facebook">
        <div />
        <div />
        <div />
      </div>
    </div>
  );

  const html = (
    <Fragment>
      <Modal open={ConfirmOpen} closeFunction={setConfirm}>
        <h1 className="title-modal m20">
          {"Voulez-vous supprimer le fournisseur " + modifyData.name + " ?"}
        </h1>
        <div className="modal-input-row">
          <button
            onClick={() => {
              del(modifyData.id);
              //delData(e.product.p_id);
            }}
            className="factsubmit"
            id="submit"
          >
            Supprimer
          </button>
        </div>
      </Modal>
      <Modal open={ModiyOpen} closeFunction={setModify}>
        <h1 className="title-modal">Ajout de fournisseur</h1>
        <div className="modal-input">
          <label for="name">Nom</label>
          <input type="text" defaultValue={modifyData.name} id="name_m"></input>
          <label for="email">Email</label>
          <input
            type="text"
            defaultValue={modifyData.email}
            id="email_m"
          ></input>
          <label for="phone">Tel</label>
          <input
            type="text"
            defaultValue={modifyData.phone}
            id="phone_m"
          ></input>
          <label for="add">Address</label>
          <input
            type="text"
            defaultValue={modifyData.address}
            id="add_m"
          ></input>
          <label for="add">Dette</label>
          <input
            type="text"
            defaultValue={modifyData.credit + " DH"}
            onBlur={formatPrice2}
            id="credit_m"
          ></input>
          <label for="add">Dette Paye</label>
          <input
            type="text"
            defaultValue={"0 DH"}
            onBlur={formatPrice2}
            id="credit_pm"
          ></input>

          <button id="submit" onClick={() => modifySupplier(modifyData.id)}>
            Modifier
          </button>
        </div>
      </Modal>
      <Modal open={open} closeFunction={setOpen}>
        <h1 className="title-modal">Modification de fournisseur</h1>
        <div className="modal-input">
          <label for="name">Nom</label>
          <input type="text" id="name"></input>
          <label for="email">Email</label>
          <input type="text" id="email"></input>
          <label for="phone">Tel</label>
          <input type="text" id="phone"></input>
          <label for="add">Address</label>
          <input type="text" id="add"></input>

          <button id="submit" onClick={createSupplier}>
            Creer
          </button>
        </div>
      </Modal>
      <AnimateNav />
      <section className="card Supplier">
        <h1 className="card-title text-center">Fournisseur</h1>

        {fetchLoading ? (
          <div className="section-loader-container">{loader}</div>
        ) : (
          <>
            <div className="filtre-row seperate">
              {/* <select id="fourn-select">
                  <option value="0">Tout</option>
                  <option value="Test">Jhon</option>
              </select> */}

              <CustomSelect
                options={Data.Suppliers}
                changeFunc={filter}
                label="name"
                multi={true}
                fvalue="id"
                placeholder="Choisir un Fournisseur"
              />
              <button
                class="btn-main"
                onClick={() => {
                  setOpen(!open);
                }}
              >
                Ajouter un Fournisseur
              </button>
            </div>

            {Suppliers.length == 0 ? NotFound : DataTable}
            <Pagination
              data={Suppliers}
              seperated={Seperated}
              handleDirection={handleDirection}
              active={active}
            />
          </>
        )}

        {/* Data.tasks.map((e) => {
              return (
                <li className="row">
                  <span className="date">{e.date}</span>
                  <span className="task-title">{e.title}</span>
                  <span className="status">{e.status}</span>
                  <button
                    className={e.status != "done" ? "disabled" : "download"}
                    value={e.status != "done" ? "" : e.id}
                    onClick={e.status != "done" ? "" : download}
                    name={e.status != "done" ? "" : e.path}
                    disabled={e.status != "done" ? true : false}
                  >
                    Download
                  </button>
                </li>
              );
            }) */}
      </section>
    </Fragment>
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

export default Supplier;
