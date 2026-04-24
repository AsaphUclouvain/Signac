let localCurrentPage = 1;
let localTotalPages = 1;

function generateAvatar(uniqString){
    const size = 200;
    const png = jdenticon.toPng(uniqString, size);
    const base64 = "data:image/png;base64," + png.toString("base64");
    console.log(base64);
    return (base64);
}

function date(){
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    return today;
}

async function loadPage(page) {
    try {
        
        const response = await fetch(`/api/incident/paginate?page=${page}`);
        console.log(response);
        const data = await response.json();
        if (response.ok) {
            renderIncidents(data.incidents);
            currentPage = data.pagination.currentPage;
            totalPages = data.pagination.totalPages;
            renderPagination(data.pagination);
        } else {
            console.log(data.errorMsg);
        }
    } catch (error) {
        console.log('Erreur de chargement');
    }
}

function renderIncidents(incidents) {
    
    const container = document.querySelector('.table-body');
    if (incidents.length === 0) {
        document.querySelector(".empty-list").innerHTML = `<p>No reported incidents</p>`;
        container.innerHTML = '';
        document.querySelector('.table-section').style.height = '5rem';
        return;
    }
    
    container.innerHTML = incidents.map(incident => `
        <tr>
            <td>
                <a href="/api/user/profile?uniqueToken=${incident.uniqueToken}">
                    <div class="profile">
                        <div class="photo">
                            <img class = "photo-image" src="${incident.avatar}"/>
                        </div>
                        <div>${incident.spoiler}</div>
                    </div>
                </a>
            </td>
            <td>
                <div>${incident.description}</div>
            </td>
            <td>
                <div>${incident.address}</div>
            </td>
            <td>
                <div>${incident.date}</div>
            </td>
        </tr>
    `).join('');
}

function renderPagination(pagination) {
    const { currentPage, totalPages, hasNext, hasPrev } = pagination;
    localCurrentPage = currentPage;
    localTotalPages = totalPages;
    let html = '';
    
    if (currentPage > 2) {
        html += `<div class="pagination-btn" data-page="${1}"><<</div>`;
    }

    if (hasPrev) {
        html += `<div class="pagination-btn" data-page="${currentPage - 1}"><</div>`;
    }

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? ' active' : '';
        html += `<div class="pagination-btn${active}" data-page="${i}">${i}</div>`;
    }

    if (hasNext) {
        html += `<div class="pagination-btn" data-page="${currentPage + 1}">></div>`;
    }

    if (currentPage < totalPages - 1) {
        html += `<div class="pagination-btn" data-page="${totalPages}">>></div>`;
    }
    
    document.querySelector('.pagination').innerHTML = html;
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('pagination-btn')) {
        const page = parseInt(e.target.dataset.page);
        if (page && page !== localCurrentPage) {
            await loadPage(page);
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelector(".currentDate").innerHTML = date();
    await loadPage(1);
});