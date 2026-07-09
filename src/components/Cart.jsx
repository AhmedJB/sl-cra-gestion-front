import React, { useState, useEffect, useContext, Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamationCircle,
  faTrashAlt,
  
} from '@fortawesome/free-solid-svg-icons'
import {req, postReq } from '../helper'
import {  useToasts } from 'react-toast-notifications';
import Modal from "./Modal";
import CustomSelect from "./CustomSelect";

function Cart({products,setProducts,submitOptions,setSubmitOptions,calculateTotal,fetchProduct,updateTotal,afterSubmit}) {
  const { addToast } = useToasts();

  const [selected, setSelected] = useState(null)
  const [Open, setOpen] = useState(false)
  const [confOpen, setConfOpen] = useState(false)
  const [barcode, setBarcode] = useState('');
  const [Clients, setClients] = useState([]);
  const [loading,setLoading] = useState(true);
  

  const [PaymentOptions, setPaymentOptins] = useState([
    {
      name: 'cash',
      id: 0
    },
    {
      name: 'cheque',
      id: 1
    },
    {
      name: 'effet',
      id: 2
    },
    {
      name: 'versement',
      id: 3
    },
    {
      name: 'simple',
      id: 4
    }
  ])




  useEffect(() => {
    async function handler() {
      await updateClients()
    }

    handler().then(res => {
      //barCodeListener();
      setLoading(false)
    })
  }, [])

  async function updateClients() {
    let supResp = await req('getclients/')
    for(let i =0; i < supResp.length; i++){
      if (supResp[i].name.toLowerCase().trim() == "comptoir"){
        setSelected(supResp[i]);
        break;
      }
    }
    setClients(supResp)
    return true
  }

  function selectClient(val) {
    setSelected(val[0]);
  }

  // fetch functions



  function getProd(id) {
    for (let i = 0; i < products.length; i++) {
      if (products[i].id == id) {
        return i
      }
    }
    return -1
  }

  function formatPrice(e) {
    let t = e.target
    let val = ''
    if (t.value == '') {
      val = t.attributes.datavalue.value
    } else {
      val = t.value
    }
    t.value = val.split(' ')[0].replace(',', '.') + ' DH'
  }

  async function formatField(e) {
    let t = e.target

    let val = ''
    if (t.value == '') {
      val = t.attributes.datavalue.value
    } else {
      val = t.value
    }
    let p_id  = t.attributes.datapid.value
    let pr = await req('getproduct/' + String(p_id) + '/');
    if (Number(val) > pr.quantity) {
      addToast(`Stock limité : Quantité ajustée au maximum disponible (${pr.quantity})`, {
        appearance: 'warning',
        autoDismiss: true,
      });
    }
    let q = pr.quantity >= Number(val) ?  Number(val) : pr.quantity;
    t.value = q
  }


  async function handleChange(e) {
    let t = e.target
    let key = t.name
    let id = Number(t.attributes.dataid.value)
    let p_id  = t.attributes.datapid.value
    let index = getProd(id)
    //console.log(index)
    let copy = [...products]
    //console.log(copy)
    let temp = copy[index]
    if (key == 'quantity'){
      //console.log(pr);
      let pr = await req('getproduct/' + String(p_id) + '/');
      let requestedQt = Number(t.value);
      if (requestedQt > pr.quantity) {
        if (temp[key] !== pr.quantity) {
          addToast(`Quantité ajustée : Le stock maximum disponible est de ${pr.quantity}`, {
            appearance: "warning",
            autoDismiss: true,
          });
        }
        temp[key] = pr.quantity;
      } else {
        temp[key] = requestedQt;
      }
    }else{
      temp[key] = Number(t.value);
    }

    copy[index] = temp
    let tot = calculateTotal(copy);
    updateTotal(tot,tot);
    setProducts(copy)
  }

  function clearField(e) {
    let t = e.target
    t.value = ''
  }



  function handleOpen() {
    setOpen(!Open)
  }

  
  function updatePaid(total) {
    let temp = { ...submitOptions }
    temp.paid = total
    setSubmitOptions(temp)
  }

  

  function handleDel(id) {
    let index = getProd(id)
    let temp = [...products]
    temp.splice(index, 1)
    setProducts(temp);
    let tot = calculateTotal(temp);
    updateTotal(tot,tot);
  }

  function handleBarcode(evt) {
    if (evt.code == 'Enter') {
      if (Number(barcode) != NaN && barcode.length == 13) {
        fetchProduct(barcode)
      } else {
        console.log('failed')
      }
      setBarcode('')
    } else {
      let test = barcode + evt.key
      setBarcode(test)
      //console.log(barcode);
    }
  }

  function handlePaiement(val) {
    let temp = { ...submitOptions }
    temp.modePayment = val[0].id
    setSubmitOptions(temp)
  }

  function changePaid(e) {
    let t = e.target
    let temp = { ...submitOptions }
    temp.paid = Number(t.value)
    setSubmitOptions(temp)
  }

  function formatPrice2(e) {
    let t = e.target
    if (t.value != '') {
      t.value = t.value.split(' ')[0].replace(',', '.') + ' DH'
    }
  }

  async function submitOrder(){
    let body = {
      products,
      sub_options : submitOptions,
      client : selected
    }

    let resp = await postReq('order/',body);
    if (resp){
      addToast("Commande Confirmé", {
        appearance: "success",
        autoDismiss: true,
      });
      setSubmitOptions({
        total: 0,
        paid: 0,
        modePayment: 0
      });
      //setSelected(null);
      setProducts([]);
      setConfOpen(!confOpen);
      afterSubmit();
    }
  }

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  const NotFound = (
    <div className="not-found">
      <h2 className="error-text">Aucun Produit</h2>
      <FontAwesomeIcon icon={faExclamationCircle} className="error-circle" />
    </div>
  )

  const DataTable = (
    <Fragment>
      
        <div id="table-wrapper">
          <table id="status-table">
            <tbody>
              <tr>
                <th className="date">Nom du Produit</th>
                <th classname="task-title">Quantite</th>
                <th classname="tel">Prix</th>
                <th id="trash-head"><button
            id="submit"
            onClick={() => {
              setConfOpen(!confOpen)
            }}
            className="modalSubmit"
          >
            Confirmer
          </button></th>
              </tr>

              {products.map(e => {
                return (
                  <tr>
                    <td className="date">{e.name}</td>
                    <td className="task-title">
                      <input
                        key={e.id}
                        className="editable-field"
                        name="quantity"
                        id={e.id}
                        onFocus={clearField}
                        onChange={handleChange}
                        onBlur={formatField}
                        datavalue={e.quantity}
                        dataid={e.id}
                        datapid={e.p_id}
                        //value={e.quantity}
                        defaultValue={e.quantity}
                      ></input>
                    </td>
                    <td className="status">
                      <input
                        className="editable-field"
                        name="price_vente"
                        onFocus={clearField}
                        onChange={handleChange}
                        datavalue={e.price_vente}
                        dataid={e.id}
                        datapid={e.p_id}
                        onBlur={formatPrice}
                        defaultValue={e.price_vente + ' DH'}
                      ></input>
                    </td>
                    <td id="trash-head" onClick={() => handleDel(e.id)}>
                      <FontAwesomeIcon icon={faTrashAlt} className="trash" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* <div className="submit-container">
          
        </div> */}
      
    </Fragment>
  )

  const html = (
    <Fragment>
      <Modal open={confOpen} closeFunction={setConfOpen}>
        <h1 className="title-modal m20">Confirmation</h1>
        <div className="modal-input">
          <div className="modal-input-row">
            <CustomSelect
              options={PaymentOptions}
              changeFunc={handlePaiement}
              label="name"
              multi={false}
              values={PaymentOptions.filter(
                e => e.id == submitOptions.modePayment
              )}
              fvalue="id"
              placeholder="Mode de paiement"
            />
          </div>

          <div className="modal-input-row">
            <div className="modal-input-row">
              <div className="input-wrapper">
                <label for="achat">Total</label>
                <input
                  type="text"
                  className="input-field"
                  readOnly={true}
                  placeholder={submitOptions.total + ' DH'}
                  onBlur={formatPrice2}
                  id="achat"
                ></input>
              </div>
              <div className="input-wrapper">
                <label for="vente">Montant payé</label>
                <input
                  type="text"
                  placeholder="0 DH"
                  defaultValue={submitOptions.paid + ' DH'}
                  className="input-field"
                  onChange={changePaid}
                  onBlur={formatPrice2}
                  id="vente"
                ></input>
              </div>
            </div>
          </div>

          <button
            id="submit"
            onClick={submitOrder}
            className="modalSubmit"
          >
            Creer
          </button>
        </div>
      </Modal>

      

      
        <h1 className="card-title text-center">Vente</h1>
        <div className='global-container'>
        <div className="filtre-row">
          <div className="filtre-group">
            <CustomSelect
              options={Clients}
              changeFunc={selectClient}
              values = {selected ? [selected] : null}
              label="name"
              fvalue="id"
              placeholder="Choisir un Client"
            />
          </div>
          

          
        </div>

        {products.length == 0 ? NotFound : DataTable}
        </div>
     
    </Fragment>
  )

  

  const loader = (
    <div className="animation-container">
      <div className="lds-facebook">
        <div />
        <div />
        <div />
      </div>
    </div>
  )

  return loading ? loader : html
}

export default Cart;
