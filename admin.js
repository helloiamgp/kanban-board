// ============ Data Management ============

const JSON_FILES = {
    COMPANIES: './data/companies.json',
    TASKS: './data/tasks.json',
    CONFIG: './data/config.json'
};

// Default data structures (same as kanban-board.html)
const DEFAULT_COMPANIES = {
    companies: []
};

const DEFAULT_CONFIG = {
    changeTypes: [],
    riskLevels: [],
    impactLevels: [],
    priorities: [],
    categories: []
};

const DEFAULT_TASKS = {
    tasks: []
};

// Global data holders
let companiesData = DEFAULT_COMPANIES;
let configData = DEFAULT_CONFIG;
let tasksData = DEFAULT_TASKS;

// Current editing context
let currentCompanyIndex = -1;
let currentDepartmentIndex = -1;
let currentPersonIndex = -1;
let currentConfigType = '';
let currentConfigItemIndex = -1;

// ============ File Operations ============

async function loadJSONFile(url, defaultData) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`${url} bulunamadı, varsayılan veri kullanılıyor`);
            return defaultData;
        }
        return await response.json();
    } catch (error) {
        console.warn(`${url} yüklenemedi:`, error.message);
        return defaultData;
    }
}

function downloadJSON(filename, data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function loadAllData() {
    console.log('Veriler yükleniyor...');

    companiesData = await loadJSONFile(JSON_FILES.COMPANIES, DEFAULT_COMPANIES);
    configData = await loadJSONFile(JSON_FILES.CONFIG, DEFAULT_CONFIG);
    tasksData = await loadJSONFile(JSON_FILES.TASKS, DEFAULT_TASKS);

    console.log('Veri yükleme tamamlandı');

    renderAll();
}

function renderAll() {
    renderCompanies();
    renderConfig();
    updateDataSummary();
}

// ============ Section Switching ============

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');
}

// ============ Companies Management ============

function renderCompanies() {
    const container = document.getElementById('companiesList');

    if (!companiesData.companies || companiesData.companies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <div class="empty-state-text">Henüz şirket eklenmemiş</div>
                <div class="empty-state-subtext">Yeni şirket eklemek için yukarıdaki butona tıklayın</div>
            </div>
        `;
        return;
    }

    let html = '<table><thead><tr><th>ID</th><th>Şirket Adı</th><th>Departman Sayısı</th><th>Personel Sayısı</th><th>İşlemler</th></tr></thead><tbody>';

    companiesData.companies.forEach((company, index) => {
        const deptCount = company.departments ? company.departments.length : 0;
        const personCount = company.departments ?
            company.departments.reduce((sum, dept) => sum + (dept.persons ? dept.persons.length : 0), 0) : 0;

        html += `
            <tr>
                <td>${company.id}</td>
                <td><strong>${company.name}</strong></td>
                <td><span class="badge badge-info">${deptCount} Departman</span></td>
                <td><span class="badge badge-success">${personCount} Personel</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="editCompany(${index})">Düzenle</button>
                        <button class="btn btn-danger" onclick="deleteCompany(${index})">Sil</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function openCompanyModal() {
    currentCompanyIndex = -1;
    document.getElementById('companyModalTitle').textContent = 'Yeni Şirket';
    document.getElementById('companyId').value = '';
    document.getElementById('companyName').value = '';
    document.getElementById('departmentsList').innerHTML = '<div class="empty-state-text" style="padding: 20px; color: #95a5a6;">Henüz departman eklenmemiş</div>';
    document.getElementById('companyModal').classList.add('active');
}

function editCompany(index) {
    currentCompanyIndex = index;
    const company = companiesData.companies[index];

    document.getElementById('companyModalTitle').textContent = 'Şirketi Düzenle';
    document.getElementById('companyId').value = company.id;
    document.getElementById('companyName').value = company.name;

    renderDepartmentsInModal(company.departments || []);
    document.getElementById('companyModal').classList.add('active');
}

function closeCompanyModal() {
    document.getElementById('companyModal').classList.remove('active');
    currentCompanyIndex = -1;
}

function saveCompany() {
    const name = document.getElementById('companyName').value.trim();

    if (!name) {
        alert('Lütfen şirket adını girin!');
        return;
    }

    const departments = [];
    const deptElements = document.querySelectorAll('#departmentsList .nested-item');
    deptElements.forEach(el => {
        const deptIndex = parseInt(el.dataset.index);
        if (currentCompanyIndex >= 0) {
            departments.push(companiesData.companies[currentCompanyIndex].departments[deptIndex]);
        }
    });

    if (currentCompanyIndex >= 0) {
        // Edit existing
        companiesData.companies[currentCompanyIndex].name = name;
        companiesData.companies[currentCompanyIndex].departments = departments;
    } else {
        // Create new
        const newId = companiesData.companies.length > 0
            ? Math.max(...companiesData.companies.map(c => c.id)) + 1
            : 1;

        companiesData.companies.push({
            id: newId,
            name: name,
            departments: []
        });
    }

    downloadJSON('companies.json', companiesData);
    renderCompanies();
    closeCompanyModal();
}

function deleteCompany(index) {
    if (confirm('Bu şirketi silmek istediğinizden emin misiniz? Tüm departmanlar ve personel de silinecektir!')) {
        companiesData.companies.splice(index, 1);
        downloadJSON('companies.json', companiesData);
        renderCompanies();
    }
}

// ============ Departments Management ============

function renderDepartmentsInModal(departments) {
    const container = document.getElementById('departmentsList');

    if (!departments || departments.length === 0) {
        container.innerHTML = '<div class="empty-state-text" style="padding: 20px; color: #95a5a6;">Henüz departman eklenmemiş</div>';
        return;
    }

    let html = '';
    departments.forEach((dept, index) => {
        const personCount = dept.persons ? dept.persons.length : 0;
        html += `
            <div class="nested-item" data-index="${index}">
                <div class="nested-item-info">
                    <div class="nested-item-name">${dept.name}</div>
                    <div class="nested-item-detail">ID: ${dept.id} • ${personCount} Personel</div>
                </div>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" onclick="editDepartment(${index})">Düzenle</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDepartment(${index})">Sil</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function openDepartmentModal() {
    if (currentCompanyIndex < 0) {
        alert('Lütfen önce şirketi kaydedin!');
        return;
    }

    currentDepartmentIndex = -1;
    document.getElementById('departmentModalTitle').textContent = 'Yeni Departman';
    document.getElementById('departmentId').value = '';
    document.getElementById('departmentName').value = '';
    document.getElementById('personsList').innerHTML = '<div class="empty-state-text" style="padding: 20px; color: #95a5a6;">Henüz personel eklenmemiş</div>';
    document.getElementById('departmentModal').classList.add('active');
}

function editDepartment(index) {
    currentDepartmentIndex = index;
    const dept = companiesData.companies[currentCompanyIndex].departments[index];

    document.getElementById('departmentModalTitle').textContent = 'Departmanı Düzenle';
    document.getElementById('departmentId').value = dept.id;
    document.getElementById('departmentName').value = dept.name;

    renderPersonsInModal(dept.persons || []);
    document.getElementById('departmentModal').classList.add('active');
}

function closeDepartmentModal() {
    document.getElementById('departmentModal').classList.remove('active');
    currentDepartmentIndex = -1;
}

function saveDepartment() {
    const name = document.getElementById('departmentName').value.trim();

    if (!name) {
        alert('Lütfen departman adını girin!');
        return;
    }

    const persons = [];
    const personElements = document.querySelectorAll('#personsList .nested-item');
    personElements.forEach(el => {
        const personIndex = parseInt(el.dataset.index);
        if (currentDepartmentIndex >= 0) {
            persons.push(companiesData.companies[currentCompanyIndex].departments[currentDepartmentIndex].persons[personIndex]);
        }
    });

    if (!companiesData.companies[currentCompanyIndex].departments) {
        companiesData.companies[currentCompanyIndex].departments = [];
    }

    if (currentDepartmentIndex >= 0) {
        // Edit existing
        companiesData.companies[currentCompanyIndex].departments[currentDepartmentIndex].name = name;
        companiesData.companies[currentCompanyIndex].departments[currentDepartmentIndex].persons = persons;
    } else {
        // Create new
        const depts = companiesData.companies[currentCompanyIndex].departments;
        const newId = depts.length > 0
            ? Math.max(...depts.map(d => d.id)) + 1
            : (currentCompanyIndex + 1) * 100 + 1;

        depts.push({
            id: newId,
            name: name,
            persons: []
        });
    }

    renderDepartmentsInModal(companiesData.companies[currentCompanyIndex].departments);
    closeDepartmentModal();
}

function deleteDepartment(index) {
    if (confirm('Bu departmanı silmek istediğinizden emin misiniz? Tüm personel de silinecektir!')) {
        companiesData.companies[currentCompanyIndex].departments.splice(index, 1);
        renderDepartmentsInModal(companiesData.companies[currentCompanyIndex].departments);
    }
}

// ============ Persons Management ============

function renderPersonsInModal(persons) {
    const container = document.getElementById('personsList');

    if (!persons || persons.length === 0) {
        container.innerHTML = '<div class="empty-state-text" style="padding: 20px; color: #95a5a6;">Henüz personel eklenmemiş</div>';
        return;
    }

    let html = '';
    persons.forEach((person, index) => {
        html += `
            <div class="nested-item" data-index="${index}">
                <div class="nested-item-info">
                    <div class="nested-item-name">${person.name}</div>
                    <div class="nested-item-detail">ID: ${person.id} • ${person.email}</div>
                </div>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" onclick="editPerson(${index})">Düzenle</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePerson(${index})">Sil</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function openPersonModal() {
    if (currentDepartmentIndex < 0) {
        alert('Lütfen önce departmanı kaydedin!');
        return;
    }

    currentPersonIndex = -1;
    document.getElementById('personModalTitle').textContent = 'Yeni Personel';
    document.getElementById('personId').value = '';
    document.getElementById('personName').value = '';
    document.getElementById('personEmail').value = '';
    document.getElementById('personModal').classList.add('active');
}

function editPerson(index) {
    currentPersonIndex = index;
    const person = companiesData.companies[currentCompanyIndex].departments[currentDepartmentIndex].persons[index];

    document.getElementById('personModalTitle').textContent = 'Personeli Düzenle';
    document.getElementById('personId').value = person.id;
    document.getElementById('personName').value = person.name;
    document.getElementById('personEmail').value = person.email;
    document.getElementById('personModal').classList.add('active');
}

function closePersonModal() {
    document.getElementById('personModal').classList.remove('active');
    currentPersonIndex = -1;
}

function savePerson() {
    const name = document.getElementById('personName').value.trim();
    const email = document.getElementById('personEmail').value.trim();

    if (!name) {
        alert('Lütfen personel adını girin!');
        return;
    }

    if (!email) {
        alert('Lütfen e-posta adresini girin!');
        return;
    }

    const dept = companiesData.companies[currentCompanyIndex].departments[currentDepartmentIndex];
    if (!dept.persons) {
        dept.persons = [];
    }

    if (currentPersonIndex >= 0) {
        // Edit existing
        dept.persons[currentPersonIndex].name = name;
        dept.persons[currentPersonIndex].email = email;
    } else {
        // Create new
        const newId = dept.persons.length > 0
            ? Math.max(...dept.persons.map(p => p.id)) + 1
            : (currentCompanyIndex + 1) * 1000 + (currentDepartmentIndex + 1) * 10 + 1;

        dept.persons.push({
            id: newId,
            name: name,
            email: email
        });
    }

    renderPersonsInModal(dept.persons);
    closePersonModal();
}

function deletePerson(index) {
    if (confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
        companiesData.companies[currentCompanyIndex].departments[currentDepartmentIndex].persons.splice(index, 1);
        renderPersonsInModal(companiesData.companies[currentCompanyIndex].departments[currentDepartmentIndex].persons);
    }
}

// ============ Configuration Management ============

function renderConfig() {
    renderConfigList('changeTypes', 'changeTypesList');
    renderConfigList('riskLevels', 'riskLevelsList');
    renderConfigList('impactLevels', 'impactLevelsList');
    renderConfigList('priorities', 'prioritiesList');
    renderConfigList('categories', 'categoriesList');
}

function renderConfigList(type, containerId) {
    const container = document.getElementById(containerId);
    const items = configData[type] || [];

    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state-text" style="padding: 20px; color: #95a5a6;">Henüz öğe eklenmemiş</div>';
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        html += `
            <div class="nested-item">
                <div class="nested-item-info">
                    <div class="nested-item-name">${item.name}</div>
                    <div class="nested-item-detail">ID: ${item.id}</div>
                </div>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" onclick="editConfigItem('${type}', ${index})">Düzenle</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteConfigItem('${type}', ${index})">Sil</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function openConfigModal(type) {
    currentConfigType = type;
    currentConfigItemIndex = -1;

    const titles = {
        changeTypes: 'Yeni Change Tipi',
        riskLevels: 'Yeni Risk Seviyesi',
        impactLevels: 'Yeni Etki Seviyesi',
        priorities: 'Yeni Öncelik',
        categories: 'Yeni Kategori'
    };

    document.getElementById('configModalTitle').textContent = titles[type];
    document.getElementById('configType').value = type;
    document.getElementById('configItemIdValue').value = '';
    document.getElementById('configItemName').value = '';
    document.getElementById('configModal').classList.add('active');
}

function editConfigItem(type, index) {
    currentConfigType = type;
    currentConfigItemIndex = index;
    const item = configData[type][index];

    const titles = {
        changeTypes: 'Change Tipini Düzenle',
        riskLevels: 'Risk Seviyesini Düzenle',
        impactLevels: 'Etki Seviyesini Düzenle',
        priorities: 'Önceliği Düzenle',
        categories: 'Kategoriyi Düzenle'
    };

    document.getElementById('configModalTitle').textContent = titles[type];
    document.getElementById('configType').value = type;
    document.getElementById('configItemIdValue').value = item.id;
    document.getElementById('configItemName').value = item.name;
    document.getElementById('configModal').classList.add('active');
}

function closeConfigModal() {
    document.getElementById('configModal').classList.remove('active');
    currentConfigType = '';
    currentConfigItemIndex = -1;
}

function saveConfigItem() {
    const type = document.getElementById('configType').value;
    const id = document.getElementById('configItemIdValue').value.trim();
    const name = document.getElementById('configItemName').value.trim();

    if (!id || !name) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    if (!configData[type]) {
        configData[type] = [];
    }

    if (currentConfigItemIndex >= 0) {
        // Edit existing
        configData[type][currentConfigItemIndex].id = id;
        configData[type][currentConfigItemIndex].name = name;
    } else {
        // Create new
        configData[type].push({ id, name });
    }

    downloadJSON('config.json', configData);
    renderConfig();
    closeConfigModal();
}

function deleteConfigItem(type, index) {
    if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
        configData[type].splice(index, 1);
        downloadJSON('config.json', configData);
        renderConfig();
    }
}

// ============ Import/Export ============

function exportAllData() {
    downloadJSON('companies.json', companiesData);
    downloadJSON('config.json', configData);
    downloadJSON('tasks.json', tasksData);
    alert('Tüm dosyalar indirildi!');
}

function importFile(input, type) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            switch(type) {
                case 'companies':
                    companiesData = data;
                    renderCompanies();
                    break;
                case 'config':
                    configData = data;
                    renderConfig();
                    break;
                case 'tasks':
                    tasksData = data;
                    break;
            }

            updateDataSummary();
            alert(`${file.name} başarıyla yüklendi!`);
        } catch (error) {
            alert('Dosya okunamadı! Geçerli bir JSON dosyası seçtiğinizden emin olun.');
            console.error(error);
        }
    };

    reader.readAsText(file);
    input.value = ''; // Reset input
}

function updateDataSummary() {
    const companyCount = companiesData.companies ? companiesData.companies.length : 0;
    const deptCount = companiesData.companies ?
        companiesData.companies.reduce((sum, c) => sum + (c.departments ? c.departments.length : 0), 0) : 0;
    const personCount = companiesData.companies ?
        companiesData.companies.reduce((sum, c) =>
            sum + (c.departments ? c.departments.reduce((s, d) => s + (d.persons ? d.persons.length : 0), 0) : 0), 0) : 0;
    const taskCount = tasksData.tasks ? tasksData.tasks.length : 0;

    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e1e8ed;">
                <div style="font-size: 32px; font-weight: 700; color: #0066cc;">${companyCount}</div>
                <div style="color: #7f8c8d; margin-top: 4px;">Şirket</div>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e1e8ed;">
                <div style="font-size: 32px; font-weight: 700; color: #48bb78;">${deptCount}</div>
                <div style="color: #7f8c8d; margin-top: 4px;">Departman</div>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e1e8ed;">
                <div style="font-size: 32px; font-weight: 700; color: #f39c12;">${personCount}</div>
                <div style="color: #7f8c8d; margin-top: 4px;">Personel</div>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e1e8ed;">
                <div style="font-size: 32px; font-weight: 700; color: #e74c3c;">${taskCount}</div>
                <div style="color: #7f8c8d; margin-top: 4px;">Görev</div>
            </div>
        </div>
    `;

    document.getElementById('dataSummary').innerHTML = html;
}

// ============ Initialize ============

document.addEventListener('DOMContentLoaded', async function() {
    await loadAllData();
});
