import React, {
  useState,
  useEffect,
  useContext,
  Fragment,
  useRef,
} from "react";
import { UserContext } from "../contexts/UserContext";
import { DataContext } from "../contexts/DataContext";
import {
  isLogged,
  req,
  req_body,
  download_file,
  logout,
  postReq,
} from "../helper";
import { Redirect } from "react-router-dom";
import AnimateNav from "./AnimateNav";
import { useToasts } from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExclamationCircle,
  faMicrophoneAltSlash,
  faTrashAlt,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  DatePicker,
  DateTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { createTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { Preview, print } from "react-html2pdf";
import Modal from "./Modal";
import "../static/frontend/invoice.css";
import CustomSelect from "./CustomSelect";
import { makePDF } from "multi-page-html2pdf";
import usePagination from "./hooks/usePagination";
import Pagination from "./Utils/Pagination";
import AdditionRow from "./Utils/AdditionRow";
import Logo1 from "../static/pics/LOGO-1.png";
import Logo2 from "../static/pics/LOGOa.png";

function HistoryV(props) {
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(true);
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const [startDate, handleDateChange] = useState(
    new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
  );
  const [endDate, handleEndChange] = useState(new Date());
  const [Details, setDetails] = useState({
    o_id: null,
    mode: null,
    paid: 0,
    details: [],
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [Open, setOpen] = useState(false);
  const [Orders, setOrders] = useState([]);
  const [BackUpOrders, setBackUpOrders] = useState([]);
  const [SelectedOrder, setSelectedOrder] = useState({
    order: {},
    details: [
      {
        client: {},
        details: [],
      },
    ],
  });

  const [DeletedOrder, setDeleted] = useState({
    client: {},
    order: {},
    details: [],
  });
  const [PaymentOptions, setPaymentOptins] = useState([
    {
      name: "cash",
      id: 0,
    },
    {
      name: "cheque",
      id: 1,
    },
    {
      name: "effet",
      id: 2,
    },
    {
      name: "versement",
      id: 3,
    },
  ]);

  const [transportOptions, setTransportOptions] = useState([
    {
      name: "CTM",
      id: 0,
    },
    {
      name: "Amana",
      id: 1,
    },
  ]);

  const [openTransport, setOpenTransport] = useState(false);

  const [filteredClient, setFilteredClient] = useState(null);
  const [filteredID, setFilteredID] = useState(null);

  // my new states

  const [Seperated, active, handleDirection] = usePagination(Orders);
  const [fetchLoading, setFetchLoading] = useState(true);

  // addition states
  const [products, setProducts] = useState([]);
  const [addedRows, setAddedRows] = useState([]);
  const [chosenOrderID, setChosenOrderID] = useState(null);

  const updateTransport = async () => {
    let resp = await req("transport/");
    if (resp) {
      setTransportOptions(resp);
    }
  };

  // effect for  the callback loader
  const initiated = useRef(false);
  useEffect(() => {
    if (initiated.current) {
      /*console.log("############### Fitered states #################")
      console.log(filteredClient)
      console.log(filteredID)
      console.log("#####################################")
      if (filteredClient && filteredClient !=  '' && false){
        filter(filteredClient)
      }
      if (filteredID && filteredID != '' && false) {
        filterID(filteredID);
      }*/
      setFetchLoading(false);
    } else {
      initiated.current = true;
    }
  }, [Orders]);

  useEffect(() => {
    if (chosenOrderID) {
      setOrderDetails(chosenOrderID);
    }
  }, [Orders]);

  // from here functions

  function getOption(id) {
    for (let i = 0; i < PaymentOptions.length; i++) {
      if (PaymentOptions[i].id == id) {
        return PaymentOptions[i].name;
      }
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

  const getProducts = async () => {
    let Prods = await req("product");
    setProducts(Prods);
  };

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
        await updateClients();
        await updateOrders();
        await getProducts();
        await updateTransport();
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

  async function updateClients() {
    let supResp = await req("client");
    let obj2 = { ...Data };
    obj2.Clients = supResp;
    setData(obj2);
    //setClients(supResp);
    return true;
  }

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };

  const NotFound = (
    <div className="not-found">
      <h2 className="error-text">Resultat : 0</h2>
      <FontAwesomeIcon icon={faExclamationCircle} className="error-circle" />
    </div>
  );

  function changeStart(date) {
    console.log(date);
    handleDateChange(date);
    updateOrders(date, null);
  }

  function changeEnd(date) {
    console.log(date);
    handleEndChange(date);
    updateOrders(null, date);
  }

  async function updateOrders(
    startdate = null,
    enddate = null,
    newc = null,
    newid = null
  ) {
    let clientFilt = newc === "" ? newc : filteredClient;
    let idFilt = newid === "" ? newid : filteredID;
    setFetchLoading(true);
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
    let resp = await postReq("filterorder", body);
    if (resp) {
      console.log("############### Fitered states #################");
      console.log(newc);
      console.log(newid);
      console.log("#####################################");
      let temp = resp;
      if (clientFilt && clientFilt != "") {
        temp = await filter(clientFilt, true);
      }
      if (idFilt && idFilt != "") {
        temp = await filterID(idFilt, true);
      }
      console.log(resp);
      console.log(temp);
      setOrders(temp);
      setBackUpOrders(resp);
    }
  }

  async function filter(v, fromUpdate = false) {
    var d = [];
    if (v && v != "") {
      let temp;
      for (let i = 0; i < v.length; i++) {
        temp = BackUpOrders.filter((e) => e.client.id == v[i].id);
        for (let i = 0; i < temp.length; i++) {
          //console.log(temp);
          d.push(temp[i]);
        }
      }
      console.log(d);
      if (fromUpdate) {
        return d;
      }
      if (v != filteredClient) {
        setFilteredClient(v);
        setOrders(d);
      }
    } else {
      setFilteredClient(null);
      await updateOrders(null, null, "", null);
    }
  }

  async function download(e) {
    let resp = await download_file(
      "download/" + String(e.f_id),
      e.f_id + ".pdf"
    );
    if (resp) {
      addToast("Facture " + String(e.f_id) + " a ete telecharge", {
        appearance: "success",
        autoDismiss: true,
      });
    } else {
      addToast("erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }

  function getOrder(id) {
    for (let i = 0; i < Orders.length; i++) {
      if (Orders[i].order.id == id) {
        return Orders[i];
      }
    }
  }

  function downloadFact() {
    let options = {
      margin: 1,
      fileName: SelectedOrder.order.o_id,
    };
    //print(SelectedOrder.order.o_id, 'jsx-template-2')
    makePDF("jsx-template", options);

    //print(SelectedOrder.order.o_id, 'jsx-template')
  }

  function downloadBon() {
    let options = {
      margin: 1,
      fileName: SelectedOrder.order.o_id,
    };
    //print(SelectedOrder.order.o_id, 'jsx-template-2')
    makePDF("jsx-template-2", options);
  }

  function updateData(id) {
    let order = getOrder(id);
    let temp = [];
    let res = {
      order: order.order,
      details: [],
    };
    console.log(order);
    for (let i = 0; i < order.details.length; i++) {
      if (i % 10 == 0 && i != 0) {
        res.details.push({
          client: order.client,
          details: temp,
        });
        temp = [];
      }
      temp.push(order.details[i]);
    }
    if (temp.length > 0) {
      res.details.push({
        client: order.client,
        details: temp,
      });
      temp = [];
    }
    console.log(res);
    setSelectedOrder(res);
  }

  function clearData() {
    setSelectedOrder({
      order: {},
      details: [
        {
          client: {},
          details: [],
        },
      ],
    });
  }

  function setOrderDetails(id) {
    if (id !== chosenOrderID) {
      setChosenOrderID(id);
    }
    let order = getOrder(id);
    console.log(order);
    if (order) {
      let b = {
        o_id: order.order.o_id,
        mode: order.order.mode,
        transport: order.order.transport,
        paid: order.order.paid,
        details: order.details,
      };
      let d = {
        client: order.client,
        order: {
          o_id: order.order.o_id,
          total: 0,
          ret: 0,
          date: order.order.date,
        },
        details: [],
      };
      setDetails(b);
      setDeleted(d);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  function handlePaiement(v) {
    console.log(v);
    let c = { ...Details };
    c.mode = v[0].id;
    setDetails(c);
  }
  function handleTransport(v) {
    console.log(v);
    let c = { ...Details };
    c.transport = v[0].name;
    setDetails(c);
  }

  function getDet(id) {
    console.log(id);
    for (let i = 0; i < Details.details.length; i++) {
      console.log(Details.details[i].id == Number(id));
      if (Details.details[i].id == Number(id)) {
        return i;
      }
    }
    return -1;
  }

  function modifyDetails(e, id) {
    let t = e.target;
    let key = t.name;
    let v = t.value;
    let index = getDet(id);
    if (index != -1) {
      let c = { ...Details };
      c.details[index][key] = Number(v);
      console.log(c);
      setDetails(c);
    }
  }

  function handlePaid(e) {
    let t = e.target;
    let c = { ...Details };
    c.paid = Number(t.value);
    setDetails(c);
  }

  function handleret(e) {
    let t = e.target;
    let c = { ...DeletedOrder };
    c.order.ret = Number(t.value);
    setDeleted(c);
  }

  function formatPrice(e) {
    let t = e.target;
    let val = "";
    if (t.value == "") {
      val = t.attributes.datavalue.value;
    } else {
      val = t.value;
    }
    t.value = val.split(" ")[0].replace(",", ".") + " DH";
  }

  function clearField(e) {
    let t = e.target;
    t.value = "";
  }

  function formatField(e) {
    let t = e.target;

    let val = "";
    if (t.value == "") {
      val = t.attributes.datavalue.value;
    } else {
      val = t.value;
    }

    t.value = val;
  }

  function delOrderProduct(id) {
    let deleted = { ...DeletedOrder };
    let Selected_copy = { ...Details };
    let index = getDet(id);
    let elem = Selected_copy.details.splice(index, 1)[0];
    console.log(elem);
    deleted.details.push(elem);
    deleted.order.total += Number(elem.quantity) * Number(elem.prix);
    deleted.order.ret += Number(elem.quantity) * Number(elem.prix);
    console.log(deleted.order);
    setDeleted(deleted);
    setDetails(Selected_copy);
  }

  async function updateOrder() {
    setLoadingSubmit(true);
    let body = {
      details: Details,
      deleted: DeletedOrder.details,
      ret: DeletedOrder.order.ret,
      date: DeletedOrder.order.date,
    };

    let resp = await postReq("modorder", body);
    if (resp) {
      if (DeletedOrder.details.length > 0) {
        let options = {
          margin: 1,
          fileName: SelectedOrder.order.o_id,
        };
        //print(DeletedOrder.order.o_id,'jsx-template-3')
        makePDF("jsx-template-3", options);
      }

      addToast("Succès", {
        appearance: "success",
        autoDismiss: true,
      });
      if (resp.error) {
        addToast(resp.msg, {
          appearance: "warning",
          autoDismiss: true,
        });
      }
      setDeleted({
        client: {},
        order: {},
        details: [],
      });
      updateOrders();
      setOpen(false);
    } else {
      addToast("Erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setLoadingSubmit(false);
  }

  async function handleClose(arg) {
    setDeleted({
      client: {},
      order: {},
      details: [],
    });
    //await updateOrders();
    setChosenOrderID(null);
    setAddedRows([]);
    setOpen(arg);
  }

  function getSubOrder(l) {
    let res = [];
    for (let i = 0; i < l.length; i++) {
      res.push(l[i].order);
    }
    console.log(res);
    return res;
  }

  async function filterID(v, fromUpdate = false) {
    var d = [];
    if (v && v != "") {
      let temp;
      for (let i = 0; i < v.length; i++) {
        temp = BackUpOrders.filter((e) => e.order.id == v[i].id);
        for (let i = 0; i < temp.length; i++) {
          //console.log(temp);
          d.push(temp[i]);
        }
      }
      console.log(d);
      if (fromUpdate) {
        return d;
      }
      if (v != filterID) {
        setFilteredID(v);
        setOrders(d);
      }
    } else {
      setFilteredID(null);
      await updateOrders(null, null, null, "");
    }
  }

  function round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const handleAdditionRow = () => {
    let temp = {
      id: null,
      productName: null,
      prix: null,
    };

    setAddedRows([...addedRows, temp]);
  };

  const openOption = () => {
    setOpenTransport(true);
  };

  const closeOptions = () => {
    setOpenTransport(false);
  };

  const createTransport = async () => {
    let name = document.getElementById("optionName").value;
    let body = {
      name,
    };
    let resp = await postReq("transport/", body);
    if (resp) {
      await updateTransport();
      addToast("Success", {
        appearance: "success",
        autoDismiss: true,
      });
      closeOptions();
    } else {
      addToast("Failed", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const bon = SelectedOrder.details.map((order, i) => {
    return (
      <div
        key={SelectedOrder.order.o_id}
        id="invoice"
        className="page"
        size="A4"
      >
        <div className="top-padding">
          <section className="top-content bb d-flex justify-content-between">
            <div className="logo-facture">
              <img src={Logo1} alt className="img-fluid" />
            </div>
            <img id="watermark" src={Logo2} />
            {/* <div className="top-left">
        <div className="graphic-path">
          <p id="bon-title">Bon De livraison</p>
        </div>
      </div> */}
          </section>
          <section className="store-user mt-5">
            <div className="col-12 center-elem">
              <p>
                Bon De livraison N<sup>°</sup>:{" "}
                <span>#{SelectedOrder.order.o_id}</span>
              </p>
            </div>
            <div className="col-10">
              <div className="row-custom pb-3">
                <div>
                  <p>Client,</p>
                  <h2 id="client">{order.client.name}</h2>
                </div>
                <div>
                  <p>Le,</p>
                  <h2>
                    {new Date(SelectedOrder.order.date).getUTCDate() +
                      "-" +
                      (new Date(SelectedOrder.order.date).getUTCMonth() + 1) +
                      "-" +
                      new Date(SelectedOrder.order.date).getUTCFullYear()}
                  </h2>
                </div>
              </div>
            </div>
          </section>
          <section className="product-area mt-4">
            <table id="fact-table" className="table table-hover">
              <thead>
                <tr>
                  <td>Quantite</td>
                  <td>Designation</td>
                  <td>P.U</td>
                  <td>Total</td>
                </tr>
              </thead>
              <tbody>
                {order.details.map((e) => {
                  return (
                    <tr>
                      <td>{e.quantity}</td>
                      <td>
                        <div className="media">
                          <div className="media-body">
                            <p className="mt-0 title">{e.product_name}</p>
                          </div>
                        </div>
                      </td>
                      <td>{e.prix}DH</td>
                      <td>{e.prix * e.quantity}DH</td>
                    </tr>
                  );
                })}
              </tbody>
              {(() => {
                if (i + 1 == SelectedOrder.details.length) {
                  return (
                    <tfoot>
                      <tr>
                        <td />
                        <td />
                        <td className="bord">Total HT:</td>
                        <td className="bord">
                          {round(SelectedOrder.order.total)}DH
                        </td>
                      </tr>
                    </tfoot>
                  );
                }
              })()}
            </table>
          </section>
          <section className="balance-info">
            <div className="">
              <div className="col-8">
                <p className="m-0 font-weight-bold note">
                  {" "}
                  Note:{" "}
                  <span>
                    Reconnaît avoir recu conforme à la livraison ci-dessus
                  </span>{" "}
                </p>
                <p />
              </div>
            </div>
          </section>
          {/* Cart BG */}
          {/*  <img src="/static/pics/cart.jpg" className="img-fluid cart-bg" alt /> */}
          <footer id="footer-facture">
            <hr />
            <p className="m-0 text-center  colortext">
              10 Lot Baraka Wiam Bensouda Mag 3 ‐ Fès / GSM: 06 61 08 56 62
            </p>
            <br />
            <span className="email">
              <span>Email: najate.radiateur@yahoo.fr</span>
            </span>
            <br />
            <div className="social">
              <span className="pr-2">
                <span>TP: 13439808</span>
              </span>
              <span className="pr-2">
                <span>IF: 15163065</span>
              </span>
              <span className="pr-2">
                <span>RC: 43697</span>
              </span>
              <span className="pr-2">
                <span>CNSS: 9961659</span>
              </span>
              <span className="pr-2">
                <span>ICE: 000010730000029</span>
              </span>
            </div>
          </footer>
        </div>
      </div>
    );
  });

  const fac_avoir = (
    <div id="invoice" className="page" size="A4">
      <div className="top-padding">
        <section className="top-content bb d-flex justify-content-between">
          <div className="logo-facture">
            <img src={Logo1} alt className="img-fluid" />
          </div>
          <img id="watermark" src={Logo2} />
          {/* <div className="top-left">
        <div className="graphic-path">
          <p>Facture</p>
        </div>
      </div> */}
        </section>
        <section className="store-user mt-5">
          <div className="col-12 center-elem">
            <p>
              Facture d'avoir N<sup>°</sup>:{" "}
              <span>#{DeletedOrder.order.o_id}</span>
            </p>
          </div>
          <div className="col-10">
            <div className="row-custom pb-3">
              <div>
                <p>Client,</p>
                <h2 id="client">{DeletedOrder.client.name}</h2>
              </div>
              <div>
                <p>Le,</p>
                <h2>
                  {new Date(DeletedOrder.order.date).getUTCDate() +
                    "-" +
                    (new Date(DeletedOrder.order.date).getUTCMonth() + 1) +
                    "-" +
                    new Date(DeletedOrder.order.date).getUTCFullYear()}
                </h2>
              </div>
            </div>
          </div>
        </section>
        <section className="product-area mt-4">
          <table id="fact-table" className="table table-hover">
            <thead>
              <tr>
                <td>Quantite</td>
                <td>Designation</td>
                <td>P.U</td>
                <td>Total</td>
              </tr>
            </thead>
            <tbody>
              {DeletedOrder.details.map((e) => {
                return (
                  <tr>
                    <td>{e.quantity}</td>
                    <td>
                      <div className="media">
                        <div className="media-body">
                          <p className="mt-0 title">{e.product_name}</p>
                        </div>
                      </div>
                    </td>
                    <td>{e.prix}DH</td>
                    <td>{e.prix * e.quantity}DH</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td />
                <td />
                <td>Total HT:</td>
                <td>{round(DeletedOrder.order.total)}DH</td>
              </tr>
              <tr>
                <td />
                <td />
                <td>TVA 20%:</td>
                <td>{round((DeletedOrder.order.total * 20) / 100)}DH</td>
              </tr>
              <tr>
                <td />
                <td />
                <td className="bord">Total TTC:</td>
                <td className="bord">
                  {round(
                    DeletedOrder.order.total +
                      (DeletedOrder.order.total * 20) / 100
                  )}
                  DH
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
        <section className="balance-info">
          <div className="">
            <div className="col-8">
              <p className="m-0 font-weight-bold note">
                {" "}
                Note:{" "}
                <span>
                  Reconnaît avoir recu conforme à la livraison ci-dessus
                </span>{" "}
              </p>
              <p />
            </div>
            {/* <div className="col-4">
            <table className="table total border-0 table-hover">
                <tr>
                    <td>Total HT:</td>
                    <td>1000DH</td>
                </tr>
                <tr>
                    <td>TVA 20%:</td>
                    <td>200DH</td>
                </tr>
                <tfoot>
                    <tr>
                        <td>Total TTC:</td>
                        <td>1200DH</td>
                    </tr>
                </tfoot>
            </table>

             Signature 
        </div> */}
          </div>
        </section>
        {/* Cart BG */}
        {/*  <img src="/static/pics/cart.jpg" className="img-fluid cart-bg" alt /> */}
        <footer id="footer-facture">
          <hr />
          <p className="m-0 text-center colortext">
            10 Lot Baraka Wiam Bensouda Mag 3 ‐ Fès / GSM: 06 61 08 56 62
          </p>
          <br />
          <span className="email">
            <span>Email: najate.radiateur@yahoo.fr</span>
          </span>
          <br />
          <div className="social">
            <span className="pr-2">
              <span>TP: 13439808</span>
            </span>
            <span className="pr-2">
              <span>IF: 15163065</span>
            </span>
            <span className="pr-2">
              <span>RC: 43697</span>
            </span>
            <span className="pr-2">
              <span>CNSS: 9961659</span>
            </span>
            <span className="pr-2">
              <span>ICE: 000010730000029</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );

  const template = SelectedOrder.details.map((order, i) => {
    return (
      <div id="invoice" className="page" size="A4">
        <div className="top-padding">
          <section className="top-content bb d-flex justify-content-between">
            <div className="logo-facture">
              <img src={Logo1} alt className="img-fluid" />
            </div>
            <img id="watermark" src={Logo2} />
            {/* <div className="top-left">
        <div className="graphic-path">
          <p>Facture</p>
        </div>
      </div> */}
          </section>
          <section className="store-user mt-5">
            <div className="col-12 center-elem">
              <p>
                Facture N<sup>°</sup>: <span>#{SelectedOrder.order.o_id}</span>
              </p>
            </div>
            <div className="col-10">
              <div className="row-custom pb-3">
                <div>
                  <p>Client,</p>
                  <h2 id="client">{order.client.name}</h2>
                </div>
                <div>
                  <p>Le,</p>
                  <h2>
                    {new Date(SelectedOrder.order.date).getUTCDate() +
                      "-" +
                      (new Date(SelectedOrder.order.date).getUTCMonth() + 1) +
                      "-" +
                      new Date(SelectedOrder.order.date).getUTCFullYear()}
                  </h2>
                </div>
              </div>
            </div>
          </section>
          <section className="product-area mt-4">
            <table id="fact-table" className="table table-hover">
              <thead>
                <tr>
                  <td>Quantite</td>
                  <td>Designation</td>
                  <td>P.U</td>
                  <td>Total</td>
                </tr>
              </thead>
              <tbody>
                {order.details.map((e) => {
                  return (
                    <tr>
                      <td>{e.quantity}</td>
                      <td>
                        <div className="media">
                          <div className="media-body">
                            <p className="mt-0 title">{e.product_name}</p>
                          </div>
                        </div>
                      </td>
                      <td>{e.prix}DH</td>
                      <td>{e.prix * e.quantity}DH</td>
                    </tr>
                  );
                })}
              </tbody>
              {(() => {
                if (i + 1 == SelectedOrder.details.length) {
                  return (
                    <tfoot>
                      <tr>
                        <td />
                        <td />
                        <td>Total HT:</td>
                        <td>{round(SelectedOrder.order.total)}DH</td>
                      </tr>
                      <tr>
                        <td />
                        <td />
                        <td>TVA 20%:</td>
                        <td>
                          {round((SelectedOrder.order.total * 20) / 100)}DH
                        </td>
                      </tr>
                      <tr>
                        <td />
                        <td />
                        <td className="bord">Total TTC:</td>
                        <td className="bord">
                          {round(
                            SelectedOrder.order.total +
                              (SelectedOrder.order.total * 20) / 100
                          )}
                          DH
                        </td>
                      </tr>
                    </tfoot>
                  );
                }
              })()}
            </table>
          </section>
          <section className="balance-info">
            <div className="">
              <div className="col-8">
                <p className="m-0 font-weight-bold note">
                  {" "}
                  Note:{" "}
                  <span>
                    Reconnaît avoir recu conforme à la livraison ci-dessus
                  </span>{" "}
                </p>
                <p />
              </div>
              {/* <div className="col-4">
            <table className="table total border-0 table-hover">
                <tr>
                    <td>Total HT:</td>
                    <td>1000DH</td>
                </tr>
                <tr>
                    <td>TVA 20%:</td>
                    <td>200DH</td>
                </tr>
                <tfoot>
                    <tr>
                        <td>Total TTC:</td>
                        <td>1200DH</td>
                    </tr>
                </tfoot>
            </table>

             Signature 
        </div> */}
            </div>
          </section>
          {/* Cart BG */}
          {/*  <img src="/static/pics/cart.jpg" className="img-fluid cart-bg" alt /> */}
          <footer id="footer-facture">
            <hr />
            <p className="m-0 text-center colortext">
              10 Lot Baraka Wiam Bensouda Mag 3 ‐ Fès / GSM: 06 61 08 56 62
            </p>
            <br />
            <span className="email">
              <span>Email: najate.radiateur@yahoo.fr</span>
            </span>
            <br />
            <div className="social">
              <span className="pr-2">
                <span>TP: 13439808</span>
              </span>
              <span className="pr-2">
                <span>IF: 15163065</span>
              </span>
              <span className="pr-2">
                <span>RC: 43697</span>
              </span>
              <span className="pr-2">
                <span>CNSS: 9961659</span>
              </span>
              <span className="pr-2">
                <span>ICE: 000010730000029</span>
              </span>
            </div>
          </footer>
        </div>
      </div>
    );
  });

  const DataTable = (
    <Fragment>
      {SelectedOrder.order.o_id ? (
        <div id="exportPdf">
          <Preview id={"jsx-template-2"}>{bon}</Preview>
          <Preview id={"jsx-template"}>{template}</Preview>
        </div>
      ) : (
        ""
      )}

      {DeletedOrder.order.o_id ? (
        <div id="exportPdf">
          <Preview id={"jsx-template-3"}>{fac_avoir}</Preview>
        </div>
      ) : (
        ""
      )}

      <div id="table-wrapper">
        <table id="status-table">
          <tbody>
            <tr>
              <th className="date">N&deg; Commande</th>
              <th classname="task-title">Client</th>
              <th classname="tel">Total</th>
              <th classname="tel">Credit</th>
              <th>Mode Paiement</th>
              <th>Transport</th>
              <th>Date</th>
              <th>Facture</th>
              <th>Bon</th>
              <th></th>
            </tr>

            {Seperated[active] &&
              Seperated[active].map((e) => {
                return (
                  <tr>
                    <td className="date">{e.order.o_id}</td>
                    <td>{e.client.name}</td>
                    <td>{e.order.total + "DH"}</td>
                    <td>
                      {Number(e.order.total) - Number(e.order.paid) + "DH"}
                    </td>
                    <td>{getOption(e.order.mode)}</td>
                    <td>{e.order.transport}</td>
                    <td className="task-title">
                      {new Date(e.order.date).toLocaleDateString(
                        "fr-FR",
                        options
                      )}
                    </td>
                    <td className="status">
                      <button
                        onMouseOver={() => updateData(e.order.id)}
                        onMouseLeave={() => clearData()}
                        onClick={() => downloadFact()}
                        className="factsubmit"
                        id="submit"
                      >
                        Telecharger
                      </button>
                    </td>
                    <td className="status">
                      <button
                        onMouseOver={() => updateData(e.order.id)}
                        onClick={() => downloadBon()}
                        onMouseLeave={() => clearData()}
                        className="factsubmit"
                        id="submit"
                      >
                        Telecharger
                      </button>
                    </td>
                    <td onClick={() => setOrderDetails(e.order.id)}>
                      <FontAwesomeIcon
                        icon={faExclamationCircle}
                        className="trash"
                      ></FontAwesomeIcon>{" "}
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
      {/* modal for adding transport */}

      <Modal open={openTransport} closeFunction={closeOptions}>
        <h1 className="title-modal m20">Ajouter un transport</h1>
        <div className="modal-input">
          <div className="input-wrapper">
            <label for="name">Nom</label>
            <input type="text" id="optionName"></input>
          </div>

          <button id="submit" onClick={createTransport} className="modalSubmit">
            Creer
          </button>
        </div>
      </Modal>

      {/* end modal for adding transport */}
      <Modal open={Open} closeFunction={handleClose}>
        <h1 className="title-modal m20">Detail de Commande</h1>
        <div className="modal-input-row">
          <CustomSelect
            options={PaymentOptions}
            changeFunc={handlePaiement}
            label="name"
            multi={false}
            values={PaymentOptions.filter((e) => e.id == Details.mode)}
            fvalue="id"
            placeholder="Mode de paiement"
          />
        </div>
        <div className="modal-input-row">
          <CustomSelect
            options={transportOptions}
            changeFunc={handleTransport}
            label="name"
            multi={false}
            values={transportOptions.filter((e) => e.name == Details.transport)}
            fvalue="id"
            placeholder="Mode de transport"
          />
        </div>
        <div className="modal-input">
          <label for="add">Montant Paye</label>
          <input
            type="text"
            defaultValue={Details.paid + " DH"}
            onChange={handlePaid}
            onFocus={clearField}
            onBlur={formatPrice}
            datavalue={Details.paid}
            id="add_m"
          ></input>
        </div>
        <div className="modal-input">
          <label for="add">Remboursement</label>
          <input
            key={DeletedOrder.order.ret}
            type="text"
            defaultValue={DeletedOrder.order.ret + " DH"}
            onChange={handleret}
            onFocus={clearField}
            onBlur={formatPrice}
            datavalue={DeletedOrder.order.ret}
            id="add_m"
          ></input>
        </div>
        <div className="modal-input">
          <label>Date</label>
          <ThemeProvider theme={materialTheme}>
            <DateTimePicker
              variant="inline"
              label="Date Commande"
              value={DeletedOrder.order.date}
              onChange={(val) => {
                let temp = {
                  ...DeletedOrder,
                };
                temp.order.date = val;
                setDeleted(temp);
              }}
            />
          </ThemeProvider>
        </div>
        <table id="status-table">
          <tbody>
            <tr>
              <th className="date">Nom du Produit</th>
              <th classname="task-title">Quantite</th>
              <th classname="tel">Prix</th>
            </tr>

            {Details.details.map((e) => {
              return (
                <tr>
                  <td className="date">{e.product_name}</td>
                  <td className="task-title">
                    <input
                      key={e.id}
                      className="editable-field"
                      name="quantity"
                      id={e.id}
                      onChange={(r) => modifyDetails(r, e.id)}
                      onFocus={clearField}
                      onBlur={formatField}
                      datavalue={e.quantity}
                      defaultValue={e.quantity}
                    ></input>
                  </td>
                  <td className="status">
                    <input
                      className="editable-field"
                      name="prix"
                      dataid={e.id}
                      onChange={(r) => modifyDetails(r, e.id)}
                      onFocus={clearField}
                      onBlur={formatPrice}
                      datavalue={e.prix}
                      defaultValue={e.prix + " DH"}
                    ></input>
                  </td>
                  <td
                    onClick={() => {
                      delOrderProduct(e.id);
                    }}
                    className="delete"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} className="trash" />
                  </td>
                </tr>
              );
            })}

            {addedRows.map((e, i) => {
              return (
                <AdditionRow
                  products={products}
                  details={Details.details}
                  deleteFromList={() => {
                    let temp = [...addedRows];
                    temp.splice(i, 1);
                    setAddedRows(temp);
                  }}
                  orderID={Details.o_id}
                  updateOrders={updateOrders}
                />
              );
            })}
          </tbody>
        </table>
        <div className="add-in-details">
          <FontAwesomeIcon
            icon={faPlus}
            onClick={handleAdditionRow}
            className="icon-animation addIcon "
          />
        </div>
        <button
          id="submit"
          onClick={() => updateOrder()}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? "Wait..." : "Modifier"}
        </button>
      </Modal>

      <AnimateNav />
      <section className="card Supplier">
        <h1 className="card-title text-center">Historique</h1>

        {fetchLoading ? (
          <div className="section-loader-container">{loader}</div>
        ) : (
          <>
            <div className="filtre-row seperate">
              <ThemeProvider theme={materialTheme}>
                <DatePicker
                  variant="inline"
                  label="Date Debut"
                  value={startDate}
                  onChange={changeStart}
                />
              </ThemeProvider>
              <CustomSelect
                options={Data.Clients}
                changeFunc={filter}
                label="name"
                multi={false}
                fvalue="id"
                values={filteredClient}
                placeholder="Choisir un Client"
              />
              <button
                className="btn-main"
                onClick={() => {
                  openOption();
                }}
              >
                Ajouter Transport
              </button>
              <CustomSelect
                options={getSubOrder(Orders)}
                changeFunc={filterID}
                label="o_id"
                multi={false}
                values={filteredID}
                searchTerm="o_id"
                fvalue="id"
                placeholder="Choisir l'ID"
              />

              <ThemeProvider theme={materialTheme}>
                <DatePicker
                  variant="inline"
                  label="Date Fin"
                  value={endDate}
                  onChange={changeEnd}
                />
              </ThemeProvider>
            </div>

            {Orders.length == 0 ? NotFound : DataTable}
            <Pagination
              data={Orders}
              seperated={Seperated}
              handleDirection={handleDirection}
              active={active}
            />
          </>
        )}
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
        pathname: "/appfront/app/login",
        state: { error: true, msg: "Please Login" },
      }}
    />
  );
}

export default HistoryV;
