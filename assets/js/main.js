
// --- Global State ---
window.allPropertiesData = [];

// --- UI Components ---
function createPropertyCard(p) {
    const precioFormatted = `${p.moneda} ${parseFloat(p.precio).toLocaleString()}`;
    const imagenUrl = (p.imagenes_propiedad && p.imagenes_propiedad.length > 0)
        ? p.imagenes_propiedad.find(img => img.es_principal)?.url_imagen || p.imagenes_propiedad[0].url_imagen
        : 'https://via.placeholder.com/500x300?text=Sin+Imagen';

    const op = p.tipo_operacion?.toLowerCase();
    let tagColor = '#1a2b4c';
    if (op === 'venta') tagColor = '#c5a47e';
    if (op === 'alquiler') tagColor = '#17a2b8';

    const favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
    const isFav = favorites.includes(p.id.toString());

    return `
    <div class="property-card" onclick="window.location.href='propiedad-detalle.html?id=${p.id}'">
        <div class="card-image">
            <div class="card-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, this, '${p.id}')">
                <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </div>
            <span class="card-tag" style="background-color: ${tagColor};">${p.tipo_operacion?.toUpperCase()}</span>
            <img src="${imagenUrl}" alt="${p.titulo}" class="active" style="object-fit:cover; height:200px; width:100%;">
        </div>
        <div class="card-info">
            <h3 class="card-title">${p.titulo}</h3>
            <div class="card-price">${precioFormatted}</div>
            <div class="card-details">
                <span><i class="fa-solid fa-bed"></i> ${p.dormitorios || 0}</span>
                <span><i class="fa-solid fa-bath"></i> ${p.banos || 0}</span>
                <span><i class="fa-solid fa-ruler-combined"></i> ${p.superficie_total || 0}m²</span>
            </div>
        </div>
    </div>`;
}

// --- Global Functions ---
window.toggleFavorite = (ev, el, id) => {
    ev.stopPropagation();
    ev.preventDefault();
    const user = localStorage.getItem('userSession');
    if (!user) {
        Swal.fire({ title: 'Inicia sesión', text: "Debes ingresar para guardar favoritos.", icon: 'info' });
        return;
    }
    el.classList.toggle('active');
    const isFav = el.classList.contains('active');
    const icon = el.querySelector('i');
    icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

    let favs = JSON.parse(localStorage.getItem('userFavorites')) || [];
    if (isFav) { if (!favs.includes(id)) favs.push(id); }
    else { favs = favs.filter(f => f !== id); }
    localStorage.setItem('userFavorites', JSON.stringify(favs));
};

window.openTab = (evt, tabName) => {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    if (evt) evt.currentTarget.classList.add('active');
};

window.activateTabAndScroll = (tabName) => {
    const el = document.querySelector('.tabs-container');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    window.openTab(null, tabName);
    const btn = document.getElementById(`tab-${tabName}`);
    if (btn) btn.classList.add('active');
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    const userMenuText = document.getElementById('user-menu-text');
    const loginBtn = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-link');
    const loginModal = document.getElementById('loginModal');

    // Auth Session Check
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    if (session && session.user) {
        if (userMenuText) userMenuText.innerText = session.user.nombre.split(' ')[0];
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    }

    // Modal Toggles
    if (loginBtn) loginBtn.onclick = (e) => { e.preventDefault(); loginModal.style.display = 'flex'; };
    if (logoutBtn) logoutBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('userSession');
        location.reload();
    };

    const closeModal = document.querySelector('.close-modal');
    if (closeModal) closeModal.onclick = () => loginModal.style.display = 'none';

    const goToReg = document.getElementById('go-to-register');
    const goToLog = document.getElementById('go-to-login');
    if (goToReg) goToReg.onclick = (e) => {
        e.preventDefault();
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('register-container').style.display = 'block';
    };
    if (goToLog) goToLog.onclick = (e) => {
        e.preventDefault();
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
    };

    // Forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('userSession', JSON.stringify(data));
            location.reload();
        } else {
            const err = document.getElementById('login-error');
            err.innerText = data.error;
            err.style.display = 'block';
        }
    };

    // --- Search Logic ---
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('search-results-section');
    const searchGrid = document.getElementById('search-results-grid');
    const tabsHeader = document.querySelector('.tabs-header');

    window.performSearch = (query) => {
        query = query.toLowerCase().trim();
        if (query === '') {
            if (searchResults) searchResults.style.display = 'none';
            if (tabsHeader) tabsHeader.style.display = 'flex';
            window.openTab(null, 'destacados');
            const firstBtn = document.querySelector('.tab-btn');
            if (firstBtn) firstBtn.classList.add('active');
            return;
        }
        if (tabsHeader) tabsHeader.style.display = 'none';
        document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
        if (searchResults) searchResults.style.display = 'block';

        const matches = window.allPropertiesData.filter(p => {
            const searchStr = `${p.titulo || ''} ${p.barrio || ''} ${p.tipo_inmueble || ''} ${p.tipo_operacion || ''} ${p.descripcion || ''} ${p.precio || ''} ${p.moneda || ''}`.toLowerCase();
            return searchStr.includes(query);
        });

        if (searchGrid) {
            searchGrid.innerHTML = matches.map(m => createPropertyCard(m)).join('');
            const noResults = document.getElementById('no-results');
            if (noResults) noResults.style.display = matches.length ? 'none' : 'block';
            searchGrid.style.display = matches.length ? 'grid' : 'none';
        }
    };

    if (searchInput) {
        searchInput.oninput = (e) => window.performSearch(e.target.value);
    }
    if (searchForm) {
        searchForm.onsubmit = (e) => {
            e.preventDefault();
            window.performSearch(searchInput.value);
        };
    }

    // --- Load Data ---
    try {
        const res = await fetch('/api/propiedades');
        const props = await res.json();
        window.allPropertiesData = props;

        const containers = {
            destacados: document.querySelector('#destacados .properties-grid'),
            oportunidades: document.querySelector('#oportunidades .properties-grid'),
            alquileres: document.querySelector('#alquileres .properties-grid'),
            nuevos: document.querySelector('#nuevos .properties-grid')
        };

        Object.values(containers).forEach(c => { if (c) c.innerHTML = ''; });

        props.forEach(p => {
            const card = createPropertyCard(p);
            if (containers.nuevos) containers.nuevos.innerHTML += card;
            if (p.destacada && containers.destacados) containers.destacados.innerHTML += card;
            if (p.tipo_operacion?.toLowerCase() === 'venta' && containers.oportunidades) containers.oportunidades.innerHTML += card;
            if (p.tipo_operacion?.toLowerCase() === 'alquiler' && containers.alquileres) containers.alquileres.innerHTML += card;
        });
    } catch (e) {
        console.error(e);
    }
});
