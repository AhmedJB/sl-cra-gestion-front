import React, { useEffect, useState } from 'react'
import usePagination from '../hooks/usePagination';
import Pagination from './Pagination';

function DataTableWithPagination({data_}) {
    const [data,setData] = useState(data_);
    const [SeperatedProducts, active, handleDirection] = usePagination(data_);
    useEffect(()  =>  {
        console.log("data")
        console.log(data_)
    },[])


    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };

  return <>
  <div id="table-wrapper">
        <table id="status-table">
          <tbody>
            <tr>
                    <th>Date</th>
                    <th>Changement</th>
                    <th>Quantite</th>        
            </tr>

            {SeperatedProducts[active] &&
              SeperatedProducts[active].map((e, i) => {
                if (e.mvt_type === "out"){
                    return <></>
                }
                ////console.log(e);
                return (
                    <tr key={`Stock-change-${i}`}>
                    <td>
                      {new Date(e.date).toLocaleDateString("fr-FR", options)}
                    </td>
                    <td
                      className={
                        e.mvt_type === "out" ? "red-text" : "green-text"
                      }
                    >
                      {e.mvt_type === "out" ? "-" + e.qt_sortie : e.qt_entree}
                    </td>
                    <td>{e.new_quantity}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <Pagination
              data={data}
              seperated={SeperatedProducts}
              handleDirection={handleDirection}
              active={active}
            />
  </>
}

export default DataTableWithPagination