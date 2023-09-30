import React from 'react'

function Pagination({ data,seperated,handleDirection,active }) {
	return <>
		{
			data.length > 0 && <div className="pagination-container">
				<div className="pagination-subcontainer">
					<button className="pagination-action btn-main"
						onClick={() => handleDirection(-1)}
					>Precedent</button>
					<p className="pagination-page">
						{active + 1}/{seperated[active] ? seperated.length : "0"}
					</p>
					<button className="pagination-action btn-main"
						onClick={() => handleDirection(1)}
					>Suivant</button>

				</div>

			</div>
		}
	</>
}

export default Pagination