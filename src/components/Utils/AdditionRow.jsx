import React, { useState } from "react";
import CustomSelect from "../CustomSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useToasts } from "react-toast-notifications";
import { postReq } from "../../helper";

function AdditionRow({ products, details, deleteFromList, orderID, updateOrders }) {
  const { addToast } = useToasts();
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  function getarray(key1) {
    let arr = [];
    for (let i = 0; i < products.length; i++) {
      let temp = products[i][key1];
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

  const handleSelectChange = (nv) => {
    if (nv.length > 0) {
      let filteredProduct = products.filter((e) => e.product.id === nv[0].id);
      setSelectedProduct(filteredProduct[0]);
    } else {

    }

  };

  const validate = async () => {
    if (selectedProduct) {
      let body = {
        order: orderID,
        provider_id: selectedProduct.fournisseur.id,
        product_id: selectedProduct.product.id,
        product_name: selectedProduct.product.name,
        quantity: Number(quantity),
        prix: Number(price),
        prix_achat: selectedProduct.product.price_achat,
      };
      let filt = details.filter(e => e.product_id === selectedProduct.product.id)
      if (filt.length > 0) {
        addToast("Produit existe deja", {
          appearance: "warning",
          autoDismiss: true
        })
      } else {
        let resp = await postReq("detailsadd/", body);
        if (resp) {
          await updateOrders();
          deleteFromList();
        } else {
          addToast("Erreur", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      }


    } else {
      addToast("Select product", {
        appearance: "warning",
        autoDismiss: true,
      });
    }
  };

  return (
    <tr>
      <td className="date">
        <CustomSelect
          options={getarray("product")}
          changeFunc={handleSelectChange}
          label="total_name"
          multi={false}
          fvalue="p_id"
          placeholder="Choisir un produit"
        />
      </td>
      <td className="task-title">
        <input
          className="editable-field"
          name="quantity"
          value={quantity}
          onChange={(v) => setQuantity(v.target.value)}
        /* dataid={e.id}
                    onChange={(r) => modifyDetails(r, e.id)}
                    onFocus={clearField}
                    onBlur={formatPrice}
                    datavalue={e.prix}
                    defaultValue={e.prix + " DH"} */
        ></input>
      </td>
      <td className="status">
        <input
          className="editable-field"
          name="prix"
          value={price}
          onChange={(v) => setPrice(v.target.value)}
        /* dataid={e.id}
                    onChange={(r) => modifyDetails(r, e.id)}
                    onFocus={clearField}
                    onBlur={formatPrice}
                    datavalue={e.prix}
                    defaultValue={e.prix + " DH"} */
        ></input>
      </td>
      <td
        onClick={() => {
          deleteFromList();
        }}
        className="delete"
      >
        <FontAwesomeIcon icon={faTrashAlt} className="trash" />
      </td>
      <td
        onClick={() => {
          validate();
        }}
        className="delete"
      >
        <FontAwesomeIcon icon={faCheck} className="trash" />
      </td>
    </tr>
  );
}

export default AdditionRow;
