import React, {useState,useEffect} from 'react'

function usePagination(data) {

	const [seperated,setSeperated] = useState([]);
	const [active,setActive] = useState(0);
	useEffect(() => {
		seperate();
		setActive(0);
	},[data])

	const seperate = () => {
		const limit = 20;
		let seperated_ = [];
		let temp = [];
		for (let i = 1; i <= data.length ; i++) {
		  if (i % limit ===  0){
			temp.push(data[i-1]);
			seperated_.push(temp);
			temp = [];
		  }else{
			temp.push(data[i-1]);
		  }
		}
		if (temp.length > 0) {
		  seperated_.push(temp);    
		}
		setSeperated(seperated_);
	  }

	const handleDirection = (step) => {
		let act;
		if (step > 0) {
		  act = (active + step) >= seperated.length ? 0 : active + step;
		}else {
		  act = (active + step) >= 0 ? active+step : seperated.length - 1;
		}
		console.log("steps");
		console.log(seperated.length);
		console.log(act);
		setActive(act);
	  }
	




  return [seperated,active,handleDirection]
}

export default usePagination;

