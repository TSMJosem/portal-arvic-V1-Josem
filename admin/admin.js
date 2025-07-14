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
    currentData.tasks = window.PortalDB.getTasks() || {};
    currentData.modules = window.PortalDB.getModules() || {};
    currentData.reports = window.PortalDB.getReports() || {};
    
    updateUI();
}

function updateUI() {
    updateStats();
    updateSidebarCounts();
    updateCurrentSectionData();
    updateDropdowns();
}

function updateCurrentSectionData() {
    switch(currentSection) {
        case 'usuarios':
            updateUsersList();
            break;
        case 'empresas':
            updateCompaniesList();
            break;
        case 'proyectos':
            updateProjectsList();
            break;
        case 'tareas':
            updateTasksList();
            break;
        case 'modulos':
            updateModulesList();
            break;
        case 'lista-asignaciones':
        case 'asignaciones-recientes':
            updateAssignmentsList();
            break;
        case 'todos-reportes':
        case 'reportes-pendientes':
            updateReportsList();
            break;
    }
}

function updateStats() {
    const stats = window.PortalDB.getStats();
    
    document.getElementById('usersCount').textContent = stats.totalUsers;
    document.getElementById('companiesCount').textContent = stats.totalCompanies;
    document.getElementById('projectsCount').textContent = stats.totalProjects;
    document.getElementById('assignmentsCount').textContent = stats.totalAssignments;
}

function updateSidebarCounts() {
    const consultorUsers = Object.values(currentData.users).filter(user => user.role === 'consultor');
    const companies = Object.values(currentData.companies);
    const projects = Object.values(currentData.projects);
    const assignments = Object.values(currentData.assignments);
    const tasks = Object.values(currentData.tasks);
    const modules = Object.values(currentData.modules);
    const reports = Object.values(currentData.reports);
    const pendingReports = reports.filter(r => r.status === 'Pendiente');

    // Actualizar contadores en el sidebar
    const sidebarElements = {
        'sidebarUsersCount': consultorUsers.length,
        'sidebarCompaniesCount': companies.length,
        'sidebarProjectsCount': projects.length,
        'sidebarTasksCount': tasks.length,
        'sidebarModulesCount': modules.length,
        'sidebarAssignmentsCount': assignments.length,
        'sidebarReportsCount': reports.length,
        'sidebarPendingReportsCount': pendingReports.length
    };

    Object.entries(sidebarElements).forEach(([elementId, count]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
        }
    });
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

function updateTasksList() {
    const container = document.getElementById('tasksList');
    const tasks = Object.values(currentData.tasks);
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-title">No hay tareas</div>
                <div class="empty-state-desc">Cree la primera tarea</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'item hover-lift';
        
        taskDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${task.id}</span>
                    <strong>${task.name}</strong>
                </div>
                <small style="color: #666;">
                    📅 Creada: ${window.DateUtils.formatDate(task.createdAt)}
                    ${task.description ? `<br>📝 ${window.TextUtils.truncate(task.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteTask('${task.id}')" title="Eliminar tarea">
                🗑️
            </button>
        `;
        container.appendChild(taskDiv);
    });
}

function updateModulesList() {
    const container = document.getElementById('modulesList');
    const modules = Object.values(currentData.modules);
    
    if (modules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🧩</div>
                <div class="empty-state-title">No hay módulos</div>
                <div class="empty-state-desc">Cree el primer módulo</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    modules.forEach(module => {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'item hover-lift';
        
        moduleDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${module.id}</span>
                    <strong>${module.name}</strong>
                </div>
                <small style="color: #666;">
                    📅 Creado: ${window.DateUtils.formatDate(module.createdAt)}
                    ${module.description ? `<br>📝 ${window.TextUtils.truncate(module.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteModule('${module.id}')" title="Eliminar módulo">
                🗑️
            </button>
        `;
        container.appendChild(moduleDiv);
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

function updateReportsList() {
    const allContainer = document.getElementById('allReportsList');
    const pendingContainer = document.getElementById('pendingReportsList');
    const reports = Object.values(currentData.reports);
    
    if (reports.length === 0) {
        allContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📄</div>
                <div class="empty-state-title">No hay reportes</div>
                <div class="empty-state-desc">Los reportes enviados por consultores aparecerán aquí</div>
            </div>
        `;
        
        pendingContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <div class="empty-state-title">No hay reportes pendientes</div>
                <div class="empty-state-desc">Los reportes que requieren revisión aparecerán aquí</div>
            </div>
        `;
        return;
    }
    
    // Todos los reportes
    allContainer.innerHTML = '';
    reports.forEach(report => {
        const user = currentData.users[report.userId];
        if (user) {
            const reportDiv = document.createElement('div');
            reportDiv.className = 'item hover-lift';
            
            const statusColors = {
                'Pendiente': '#f39c12',
                'Aprobado': '#27ae60',
                'Rechazado': '#e74c3c'
            };
            
            reportDiv.innerHTML = `
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <strong>${report.title}</strong>
                        <span class="custom-badge" style="background: ${statusColors[report.status]}20; color: ${statusColors[report.status]}; border-color: ${statusColors[report.status]};">
                            ${report.status}
                        </span>
                    </div>
                    <small style="color: #666;">
                        👤 ${user.name} | 📅 ${window.DateUtils.formatDate(report.createdAt)}
                        ${report.reportType ? `| 📊 ${report.reportType}` : ''}
                    </small>
                </div>
                <span class="custom-badge badge-info">
                    ${window.DateUtils.formatRelativeTime(report.createdAt)}
                </span>
            `;
            allContainer.appendChild(reportDiv);
        }
    });
    
    // Reportes pendientes
    const pendingReports = reports.filter(r => r.status === 'Pendiente');
    
    if (pendingReports.length === 0) {
        pendingContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-title">No hay reportes pendientes</div>
                <div class="empty-state-desc">Todos los reportes han sido revisados</div>
            </div>
        `;
    } else {
        pendingContainer.innerHTML = '';
        pendingReports.forEach(report => {
            const user = currentData.users[report.userId];
            if (user) {
                const reportDiv = document.createElement('div');
                reportDiv.className = 'item hover-lift';
                reportDiv.innerHTML = `
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <strong>${report.title}</strong>
                            <span class="custom-badge badge-warning">
                                ⏳ Pendiente
                            </span>
                        </div>
                        <small style="color: #666;">
                            👤 ${user.name} | 📅 ${window.DateUtils.formatDate(report.createdAt)}
                            ${report.reportType ? `| 📊 ${report.reportType}` : ''}
                        </small>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-success" onclick="approveReport('${report.id}')" title="Aprobar reporte" style="padding: 4px 8px; font-size: 12px;">
                            ✅
                        </button>
                        <button class="btn btn-danger" onclick="rejectReport('${report.id}')" title="Rechazar reporte" style="padding: 4px 8px; font-size: 12px;">
                            ❌
                        </button>
                    </div>
                `;
                pendingContainer.appendChild(reportDiv);
            }
        });
    }
}

function approveReport(reportId) {
    const result = window.PortalDB.updateReport(reportId, { status: 'Aprobado' });
    if (result.success) {
        window.NotificationUtils.success('Reporte aprobado');
        loadAllData();
    }
}

function rejectReport(reportId) {
    const feedback = prompt('Comentarios de rechazo (opcional):');
    const result = window.PortalDB.updateReport(reportId, { 
        status: 'Rechazado',
        feedback: feedback || 'Sin comentarios'
    });
    if (result.success) {
        window.NotificationUtils.success('Reporte rechazado');
        loadAllData();
    }
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

function openTaskModal() {
    document.getElementById('taskName').focus();
    window.ModalUtils.open('taskModal');
}

function openModuleModal() {
    document.getElementById('moduleName').focus();
    window.ModalUtils.open('moduleModal');
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
        totalTasks: Object.keys(currentData.tasks).length,
        totalModules: Object.keys(currentData.modules).length,
        totalAssignments: Object.keys(currentData.assignments).length,
        totalReports: Object.keys(currentData.reports).length
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
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 40px;">
                <div style="background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalUsers}</h2>
                    <p style="margin: 5px 0 0;">Usuarios</p>
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
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalTasks}</h2>
                    <p style="margin: 5px 0 0;">Tareas</p>
                </div>
                <div style="background: #9b59b6; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalModules}</h2>
                    <p style="margin: 5px 0 0;">Módulos</p>
                </div>
                <div style="background: #1abc9c; color: white; padding: 20px; border-radius: 8px; text-align: center;">
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

// === FUNCIONES EXPORTADAS GLOBALMENTE ===
window.showSection = showSection;
window.openUserModal = openUserModal;
window.openCompanyModal = openCompanyModal;
window.openProjectModal = openProjectModal;
window.openTaskModal = openTaskModal;
window.openModuleModal = openModuleModal;
window.closeModal = closeModal;
window.deleteUser = deleteUser;
window.deleteCompany = deleteCompany;
window.deleteProject = deleteProject;
window.deleteTask = deleteTask;
window.deleteModule = deleteModule;
window.createAssignment = createAssignment;
window.deleteAssignment = deleteAssignment;
window.approveReport = approveReport;
window.rejectReport = rejectReport;
window.logout = logout;
window.exportData = exportData;
window.importData = importData;
window.generateAdminReport = generateAdminReport;

console.log('✅ Funciones del administrador exportadas globalmente');/**
 * === LÓGICA DEL PANEL DE ADMINISTRADOR REORGANIZADO ===
 * Maneja todas las funciones administrativas del portal con sidebar
 */

// Variables globales
let currentData = {
    users: {},
    companies: {},
    projects: {},
    assignments: {},
    tasks: {},
    modules: {},
    reports: {}
};

let currentSection = 'usuarios';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación de administrador
    if (!window.AuthSys.requireAdmin()) {
        return;
    }

    initializeAdminPanel();
    setupEventListeners();
    setupSidebarNavigation();
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
    document.getElementById('taskForm').addEventListener('submit', handleCreateTask);
    document.getElementById('moduleForm').addEventListener('submit', handleCreateModule);

    // Cerrar modales con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Auto-actualización cada 30 segundos
    setInterval(loadAllData, 30000);
}

function setupSidebarNavigation() {
    // Agregar listeners a todos los elementos del sidebar
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        const section = item.getAttribute('data-section');
        if (section) {
            item.addEventListener('click', () => {
                showSection(section);
            });
        }
    });
}

// === NAVEGACIÓN DE SECCIONES ===
function showSection(sectionName) {
    currentSection = sectionName;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Actualizar navegación activa en el sidebar
    updateActiveSidebarItem(sectionName);

    // Cargar datos específicos de la sección si es necesario
    loadSectionData(sectionName);
}

function updateActiveSidebarItem(activeSection) {
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === activeSection) {
            item.classList.add('active');
        }
    });
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'usuarios':
            updateUsersList();
            break;
        case 'empresas':
            updateCompaniesList();
            break;
        case 'proyectos':
            updateProjectsList();
            break;
        case 'tareas':
            updateTasksList();
            break;
        case 'modulos':
            updateModulesList();
            break;
        case 'lista-asignaciones':
        case 'asignaciones-recientes':
            updateAssignmentsList();
            break;
        case 'todos-reportes':
        case 'reportes-pendientes':
            updateReportsList();
            break;
    }
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
                    <strong>Importante:</strong> Comparta estas credenciales de forma segura con el usuario.
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

    const companyData = { name: name, description: description };
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

    const projectData = { name: name, description: description, status: status };
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

// === GESTIÓN DE TAREAS ===
function handleCreateTask(e) {
    e.preventDefault();
    
    const name = document.getElementById('taskName').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre de la tarea es requerido');
        return;
    }

    const taskData = {
        name: name,
        description: description,
        priority: priority,
        status: status
    };

    const result = window.PortalDB.createTask(taskData);
    
    if (result.success) {
        window.NotificationUtils.success(`Tarea "${name}" creada exitosamente`);
        closeModal('taskModal');
        document.getElementById('taskForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear tarea: ' + result.message);
    }
}

function deleteTask(taskId) {
    if (!confirm('¿Está seguro de eliminar esta tarea?')) {
        return;
    }

    const result = window.PortalDB.deleteTask(taskId);
    
    if (result.success) {
        window.NotificationUtils.success('Tarea eliminada correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar tarea: ' + result.message);
    }
}

// === GESTIÓN DE MÓDULOS ===
function handleCreateModule(e) {
    e.preventDefault();
    
    const name = document.getElementById('moduleName').value.trim();
    const description = document.getElementById('moduleDescription').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre del módulo es requerido');
        return;
    }

    const moduleData = {
        name: name,
        description: description,
        category: category,
        status: status
    };

    const result = window.PortalDB.createModule(moduleData);
    
    if (result.success) {
        window.NotificationUtils.success(`Módulo "${name}" creado exitosamente`);
        closeModal('moduleModal');
        document.getElementById('moduleForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear módulo: ' + result.message);
    }
}

function deleteModule(moduleId) {
    if (!confirm('¿Está seguro de eliminar este módulo?')) {
        return;
    }

    const result = window.PortalDB.deleteModule(moduleId);
    
    if (result.success) {
        window.NotificationUtils.success('Módulo eliminado correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar módulo: ' + result.message);
    }
}