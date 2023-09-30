import React, { useRef,useState } from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { useToasts } from 'react-toast-notifications';
import { addImage, deleteReq } from '../../helper';

function UploadHandler({product,refresh}) {


	const inputRef = useRef(null);
	const [addedImage,setAddedImage] = useState(null)
	const { addToast } = useToasts();

	const handleFileChange  = event => {
		const fileObj = event.target.files && event.target.files[0];
		if (!fileObj) {
		  return;
		}
	
		console.log('fileObj is', fileObj);
	
		// 👇️ reset file input
		event.target.value = null;
	
		// 👇️ is now empty
		console.log(event.target.files);
	
		// 👇️ can still access file object here
		console.log(fileObj);
		console.log(fileObj.name);
		setAddedImage(fileObj);
	  };

	const cancel = () => {
		setAddedImage(null);
	}

	const confirm  = async  () => {
		let resp = await addImage(product.product.id,[addedImage])
		if (resp){
			addToast("uploaded",{
				appearance:"success",
				autoDismiss:true
			})
			refresh()
			setAddedImage(null);
		}else{
			addToast("Failed",{
				appearance:"error",
				autoDismiss:true
			})
		}
	}

	const delImage = async (index) => {
		let  imid = product.images[index].id
		let url = `upload/${imid}/`
		let resp = await deleteReq(url)
		if (resp){
			addToast("deleted",{
				appearance:"success",
				autoDismiss:true
			})
			refresh()
		}else{
			addToast("Failed",{
				appearance:"error",
				autoDismiss:true
			})
		}
	}
 
  return <>
	<h1 className="title-modal m20">
          {"Upload Image"}
        </h1>

		{
			product.images.length > 0 && <>
				<Carousel>
					{
						product.images.map((e,i) => (
							<div>
								<img className='carousel-img' src={e.image} />
								<button className="legend" onClick={
									() => {
										delImage(i)
									}
								}>Supprimer</button>
							</div>
						))
					}
                
                
            </Carousel>
			 </>
		}

		{
			product.images.length === 0 && <>
			<div className="modal-input-row"><h2>no images</h2></div>
				
				</>

		}

		{
			!addedImage && <div className="modal-input-row">
			<label>
				<input type="file" ref={inputRef} hidden={true} onChange={handleFileChange} />
				<button
			onClick={() => {
				inputRef.current.click();
			}}
            className="factsubmit"
            id="submit"
          >
            Ajouter
          </button>
 			</label>
          
    </div>
		}

		{
			addedImage && <div className="modal-input-row">
				
				<button
			onClick={confirm}
            className="factsubmit"
            id="submit"
          >
            Confirmer
          </button>
		  <button
			onClick={cancel}
            className="factsubmit"
            id="submit"
          >
            Annuler
          </button>

          
    </div>
		}
        
  </>
}

export default UploadHandler