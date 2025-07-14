/**
 * === LÓGICA DEL PANEL DE ADMINISTRADOR ===
 * Maneja todas las funciones administrativas del portal
 */

// Variables globales
let currentData = {
    users: {},
    companies: {},
    projects: {},
    assignments: {}
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación de administrador
    if (!window.AuthSys.requireAdmin()) {
        return;
    }

    initializeAdminPanel();
    setupEventListeners();
    loadAllData();
});

// === INICIALIZACIÓN ===
function initializeAdminPanel() {
    const currentUser = window.AuthSys.getCurrentUser();
    if (currentUser) {
        document.getElementById('adminUserName').textContent = currentUser.name;
    }

    // Mostrar mensaje de bienvenida
    window.NotificationUtils.success('Bienvenido al panel de administración', 3000);
}

function setupEventListeners() {
    // Formularios
    document.getElementById('userForm').addEventListener('submit', handleCreateUser);
    document.getElementById('companyForm').addEventListener('submit', handleCreateCompany);
    document.getElementById('projectForm').addEventListener('submit', handleCreateProject);

    // Cerrar modales con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Auto-actualización cada 30 segundos
    setInterval(loadAllData, 30000);
}

// === GESTIÓN DE USUARIOS ===
function handleCreateUser(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre es requerido');
        return;
    }

    const userData = {
        name: name,
        email: email,
        role: 'consultor'
    };

    const result = window.PortalDB.createUser(userData);
    
    if (result.success) {
        window.NotificationUtils.success(
            `Usuario creado exitosamente!\nID: ${result.user.id}\nContraseña: ${result.user.password}`,
            8000
        );
        
        // Mostrar credenciales en modal separado
        showUserCredentials(result.user);
        
        closeModal('userModal');
        document.getElementById('userForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear usuario: ' + result.message);
    }
}

function showUserCredentials(user) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">✅ Usuario Creado Exitosamente</h2>
                <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="p-3">
                <div class="message message-success">
                    <strong>Credenciales del nuevo usuario:</strong>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Nombre:</strong> ${user.name}</p>
                    <p><strong>ID de Usuario:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${user.id}</code></p>
                    <p><strong>Contraseña Temporal:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${user.password}</code></p>
                    ${user.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
                </div>
                <div class="message message-warning">
                    <strong>Importante:</strong> Comparta estas credenciales de forma segura con el usuario. Se recomienda que cambie la contraseña en su primer acceso.
                </div>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Entendido</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function deleteUser(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario? Esta acción eliminará también todas sus asignaciones.')) {
        return;
    }

    const result = window.PortalDB.deleteUser(userId);
    
    if (result.success) {
        window.NotificationUtils.success('Usuario eliminado correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar usuario: ' + result.message);
    }
}

// === GESTIÓN DE EMPRESAS ===
function handleCreateCompany(e) {
    e.preventDefault();
    
    const name = document.getElementById('companyName').value.trim();
    const description = document.getElementById('companyDescription').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre de la empresa es requerido');
        return;
    }

    const companyData = {
        name: name,
        description: description
    };

    const result = window.PortalDB.createCompany(companyData);
    
    if (result.success) {
        window.NotificationUtils.success(`Empresa "${name}" registrada con ID: ${result.company.id}`);
        closeModal('companyModal');
        document.getElementById('companyForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al registrar empresa: ' + result.message);
    }
}

function deleteCompany(companyId) {
    if (!confirm('¿Está seguro de eliminar esta empresa? Se eliminarán también todas las asignaciones relacionadas.')) {
        return;
    }

    const result = window.PortalDB.deleteCompany(companyId);
    
    if (result.success) {
        window.NotificationUtils.success('Empresa eliminada correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar empresa: ' + result.message);
    }
}

// === GESTIÓN DE PROYECTOS ===
function handleCreateProject(e) {
    e.preventDefault();
    
    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const status = document.getElementById('projectStatus').value;
    
    if (!name) {
        window.NotificationUtils.error('El nombre del proyecto es requerido');
        return;
    }

    const projectData = {
        name: name,
        description: description,
        status: status
    };

    const result = window.PortalDB.createProject(projectData);
    
    if (result.success) {
        window.NotificationUtils.success(`Proyecto "${name}" creado con ID: ${result.project.id}`);
        closeModal('projectModal');
        document.getElementById('projectForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear proyecto: ' + result.message);
    }
}

function deleteProject(projectId) {
    if (!confirm('¿Está seguro de eliminar este proyecto? Se eliminarán también todas las asignaciones relacionadas.')) {
        return;
    }

    const result = window.PortalDB.deleteProject(projectId);
    
    if (result.success) {
        window.NotificationUtils.success('Proyecto eliminado correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar proyecto: ' + result.message);
    }
}

// === GESTIÓN DE ASIGNACIONES ===
function createAssignment() {
    const userId = document.getElementById('assignUser').value;
    const companyId = document.getElementById('assignCompany').value;
    const projectId = document.getElementById('assignProject').value;
    const reportType = document.getElementById('assignReportType').value;
    
    if (!userId || !companyId || !projectId || !reportType) {
        window.NotificationUtils.error('Todos los campos son requeridos para crear una asignación');
        return;
    }

    const assignmentData = {
        userId: userId,
        companyId: companyId,
        projectId: projectId,
        reportType: reportType
    };

    const result = window.PortalDB.createAssignment(assignmentData);
    
    if (result.success) {
        const user = currentData.users[userId];
        const company = currentData.companies[companyId];
        const project = currentData.projects[projectId];
        
        window.NotificationUtils.success(
            `Asignación creada: ${user.name} → ${company.name} (${project.name})`
        );
        
        // Limpiar formulario
        document.getElementById('assignUser').value = '';
        document.getElementById('assignCompany').value = '';
        document.getElementById('assignProject').value = '';
        document.getElementById('assignReportType').value = '';
        
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear asignación: ' + result.message);
    }
}

function deleteAssignment(assignmentId) {
    if (!confirm('¿Está seguro de eliminar esta asignación?')) {
        return;
    }

    const result = window.PortalDB.deleteAssignment(assignmentId);
    
    if (result.success) {
        window.NotificationUtils.success('Asignación eliminada correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar asignación: ' + result.message);
    }
}

// === CARGA Y ACTUALIZACIÓN DE DATOS ===
function loadAllData() {
    currentData.users = window.PortalDB.getUsers();
    currentData.companies = window.PortalDB.getCompanies();
    currentData.projects = window.PortalDB.getProjects();
    currentData.assignments = window.PortalDB.getAssignments();
    
    updateUI();
}

function updateUI() {
    updateStats();
    updateUsersList();
    updateCompaniesList();
    updateProjectsList();
    updateAssignmentsList();
    updateDropdowns();
}

function updateStats() {
    const stats = window.PortalDB.getStats();
    
    document.getElementById('usersCount').textContent = stats.totalUsers;
    document.getElementById('companiesCount').textContent = stats.totalCompanies;
    document.getElementById('projectsCount').textContent = stats.totalProjects;
    document.getElementById('assignmentsCount').textContent = stats.totalAssignments;
}

function updateUsersList() {
    const container = document.getElementById('usersList');
    const consultorUsers = Object.values(currentData.users).filter(user => user.role === 'consultor');
    
    if (consultorUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <div class="empty-state-title">No hay usuarios</div>
                <div class="empty-state-desc">Cree el primer usuario consultor</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    consultorUsers.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'item hover-lift';
        
        const assignedCompany = user.assignedCompany ? currentData.companies[user.assignedCompany]?.name : 'Sin asignar';
        const assignedProject = user.assignedProject ? currentData.projects[user.assignedProject]?.name : 'Sin asignar';
        
        userDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${user.id}</span>
                    <strong>${user.name}</strong>
                    <span class="status-indicator ${user.isActive ? 'status-active' : 'status-inactive'}"></span>
                </div>
                <small style="color: #666;">
                    📧 ${user.email || 'Sin email'} | 
                    🏢 ${assignedCompany} | 
                    📋 ${assignedProject}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteUser('${user.id}')" title="Eliminar usuario">
                🗑️
            </button>
        `;
        container.appendChild(userDiv);
    });
}

function updateCompaniesList() {
    const container = document.getElementById('companiesList');
    const companies = Object.values(currentData.companies);
    
    if (companies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <div class="empty-state-title">No hay empresas</div>
                <div class="empty-state-desc">Registre la primera empresa cliente</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    companies.forEach(company => {
        const companyDiv = document.createElement('div');
        companyDiv.className = 'item hover-lift';
        companyDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${company.id}</span>
                    <strong>${company.name}</strong>
                </div>
                <small style="color: #666;">
                    📅 Registrada: ${window.DateUtils.formatDate(company.createdAt)}
                    ${company.description ? `<br>📝 ${window.TextUtils.truncate(company.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteCompany('${company.id}')" title="Eliminar empresa">
                🗑️
            </button>
        `;
        container.appendChild(companyDiv);
    });
}

function updateProjectsList() {
    const container = document.getElementById('projectsList');
    const projects = Object.values(currentData.projects);
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">No hay proyectos</div>
                <div class="empty-state-desc">Cree el primer proyecto</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'item hover-lift';
        
        const statusColors = {
            'Planificación': '#f39c12',
            'En Progreso': '#2ecc71',
            'En Pausa': '#e74c3c',
            'Completado': '#27ae60'
        };
        
        projectDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${project.id}</span>
                    <strong>${project.name}</strong>
                    <span class="custom-badge" style="background: ${statusColors[project.status]}20; color: ${statusColors[project.status]}; border-color: ${statusColors[project.status]};">
                        ${project.status}
                    </span>
                </div>
                <small style="color: #666;">
                    📅 Creado: ${window.DateUtils.formatDate(project.createdAt)}
                    ${project.description ? `<br>📝 ${window.TextUtils.truncate(project.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteProject('${project.id}')" title="Eliminar proyecto">
                🗑️
            </button>
        `;
        container.appendChild(projectDiv);
    });
}

function updateAssignmentsList() {
    const container = document.getElementById('assignmentsList');
    const recentContainer = document.getElementById('recentAssignments');
    const assignments = Object.values(currentData.assignments);
    
    if (assignments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔗</div>
                <div class="empty-state-title">No hay asignaciones</div>
                <div class="empty-state-desc">Las asignaciones creadas aparecerán en esta lista</div>
            </div>
        `;
        
        recentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <div class="empty-state-title">Sin asignaciones</div>
                <div class="empty-state-desc">Las asignaciones recientes aparecerán aquí</div>
            </div>
        `;
        return;
    }
    
    // Lista completa de asignaciones
    container.innerHTML = '';
    assignments.forEach(assignment => {
        const user = currentData.users[assignment.userId];
        const company = currentData.companies[assignment.companyId];
        const project = currentData.projects[assignment.projectId];
        
        if (user && company && project) {
            const assignmentDiv = document.createElement('div');
            assignmentDiv.className = 'assignment-item';
            assignmentDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <strong>👤 ${user.name}</strong>
                            <span class="item-id">${user.id}</span>
                        </div>
                        <div style="color: #666; font-size: 14px; line-height: 1.4;">
                            🏢 <strong>Empresa:</strong> ${company.name}<br>
                            📋 <strong>Proyecto:</strong> ${project.name}<br>
                            📊 <strong>Reporte:</strong> ${assignment.reportType}<br>
                            📅 <strong>Asignado:</strong> ${window.DateUtils.formatRelativeTime(assignment.createdAt)}
                        </div>
                    </div>
                    <button class="delete-btn" onclick="deleteAssignment('${assignment.id}')" title="Eliminar asignación">
                        🗑️
                    </button>
                </div>
            `;
            container.appendChild(assignmentDiv);
        }
    });
    
    // Asignaciones recientes (últimas 3)
    const recentAssignments = assignments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    
    recentContainer.innerHTML = '';
    recentAssignments.forEach(assignment => {
        const user = currentData.users[assignment.userId];
        const company = currentData.companies[assignment.companyId];
        
        if (user && company) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item hover-lift';
            itemDiv.innerHTML = `
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <strong>${user.name}</strong>
                        <span class="item-id">${user.id}</span>
                    </div>
                    <small style="color: #666;">
                        🏢 ${company.name} | 📊 ${assignment.reportType}
                    </small>
                </div>
                <span class="custom-badge badge-info">
                    ${window.DateUtils.formatRelativeTime(assignment.createdAt)}
                </span>
            `;
            recentContainer.appendChild(itemDiv);
        }
    });
}

function updateDropdowns() {
    // Dropdown de usuarios
    const userSelect = document.getElementById('assignUser');
    userSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
    
    Object.values(currentData.users).forEach(user => {
        if (user.role === 'consultor') {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.id})`;
            // Marcar si ya tiene asignación
            if (user.assignedCompany) {
                option.textContent += ' - Ya asignado';
                option.style.color = '#666';
            }
            userSelect.appendChild(option);
        }
    });

    // Dropdown de empresas
    const companySelect = document.getElementById('assignCompany');
    companySelect.innerHTML = '<option value="">Seleccionar empresa</option>';
    
    Object.values(currentData.companies).forEach(company => {
        const option = document.createElement('option');
        option.value = company.id;
        option.textContent = `${company.name} (${company.id})`;
        companySelect.appendChild(option);
    });

    // Dropdown de proyectos
    const projectSelect = document.getElementById('assignProject');
    projectSelect.innerHTML = '<option value="">Seleccionar proyecto</option>';
    
    Object.values(currentData.projects).forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = `${project.name} (${project.id})`;
        projectSelect.appendChild(option);
    });
}

// === GESTIÓN DE MODALES ===
function openUserModal() {
    document.getElementById('userName').focus();
    window.ModalUtils.open('userModal');
}

function openCompanyModal() {
    document.getElementById('companyName').focus();
    window.ModalUtils.open('companyModal');
}

function openProjectModal() {
    document.getElementById('projectName').focus();
    window.ModalUtils.open('projectModal');
}

function closeModal(modalId) {
    window.ModalUtils.close(modalId);
}

function closeAllModals() {
    window.ModalUtils.closeAll();
}

// === FUNCIONES DE UTILIDAD ===
function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        window.AuthSys.logout();
    }
}

function exportData() {
    try {
        const data = window.PortalDB.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `arvic-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.NotificationUtils.success('Datos exportados correctamente');
    } catch (error) {
        window.NotificationUtils.error('Error al exportar datos: ' + error.message);
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const result = window.PortalDB.importData(e.target.result);
                if (result.success) {
                    window.NotificationUtils.success('Datos importados correctamente');
                    loadAllData();
                } else {
                    window.NotificationUtils.error('Error al importar: ' + result.message);
                }
            } catch (error) {
                window.NotificationUtils.error('Archivo inválido');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// === BÚSQUEDA Y FILTROS ===
function setupSearchAndFilters() {
    // Agregar campos de búsqueda dinámicamente
    const searchHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin-bottom: 15px;">🔍 Búsqueda y Filtros</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <input type="text" id="searchUsers" placeholder="Buscar usuarios..." 
                       style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" id="searchCompanies" placeholder="Buscar empresas..." 
                       style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" id="searchProjects" placeholder="Buscar proyectos..." 
                       style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
                <select id="filterStatus" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">Todos los estados</option>
                    <option value="Planificación">Planificación</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="En Pausa">En Pausa</option>
                    <option value="Completado">Completado</option>
                </select>
            </div>
        </div>
    `;
    
    // Insertar después del título del admin
    const adminTitle = document.querySelector('.admin-title');
    if (adminTitle) {
        adminTitle.insertAdjacentHTML('afterend', searchHTML);
        
        // Agregar event listeners para búsqueda en tiempo real
        document.getElementById('searchUsers').addEventListener('input', filterUsers);
        document.getElementById('searchCompanies').addEventListener('input', filterCompanies);
        document.getElementById('searchProjects').addEventListener('input', filterProjects);
        document.getElementById('filterStatus').addEventListener('change', filterProjects);
    }
}

function filterUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const items = document.querySelectorAll('#usersList .item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
}

function filterCompanies() {
    const searchTerm = document.getElementById('searchCompanies').value.toLowerCase();
    const items = document.querySelectorAll('#companiesList .item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
}

function filterProjects() {
    const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const items = document.querySelectorAll('#projectsList .item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = !statusFilter || text.includes(statusFilter.toLowerCase());
        
        item.style.display = matchesSearch && matchesStatus ? 'flex' : 'none';
    });
}

// === MÉTRICAS Y REPORTES ===
function generateAdminReport() {
    const stats = window.PortalDB.getStats();
    const activities = window.AuthSys.getRecentActivities(20);
    
    const reportData = {
        generatedAt: new Date().toISOString(),
        generatedBy: window.AuthSys.getCurrentUser().name,
        statistics: stats,
        recentActivities: activities,
        totalUsers: Object.keys(currentData.users).length,
        totalCompanies: Object.keys(currentData.companies).length,
        totalProjects: Object.keys(currentData.projects).length,
        totalAssignments: Object.keys(currentData.assignments).length
    };
    
    // Crear reporte HTML
    const reportHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">
                📊 Reporte Administrativo - Portal ARVIC
            </h1>
            <p style="text-align: center; color: #666; margin-bottom: 40px;">
                Generado el ${window.DateUtils.formatDateTime(reportData.generatedAt)}<br>
                Por: ${reportData.generatedBy}
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 40px;">
                <div style="background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalUsers}</h2>
                    <p style="margin: 5px 0 0;">Usuarios Totales</p>
                </div>
                <div style="background: #2ecc71; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalCompanies}</h2>
                    <p style="margin: 5px 0 0;">Empresas</p>
                </div>
                <div style="background: #f39c12; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalProjects}</h2>
                    <p style="margin: 5px 0 0;">Proyectos</p>
                </div>
                <div style="background: #e74c3c; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalAssignments}</h2>
                    <p style="margin: 5px 0 0;">Asignaciones</p>
                </div>
            </div>
            
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                🔄 Actividad Reciente
            </h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                ${activities.length > 0 ? 
                    activities.map(activity => `
                        <div style="margin-bottom: 10px; padding: 10px; background: white; border-left: 4px solid #3498db; border-radius: 4px;">
                            <strong>${activity.description}</strong><br>
                            <small style="color: #666;">
                                Usuario: ${activity.userId} | 
                                ${window.DateUtils.formatDateTime(activity.timestamp)}
                            </small>
                        </div>
                    `).join('') : 
                    '<p style="color: #666; text-align: center;">No hay actividad reciente</p>'
                }
            </div>
        </div>
    `;
    
    // Abrir en nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Administrativo - Portal ARVIC</title>
            <style>
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${reportHTML}
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🖨️ Imprimir Reporte
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    ❌ Cerrar
                </button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// === INICIALIZACIÓN COMPLETA ===
// Configurar búsqueda y filtros después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupSearchAndFilters, 1000);
});

// Agregar botones de acción adicionales
function addAdminActions() {
    const adminTitle = document.querySelector('.admin-title');
    if (adminTitle) {
        const actionsHTML = `
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="generateAdminReport()" class="btn btn-secondary" style="margin: 0 10px;">
                    📊 Generar Reporte
                </button>
                <button onclick="exportData()" class="btn btn-secondary" style="margin: 0 10px;">
                    💾 Exportar Datos
                </button>
                <button onclick="importData()" class="btn btn-secondary" style="margin: 0 10px;">
                    📁 Importar Datos
                </button>
            </div>
        `;
        adminTitle.insertAdjacentHTML('beforeend', actionsHTML);
    }
}

// Ejecutar después de la inicialización
setTimeout(addAdminActions, 1500);