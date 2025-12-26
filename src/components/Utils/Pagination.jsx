import React from 'react'

function Pagination({ data, seperated, handleDirection, active, total_pages, current_page, isServerSide = false }) {
	const displayActive = isServerSide ? current_page : active + 1;
	const displayTotal = isServerSide ? total_pages : (seperated ? seperated.length : 0);
	const hasData = isServerSide ? (total_pages > 0) : (data && data.length > 0);

	return <>
		{
			hasData && <div className="pagination-container">
				<div className="pagination-subcontainer">
					<button className="pagination-action btn-main"
						onClick={() => handleDirection(-1)}
						disabled={isServerSide && current_page <= 1}
					>Precedent</button>
					<p className="pagination-page">
						{displayActive}/{displayTotal}
					</p>
					<button className="pagination-action btn-main"
						onClick={() => handleDirection(1)}
						disabled={isServerSide && current_page >= total_pages}
					>Suivant</button>

				</div>

			</div>
		}
	</>
}

export default Pagination