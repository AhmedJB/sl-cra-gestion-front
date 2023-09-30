import React, { useEffect,useState } from 'react'
import { createTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import {
	DatePicker,
	DateTimePicker,
	KeyboardDatePicker,
  } from "@material-ui/pickers";
import { req } from '../../helper';

const StockChange = ({productId}) => {
	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	  };

	const resetDate = date  => {
		date.setHours(0, 0, 0, 0);
		return date;
	}

	const [searchdate,setSearchDate] = useState(resetDate(new Date()))
	const [operations,setOperations] = useState([]);
	const [latestQuantity,setLatestQuantity] = useState(null);
	
	function isDateLowerThanToday(tdate) {
		let  date = new Date(tdate);
		// Create a new Date object for today at 00:00
		let  todayStart = new Date(searchdate);
		todayStart.setHours(0, 0, 0, 0);
		console.log("Search date " , todayStart)
		console.log("Entry Date ", date )

		console.log(date < todayStart)
	  
	  
		// Compare the input date with today's start
		return date < todayStart;
	  }

	const fetchNewData = async () => {
		let params = {
			pid: productId,
			searchdate : (new Date(searchdate)).toJSON()
		}
		console.log(params);
		let resp = await req('mvtstock?'+ new URLSearchParams(params))
	
		if (resp){
			if (resp.length > 0){
				setLatestQuantity(resp[0].new_quantity)
				let temp = []
				for (let i = 0 ; i < resp.length ; i++){
					if (!isDateLowerThanToday(resp[i].date)){
						temp.push(resp[i]);
					}
				}
				setOperations(temp);
			}else{
				setLatestQuantity(null);
				setOperations([])

			}
			console.log("data for stock changes")
			console.log(resp);
		}
	}

	useEffect(() => {
		fetchNewData().then(() => console.log("fetched data"))

	},[productId,searchdate])

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


  return <>
	<div className="modal-input">
          <div className="modal-input-row">
		  <div className="modal-input">
          <label>Date</label>
          <ThemeProvider theme={materialTheme}>
            <DatePicker
              variant="inline"
              label="Date"
              value={searchdate}
              onChange={(val) => {
				setSearchDate(val);
              }}
            />
          </ThemeProvider>
        </div>
		

          </div>
		  {
			latestQuantity  && <div className="modal-input">
			<label>Quantite</label>
			<h3 className="modal-value">{latestQuantity}</h3>
		</div>

		  }

		  {
			latestQuantity && operations.length > 0 && <>
				<div id="table-wrapper">
        <table id="status-table">
          <tbody>
            <tr>
              <th>Date</th>
              <th>Changement</th>
              <th>Quantite</th>
            </tr>
			{
				operations.map((e,i) => (
				<tr>
					<td>{new Date(e.date).toLocaleDateString(
                        "fr-FR",
                        options
                      )}</td>
					  <td className={e.mvt_type === "out" ? "red-text" : "green-text" }>
						{
							e.mvt_type === "out" ? "-"+e.qt_sortie : e.qt_entree
						}
					  </td>
					  <td>
						{e.new_quantity}
					  </td>

				
				</tr>
				))
			}
			
		 </tbody>
		</table>
		</div>
			</>
		  }

		  {
			!latestQuantity && <h1>No data</h1>
		  }


		

         
          

          
	</div>
  </>
}

export default StockChange