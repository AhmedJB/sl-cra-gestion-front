import React, {
  useState,
  useEffect,
  useContext,
  Fragment,
  useRef,
} from "react";
import { UserContext } from "../contexts/UserContext";
import { DataContext } from "../contexts/DataContext";
import { Redirect } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import {
  isLogged,
  req,
  download_file,
  post_download_file,
  logout,
  postReq,
} from "../helper";
import styled from "styled-components";
import Nav from "./Nav";
import AnimateNav from "./AnimateNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExclamationCircle,
  faPrint,
  faTrashAlt,
  faWarehouse,
  faPlus,
  faSearch,
  faUpload
} from "@fortawesome/free-solid-svg-icons";
import CustomSelect from "./CustomSelect";
import Checkbox from "@mui/material/Checkbox";
import Modal from "./Modal";
import usePagination from "./hooks/usePagination";
import Pagination from "./Utils/Pagination";
import StockChange from "./Utils/StockChange";
import stringSimilarity from "string-similarity";
import UploadHandler from "./Utils/UploadHandler";

function Stock(props) {
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(true);
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const [open, setOpen] = useState(false);
  const [viewOptions, setView] = useState(false);
  const [ModifyOpen, setModify] = useState(false);
  const [ConfirmOpen, setConfirm] = useState(false);
  const [viewModify, setViewModify] = useState(false);
  const [printIDs, setPrintIDs] = useState([]);
  const [modifyData, setModifyData] = useState({
    fournisseur: "",
    product: {
      name: "",
      ptype: "",
      price_vente: "",
      price_achat: "",
      quantity: "",
      place: "",
      paid: "",
    },
    options: {
      metal: "",
      type: "",
    },
  });
  const names = {
    eau: "Radiateur Eau",
    air: "Radiateur Air",
    clime: "Radiateur Clime",
    chauf: "Radiateur Chauffage",
    bonchon: "Bonchon",
    maneau: "Maneau",
    Deurite: "Deurite",
    antifel: "Antifèlle",
    fref: "Fréférant",
    termonstat: "Termonstat",
  };
  const [Products, setProduct] = useState([]);
  const [changesOpen, setChangesOpen] = useState(false);
  const [changesProdId, setChangesProdId] = useState(null);
  //const [SeperatedProducts,setSeperatedProducts] = useState([]);
  //const [active,setActive] = useState(0);

  const [Metal, setMetal] = useState([
    {
      name: "Cuivre",
      value: "cuivre",
    },
    {
      name: "Alimunium",
      value: "aluminium",
    },
  ]);

  const [Options, setOptions] = useState([]);

  const [Place, setPlace] = useState([
    {
      name: "Depot",
      value: 0,
    },
    {
      name: "Comptoire",
      value: 1,
    },
  ]);

  const [Body, setBody] = useState({
    fournisseur: "",
    product: {
      name: "",
      ptype: "",
      price_vente: "",
      price_achat: "",
      quantity: "",
      place: "",
    },
    options: {
      metal: "",
      type: "",
    },
  });

  const updateOptions = async () => {
    let resp = await req("option/");
    if (resp) {
      setOptions(resp);
    }
  };

  useEffect(() => {
    async function test() {
      let resp = await isLogged();
      //console.log(resp);
      if (resp) {
        let obj = { ...User };
        obj.logged = true;
        obj.username = resp.username;
        obj.email = resp.email;
        setUser(obj);
        await updateData();
        await updateOptions();

        return obj;
      } else {
        logout(setUser, User);
      }
    }

    test().then((obj) => {
      setLoading(false);
      //console.log(obj);
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

  /*const seperateProducts = () => {
    const limit = 20;
    let seperated = [];
    let temp = [];
    for (let i = 1; i <= Products.length ; i++) {
      if (i % limit ===  0){
        temp.push(Products[i-1]);
        seperated.push(temp);
        temp = [];
      }else{
        temp.push(Products[i-1]);
      }
    }
    if (temp.length > 0) {
      seperated.push(temp);    
    }
    setSeperatedProducts(seperated);
  }*/

  /*const handleDirection = (step) => {
    let act;
    if (step > 0) {
      act = (active + step) >= SeperatedProducts.length ? 0 : active + step;
    }else {
      act = (active + step) >= 0 ? active+step : SeperatedProducts.length - 1;
    }
    console.log("steps");
    console.log(SeperatedProducts.length);
    console.log(act);
    setActive(act);
  } */

  const [fetchLoading, setFetchLoading] = useState(true);
  const [selecSupplier, setSelecSupplier] = useState(null);
  const [selectCat, setSelectCat] = useState(null);
  const [selectID, setSelectID] = useState(null);
  const [selectName, setSelectName] = useState(null);
  const [openOption, setOpenOptions] = useState(false);
  const [openSim, setOpenSim] = useState(false);
  const [similars, setSimilars] = useState([]);

  /* upload states */
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedProductImage, setSelectedProductImage] = useState(null);
  /*  */

  /* useEffect(() => {
    seperateProducts();
    setActive(0);
  },[Products])*/

  const [SeperatedProducts, active, handleDirection] = usePagination(Products);

  const initiated = useRef(false);
  useEffect(() => {
    if (initiated.current) {
      console.log("this is a callback");
      console.log(!fetchLoading);
      setFetchLoading(false);
    } else {
      initiated.current = true;
    }
  }, [Products]);


  useEffect(() => {
    if (selectedProductImage) {
      let prod = Products.filter(e => e.product.id === selectedProductImage.product.id)
      if (prod.length > 0) {
        setSelectedProductImage(prod[0])
      } else {
        handleCloseUpload();
      }
    }
  }, [Products])

  async function updateProducts() {
    let pResp = await req("product");
    let obj = { ...Data };
    obj.Products = pResp;
    console.log("updating products");
    setProduct(pResp);
    setData(obj);
    return true;
  }

  async function updateData() {
    let supResp = await req("provider");
    let Prods = await req("product");
    let obj2 = { ...Data };
    obj2.Suppliers = supResp;
    obj2.Products = Prods;
    setData(obj2);
    setProduct(Prods);
    return true;
  }

  function formatPrice(e) {
    let t = e.target;

    t.value = t.value.split(" ")[0].replace(",", ".") + " DH";
  }

  function handleProvider(ps) {
    let body = { ...Body };
    if (ps == "") {
      body.fournisseur = "";
    } else {
      let p = ps[0];
      body.fournisseur = p.id;
    }

    setBody(body);
  }

  function handleOption(vs) {
    let body = { ...Body };
    let v = vs[0];
    if (v) {
      if (v.value == "eau") {
        setView(true);
        body.product.ptype = v.value;
      } else {
        setView(false);
        body.product.ptype = v.value;
        body.options.metal = "";
        body.options.type = "";
      }
    } else {
      setView(false);
      body.product.ptype = 0;
      body.options.metal = "";
      body.options.type = "";
    }

    setBody(body);
  }

  function handlePlace(ps) {
    let body = { ...Body };
    if (ps == "") {
      body.product.place = 0;
    } else {
      body.product.place = ps[0].value;
    }
    setBody(body);
  }

  function handlePlacev2(ps) {
    let body = { ...modifyData };
    if (ps == "") {
      body.product.place = 0;
    } else {
      body.product.place = ps[0].value;
    }
    setModifyData(body);
  }

  function handleMetal(ms) {
    let body = { ...Body };
    if (ms == "") {
      body.options.metal = "";
    } else {
      let m = ms[0];
      body.options.metal = m.value;
    }
    setBody(body);
  }

  function handleProviderv2(ps) {
    let body = { ...modifyData };
    if (ps == "") {
      body.fournisseur = "";
    } else {
      let p = ps[0];
      body.fournisseur = p;
    }

    setModifyData(body);
  }

  function handleOptionv2(vs) {
    let body = { ...modifyData };
    let v = vs[0];
    if (v.value == "eau") {
      setViewModify(true);

      body.product.ptype = v.value;
    } else {
      setViewModify(false);
      body.product.ptype = v.value;
      body.options.metal = "";
      body.options.type = "";
    }
    //console.log(body);
    setModifyData(body);
  }

  function handleMetalv2(ms) {
    let body = { ...modifyData };
    if (ms == "") {
      body.options.metal = "";
    } else {
      let m = ms[0];
      body.options.metal = m.value;
    }
    setModifyData(body);
  }

  function handleOpen() {
    setView(false);
    setBody({
      fournisseur: "",
      product: {
        name: "",
        ptype: "",
        price_vente: "",
        price_achat: "",
        quantity: "",
      },
      options: {
        metal: "",
        type: "",
      },
    });
    setOpen(!open);
  }

  async function CreateProduct() {
    let body = { ...Body };
    body.product.name = document.getElementById("name").value;

    if (body.product.ptype == "eau") {
      body.options.type = document.getElementById("type").value;
    }

    body.product.price_achat = document
      .getElementById("achat")
      .value.split(" ")[0];
    body.product.price_vente = document
      .getElementById("vente")
      .value.split(" ")[0];
    body.product.quantity = document.getElementById("qt").value;
    body.product.paid = document.getElementById("paid").value.split(" ")[0];

    setBody(body);

    let resp = await postReq("product", body);
    if (resp) {
      addToast("Succès", {
        appearance: "success",
        autoDismiss: true,
      });
      //console.log(resp);
      updateProducts();
      //updateSuppliers();
    } else {
      addToast("Erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }

  function getSupp(id) {
    if (id) {
      let supp = Data.Suppliers.filter((e) => e.id == id)[0];
      return supp.name;
    }
  }

  function getarray(key1) {
    let arr = [];
    for (let i = 0; i < Products.length; i++) {
      let temp = Products[i][key1];
      let found = false;
      let q = temp.quantity;
      for (let j = arr.length - 1; j >= 0; j--) {
        if (arr[j].name == temp.name && !found) {
          q += arr[j].total_quantity;
          found = true;
        }
        if (arr[j].name == temp.name) {
          arr[j].total_quantity = q;
          arr[j].total_name = arr[j].name + " (" + q + ")";
        }
      }
      temp.total_quantity = q;
      temp.total_name = temp.name + " (" + q + ")";
      arr.push(temp);
    }
    console.log(arr);
    return arr;
  }

  function filterCat(cs) {
    setFetchLoading(true);

    if (cs == "") {
      setSelectCat(null);
      updateProducts();
    } else {
      let arr = [];
      let v = cs[0];
      let produits = Data.Products;
      for (let i = 0; i < produits.length; i++) {
        if (produits[i].product.ptype == v.value) {
          arr.push(produits[i]);
        }
      }
      setSelectCat(cs);
      setProduct(arr);
    }
  }

  function filterProduct(vs) {
    setFetchLoading(true);
    if (vs == "") {
      setSelectID(null);
      updateProducts();
    } else {
      let arr = [];
      let v = vs[0];
      let produits = Data.Products;
      for (let i = 0; i < produits.length; i++) {
        if (produits[i].product.p_id == v.p_id) {
          arr.push(produits[i]);
        }
      }
      setSelectID(vs);
      setProduct(arr);
    }
  }

  function filterProductName(vs) {
    setFetchLoading(true);
    if (vs == "") {
      setSelectName(null);
      updateProducts();
    } else {
      let arr = [];
      let v = vs[0];
      let produits = Data.Products;
      for (let i = 0; i < produits.length; i++) {
        if (produits[i].product.name == v.name) {
          arr.push(produits[i]);
        }
      }
      setSelectName(vs);
      setProduct(arr);
    }
  }

  async function filterFournisseur(fs) {
    setFetchLoading(true);
    if (fs == "") {
      setSelecSupplier(null);
      await updateProducts();
    } else {
      let arr = [];
      let f = fs[0];
      let produits = Data.Products;
      for (let i = 0; i < produits.length; i++) {
        if (produits[i].fournisseur.id == f.id) {
          arr.push(produits[i]);
        }
      }
      setSelecSupplier(fs);
      setProduct(arr);
    }
  }

  function filterPlace(ps) {
    if (ps == "") {
      updateProducts();
    } else {
      let arr = [];
      let p = ps[0];
      //console.log(p);
      for (let i = 0; i < Products.length; i++) {
        if (Products[i].product.place == p.value) {
          arr.push(Products[i]);
        }
      }
      setProduct(arr);
    }
  }

  async function modify(id) {
    setModify(!ModifyOpen);
    let mod = Products.filter((e) => e.product.p_id == id)[0];
    //console.log(mod);
    if (mod.product.ptype == "eau") {
      setViewModify(true);
    } else {
      setViewModify(false);
    }
    setModifyData(mod);
    //let resp = await modifySupplier(id);
  }

  async function delData(id) {
    setConfirm(!ConfirmOpen);
    let mod = Products.filter((e) => e.product.p_id == id)[0];
    //console.log(mod);
    if (mod.product.ptype == "eau") {
      setViewModify(true);
    } else {
      setViewModify(false);
    }
    setModifyData(mod);
  }

  async function del(id) {
    let resp = await req("modproduct/" + String(id));
    let p = Products.filter((e) => e.product.p_id == id)[0];
    if (resp) {
      addToast("Produit " + p.product.name + " a ete supprime", {
        appearance: "success",
        autoDismiss: true,
      });
      updateData();
      setConfirm(!ConfirmOpen);
    }
  }

  async function ModifyProduct(id) {
    let body = { ...modifyData };
    body.product.name = document.getElementById("name").value;

    if (body.product.ptype == "eau") {
      body.options.type = document.getElementById("type").value;
    }

    body.product.price_achat = document
      .getElementById("achat")
      .value.split(" ")[0];
    body.product.price_vente = document
      .getElementById("vente")
      .value.split(" ")[0];
    body.product.quantity = document.getElementById("qt").value;
    body.product.paid = document.getElementById("paid").value.split(" ")[0];

    setModifyData(body);

    let resp = await postReq("modproduct/" + body.product.p_id, body);
    if (resp) {
      addToast("Succès", {
        appearance: "success",
        autoDismiss: true,
      });
      //console.log(resp);
      updateData();
      //updateSuppliers();
    } else {
      addToast("Erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }

  function checkChange(checked, val) {
    //console.log(checked)
    //console.log(val)
    let copy = [...printIDs];
    if (checked) {
      if (val != "all") {
        copy.push(val);
      } else {
        copy = Products.map((e) => [
          e.product.name,
          e.product.p_id,
          e.product.quantity,
        ]);
      }
    } else {
      if (val != "all") {
        let index = printIDs.findIndex((i) => i == val);
        //console.log('value is ' + index)
        copy.splice(index, 1);
      } else {
        copy = [];
      }
    }
    //console.log(copy);
    setPrintIDs(copy);
  }

  async function print() {
    let resp = await post_download_file("downloadbr", "barcode.pdf", printIDs);
    if (resp) {
      addToast("Fichier Barcode a ete telechare", {
        appearance: "success",
        autoDismiss: true,
      });
      setPrintIDs([]);
    } else {
      addToast("Erreur", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }

  const handleOptionOpen = () => {
    setOpenOptions(true);
  };

  const closeOptions = () => {
    setOpenOptions(false);
  };

  const createCategorie = async () => {
    let name = document.getElementById("optionName").value;
    let value = document.getElementById("optionValue").value;
    let body = {
      name,
      value,
    };
    let resp = await postReq("option/", body);
    if (resp) {
      await updateOptions();
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

  function sortByRatingDescending(array) {
    return array.sort((a, b) => b.rating - a.rating);
  }

  const handleOpenSim = () => {
    let name = document.getElementById("name").value;
    console.log("name is ", name);
    if (name.length > 0) {
      let produits = Data.Products;
      let elements = produits.map((e) => e.product.name);
      let matches = stringSimilarity.findBestMatch(name, elements);
      let sortedMatches = sortByRatingDescending(matches.ratings).slice(0, 5);
      console.log("the sorted matches are ", sortedMatches);
      let sortedArray = sortedMatches.map((e) => e.target);
      console.log("sorted array ", sortedArray);
      let filteredMatches = [];
      for (let i = 0; i < sortedArray.length; i++) {
        for (let j = 0; j < produits.length; j++) {
          if (produits[j].product.name === sortedArray[i]) {
            filteredMatches.push(produits[j]);
            break;
          }
        }
      }
      console.log("result : ", filteredMatches);
      setSimilars(filteredMatches);
    }
    setOpenSim(true);
  };

  const handleCloseSim = () => {
    setSimilars([]);
    setOpenSim(false);
  };





  const handleOpenUpload = (e) => {
    setSelectedProductImage(e);
    setUploadOpen(true);
  }

  const handleCloseUpload = () => {
    setSelectedProductImage(null);
    setUploadOpen(false)
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
              <th>
                <Checkbox
                  checked={printIDs.length == Products.length ? true : false}
                  onChange={(t) => {
                    checkChange(t.target.checked, "all");
                  }}
                  sx={{
                    color: "#b187ff",
                    "&.Mui-checked": {
                      color: "#b187ff",
                    },
                  }}
                />
              </th>
              <th classname="date">ID</th>
              <th classname="task-title">Nom du Produit</th>
              <th classname="status">Categorie</th>
              {/*  <th>Metal</th>
          <th classname="tel">Type</th> */}
              <th>Quantite</th>
              {/* <th classname="tel">Prix Achat</th> */}
              <th classname="tel">Prix Vente</th>
              {/* <th>Montant Payé</th> */}
              <th classname="tel">Fournisseur</th>
              <th></th>
              <th></th>
              <th></th>
              <th onClick={print}>
                <FontAwesomeIcon icon={faPrint} className="trash" />{" "}
                {/* <button className="factsubmit" id="submit">Imprimer</button> */}
              </th>
            </tr>

            {SeperatedProducts[active] &&
              SeperatedProducts[active].map((e) => {
                //console.log(e);
                return (
                  <tr>
                    <td>
                      <Checkbox
                        checked={
                          printIDs.findIndex((r) => r[1] == e.product.p_id) !=
                            -1
                            ? true
                            : false
                        }
                        onChange={(t) => {
                          checkChange(t.target.checked, [
                            e.product.name,
                            e.product.p_id,
                            e.product.quantity,
                          ]);
                        }}
                        sx={{
                          color: "#b187ff",
                          "&.Mui-checked": {
                            color: "#b187ff",
                          },
                        }}
                      />
                    </td>
                    <td>{e.product.p_id}</td>
                    <td classname="date">{e.product.name}</td>
                    <td classname="task-title">{names[e.product.ptype]}</td>
                    {/* <td classname="status">{e.options.metal}</td>
          <td classname="date">
            {e.options.type}
          </td> */}
                    <td classname="status">{e.product.quantity}</td>
                    {/* <td classname="status">{e.product.price_achat + ' DH'}</td> */}
                    <td classname="status">{e.product.price_vente + " DH"}</td>
                    {/* <td>{e.product.paid + ' DH'}</td> */}
                    <td classname="status">{getSupp(e.fournisseur.id)}</td>
                    <td className="edit" onClick={() => modify(e.product.p_id)}>
                      <FontAwesomeIcon icon={faEdit} className="trash" />
                    </td>
                    <td
                      className="edit"
                      onClick={() => {
                        setChangesProdId(e.product.id);
                        setChangesOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faWarehouse} className="trash" />
                    </td>
                    <td
                      className="edit"
                      onClick={() => {
                        handleOpenUpload(e);
                      }}
                    >
                      <FontAwesomeIcon icon={faUpload} className="trash" />
                    </td>
                    <td
                      onClick={() => {
                        //del(e.product.p_id);
                        delData(e.product.p_id);
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
          {"Voulez-vous supprimer le produit " + modifyData.product.name + " ?"}
        </h1>
        <div className="modal-input-row">
          <button
            onClick={() => {
              del(modifyData.product.p_id);
              //delData(e.product.p_id);
            }}
            className="factsubmit"
            id="submit"
          >
            Supprimer
          </button>
        </div>
      </Modal>

      <Modal open={uploadOpen} closeFunction={handleCloseUpload}>
        <UploadHandler product={selectedProductImage} refresh={updateProducts} />
      </Modal>

      <Modal
        open={changesOpen}
        closeFunction={(v) => {
          setChangesProdId(null);
          setChangesOpen(false);
        }}
      >
        <h1 className="title-modal m20">Changement stock</h1>
        {changesProdId && <StockChange productId={changesProdId} />}
      </Modal>

      <Modal open={ModifyOpen} closeFunction={setModify}>
        <h1 className="title-modal m20">Modification de Produit</h1>
        <div className="modal-input">
          <div className="modal-input-row">
            <CustomSelect
              options={Data.Suppliers}
              changeFunc={handleProviderv2}
              label="name"
              multi={false}
              values={[modifyData.fournisseur]}
              fvalue="id"
              placeholder="Choisir un Fournisseur"
            />
            <CustomSelect
              options={Options}
              changeFunc={handleOptionv2}
              label="name"
              fvalue="value"
              values={[
                Options.find((opt) => opt.value == modifyData.product.ptype),
              ]}
              placeholder="Choisir un Produit"
            />
            {/* <CustomSelect options={Place}  changeFunc={handlePlacev2}
  label="name" fvalue="value" values={[Place.find(opt => opt.value  == modifyData.product.place)]} placeholder="Choisir une Place" /> */}
          </div>

          <div className="input-wrapper">
            <label for="name">Nom du produit</label>
            <input
              type="text"
              id="name"
              defaultValue={modifyData.product.name}
            ></input>
          </div>
          {viewModify && (
            <div className="input-wrapper">
              <label for="type">Type</label>
              <CustomSelect
                options={Metal}
                changeFunc={handleMetalv2}
                label="name"
                fvalue="value"
                values={
                  modifyData.options.metal == ""
                    ? []
                    : [
                      Metal.find(
                        (opt) => opt.value == modifyData.options.metal
                      ),
                    ]
                }
                clas="CustomSelectMargin"
                placeholder="Choisir un Metal"
              />

              <input
                type="text"
                defaultValue={modifyData.options.type}
                id="type"
              ></input>
            </div>
          )}

          <div className="modal-input-row">
            <div className="modal-input-row">
              <div className="input-wrapper">
                <label for="qt">Quantite</label>
                <input
                  type="number"
                  defaultValue={modifyData.product.quantity}
                  id="qt"
                ></input>
              </div>
            </div>

            <div className="modal-input-row">
              <div className="input-wrapper">
                <label for="achat">Prix Achat</label>
                <input
                  type="text"
                  placeholder="0 DH"
                  defaultValue={modifyData.product.price_achat}
                  onBlur={formatPrice}
                  id="achat"
                ></input>
              </div>
              <div className="input-wrapper">
                <label for="vente">Prix Vente</label>
                <input
                  type="text"
                  placeholder="0 DH"
                  defaultValue={modifyData.product.price_vente}
                  onBlur={formatPrice}
                  id="vente"
                ></input>
              </div>
              <div className="input-wrapper">
                <label for="vente">Montant Payé</label>
                <input
                  type="text"
                  placeholder="0 DH"
                  defaultValue={modifyData.product.paid}
                  onBlur={formatPrice}
                  id="paid"
                ></input>
              </div>
            </div>
          </div>

          <button id="submit" onClick={ModifyProduct} className="modalSubmit">
            Modifier
          </button>
        </div>
      </Modal>

      <Modal open={open} closeFunction={setOpen}>
        <h1 className="title-modal m20">Ajout de Produit</h1>
        <div className="modal-input">
          <div className="modal-input-row">
            <CustomSelect
              options={Data.Suppliers}
              changeFunc={handleProvider}
              label="name"
              multi={false}
              fvalue="id"
              placeholder="Choisir un Fournisseur"
            />
            <CustomSelect
              options={Options}
              changeFunc={handleOption}
              label="name"
              fvalue="value"
              placeholder="Choisir une Categorie"
            />
            {/* <CustomSelect options={Place}  changeFunc={handlePlace}
  label="name" fvalue="value"  placeholder="Choisir une Place" /> */}
          </div>

          <div className="input-wrapper">
            <label for="name">Nom du produit</label>
            <div className="flex-container-row">
              <input type="text" id="name"></input>
              <FontAwesomeIcon
                onClick={handleOpenSim}
                icon={faSearch}
                className="trash icon-m"
              />
            </div>
          </div>
          {viewOptions && (
            <div className="input-wrapper">
              <label for="type">Type</label>
              <CustomSelect
                options={Metal}
                changeFunc={handleMetal}
                label="name"
                fvalue="value"
                clas="CustomSelectMargin"
                placeholder="Choisir un Metal"
              />

              <input type="text" id="type"></input>
            </div>
          )}

          <div className="modal-input-row">
            <div className="modal-input-row">
              <div className="input-wrapper">
                <label for="qt">Quantite</label>
                <input type="number" id="qt"></input>
              </div>
            </div>

            <div className="modal-input-row">
              <div className="input-wrapper">
                <label for="achat">Prix Achat</label>
                <input
                  type="text"
                  placeholder="0 DH"
                  onBlur={formatPrice}
                  id="achat"
                ></input>
              </div>
              <div className="input-wrapper">
                <label for="vente">Prix Vente</label>
                <input
                  type="text"
                  placeholder="0 DH"
                  onBlur={formatPrice}
                  id="vente"
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
            </div>
          </div>

          <button id="submit" onClick={CreateProduct} className="modalSubmit">
            Creer
          </button>
        </div>
      </Modal>

      {/* show similar products */}

      <Modal open={openSim} closeFunction={handleCloseSim}>
        <h1 className="title-modal m20">Similar Things</h1>
        <div id="table-wrapper">
          <table id="status-table">
            <tbody>
              <tr>
                <th>ID</th>
                <th>Nom</th>
              </tr>
              {similars.map((e, i) => (
                <tr key={`matches-${i}`}>
                  <td>{e.product.p_id}</td>
                  <td>{e.product.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* end modal */}

      {/* modal for adding option */}

      <Modal open={openOption} closeFunction={closeOptions}>
        <h1 className="title-modal m20">Ajout de categorie</h1>
        <div className="modal-input">
          <div className="input-wrapper">
            <label for="name">Nom</label>
            <input type="text" id="optionName"></input>
          </div>

          <div className="input-wrapper">
            <label for="name">Valeur</label>
            <input type="text" id="optionValue"></input>
          </div>

          <button id="submit" onClick={createCategorie} className="modalSubmit">
            Creer
          </button>
        </div>
      </Modal>

      {/* end modal for adding option */}

      <AnimateNav />
      <section className="card Supplier">
        <h1 className="card-title text-center">Stock</h1>
        {fetchLoading ? (
          <div className="section-loader-container">{loader}</div>
        ) : (
          <>
            <div className="filtre-row">
              <div className="filtre-group">
                <CustomSelect
                  options={Data.Suppliers}
                  changeFunc={filterFournisseur}
                  label="name"
                  fvalue="id"
                  searchBy="name"
                  placeholder="Choisir un Fournisseur"
                  values={selecSupplier}
                />
                <div className="flex-container-row">
                  <CustomSelect
                    options={Options}
                    changeFunc={filterCat}
                    label="name"
                    fvalue="name"
                    placeholder="Choisir une Categorie"
                    values={selectCat}
                  />
                  {/* <FontAwesomeIcon icon={faPlus} className="trash" /> */}
                </div>

                {/* <CustomSelect options={Place} changeFunc={filterPlace}
        label="name" fvalue="value" placeholder="Choisir une Place" /> */}
                <CustomSelect
                  options={getarray("product")}
                  changeFunc={filterProduct}
                  label="p_id"
                  fvalue="p_id"
                  searchTerm="p_id"
                  placeholder="Choisir un ID"
                  values={selectID}
                />
                <CustomSelect
                  options={getarray("product")}
                  changeFunc={filterProductName}
                  label="total_name"
                  fvalue="p_id"
                  placeholder="Choisir un produit"
                  values={selectName}
                />
              </div>

              <button
                class="btn-main"
                onClick={() => {
                  handleOptionOpen();
                }}
              >
                Ajouter une categorie
              </button>

              <button
                class="btn-main"
                onClick={() => {
                  handleOpen();
                }}
              >
                Ajouter un Produit
              </button>
            </div>

            {Products.length == 0 ? NotFound : DataTable}
            <Pagination
              data={Products}
              seperated={SeperatedProducts}
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
        pathname: "/app/login",
        state: { error: true, msg: "Please Login" },
      }}
    />
  );
}

export default Stock;
