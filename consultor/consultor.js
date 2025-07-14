/**
 * === LÓGICA DEL PANEL DE CONSULTOR CORREGIDA ===
 * Maneja todas las funciones del consultor con manejo de errores mejorado
 */

// Variables globales
let currentUser = null;
let currentLanguage = 'es';
let userReports = [];
let currentTaskId = null;
let isInitialized = false;

// === MANEJO DE ERRORES ===
function showError(message) {
    console.error('Error:', message);
    const errorContainer = document.getElementById('errorContainer');
    const errorText = document.getElementById('errorText');
    
    if (errorContainer && errorText) {
        errorText.textContent = message;
        errorContainer.style.display = 'block';
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            hideError();
        }, 5000);
    } else {
        alert('Error: ' + message);
    }
}

function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    const mainContent = document.getElementById('mainContent');
    
    if (spinner) {
        spinner.style.display = 'none';
    }
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

// === VERIFICACIÓN DE DEPENDENCIAS ===
function checkDependencies() {
    const requiredObjects = ['PortalDB', 'AuthSys', 'NotificationUtils', 'TextUtils', 'DateUtils', 'ModalUtils', 'StorageUtils'];
    const missing = [];
    
    for (const obj of requiredObjects) {
        if (!window[obj]) {
            missing.push(obj);
        }
    }
    
    if (missing.length > 0) {
        showError(`Faltan dependencias: ${missing.join(', ')}. Por favor verifica que todos los archivos JS estén cargados.`);
        return false;
    }
    
    return true;
}

// === INICIALIZACIÓN SEGURA ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando panel de consultor...');
    
    try {
        // Verificar dependencias con retry
        let retries = 0;
        const maxRetries = 10;
        
        const checkAndInit = () => {
            if (checkDependencies()) {
                initializeConsultor();
            } else {
                retries++;
                if (retries < maxRetries) {
                    console.log(`Reintentando carga de dependencias (${retries}/${maxRetries})...`);
                    setTimeout(checkAndInit, 500);
                } else {
                    showError('Error crítico: No se pudieron cargar las dependencias necesarias. Recarga la página.');
                }
            }
        };
        
        checkAndInit();
        
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        showError('Error durante la inicialización: ' + error.message);
    }
});

function initializeConsultor() {
    try {
        console.log('✅ Dependencias cargadas, verificando autenticación...');
        
        // Verificar autenticación
        if (!window.AuthSys || !window.AuthSys.isAuthenticated()) {
            console.error('❌ Usuario no autenticado');
            showError('Sesión no válida. Redirigiendo al login...');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }
        
        currentUser = window.AuthSys.getCurrentUser();
        
        if (!currentUser) {
            console.error('❌ No se pudo obtener información del usuario');
            showError('Error al obtener información del usuario');
            return;
        }
        
        if (currentUser.role !== 'consultor') {
            console.error('❌ Usuario no es consultor:', currentUser.role);
            showError('Acceso denegado: No tienes permisos de consultor');
            setTimeout(() => {
                window.AuthSys.logout();
            }, 2000);
            return;
        }
        
        console.log('✅ Usuario autenticado como consultor:', currentUser.name);
        
        // Inicializar componentes
        initializeConsultorPanel();
        setupEventListeners();
        loadUserData();
        
        // Ocultar spinner y mostrar contenido
        hideLoadingSpinner();
        isInitialized = true;
        
        console.log('🎉 Panel de consultor inicializado correctamente');
        
    } catch (error) {
        console.error('Error en initializeConsultor:', error);
        showError('Error de inicialización: ' + error.message);
    }
}

// === INICIALIZACIÓN DEL PANEL ===
function initializeConsultorPanel() {
    try {
        if (!currentUser) {
            throw new Error('currentUser no está definido');
        }
        
        // Actualizar nombre de usuario
        const userNameElement = document.getElementById('consultorUserName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
        
        // Configurar fecha actual
        const reportDateElement = document.getElementById('reportDate');
        if (reportDateElement) {
            const today = new Date().toISOString().split('T')[0];
            reportDateElement.value = today;
        }
        
        // Cargar asignaciones
        loadUserAssignments();
        
        // Mensaje de bienvenida
        if (window.NotificationUtils) {
            window.NotificationUtils.success(`¡Bienvenido ${currentUser.name}!`, 3000);
        }
        
    } catch (error) {
        console.error('Error en initializeConsultorPanel:', error);
        showError('Error al inicializar panel: ' + error.message);
    }
}

function setupEventListeners() {
    try {
        // Formulario de reportes
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', handleSubmitReport);
        }
        
        // Navegación de secciones
        setupSectionNavigation();
        
        // Auto-guardar reportes cada 30 segundos
        setInterval(() => {
            if (isInitialized) {
                autoSaveReport();
            }
        }, 30000);
        
    } catch (error) {
        console.error('Error en setupEventListeners:', error);
        showError('Error al configurar eventos: ' + error.message);
    }
}

function setupSectionNavigation() {
    try {
        // Agregar listeners a todos los enlaces de navegación
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                if (section) {
                    showSection(section);
                }
            });
        });
        
        // También agregar listeners a elementos con onclick
        document.querySelectorAll('[onclick*="showSection"]').forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                const match = this.getAttribute('onclick').match(/showSection\('(\w+)'\)/);
                if (match && match[1]) {
                    showSection(match[1]);
                }
            });
        });
        
    } catch (error) {
        console.error('Error en setupSectionNavigation:', error);
    }
}

// === GESTIÓN DE SECCIONES ===
function showSection(sectionName) {
    try {
        console.log('Cambiando a sección:', sectionName);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.warn('Sección no encontrada:', `${sectionName}-section`);
        }

        // Actualizar navegación activa
        updateActiveNavigation(sectionName);

        // Cargar datos específicos de la sección
        switch(sectionName) {
            case 'reports':
                loadUserReports();
                break;
            case 'tasks':
                loadUserTasks();
                break;
            case 'home':
                refreshDashboardData();
                break;
        }
        
    } catch (error) {
        console.error('Error en showSection:', error);
        showError('Error al cambiar sección: ' + error.message);
    }
}

function updateActiveNavigation(activeSection) {
    try {
        // Actualizar menú superior
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === activeSection) {
                link.classList.add('active');
            }
        });

        // Actualizar sidebar
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === activeSection) {
                item.classList.add('active');
            }
        });
        
    } catch (error) {
        console.error('Error en updateActiveNavigation:', error);
    }
}

// === GESTIÓN DE ASIGNACIONES ===
function loadUserAssignments() {
    try {
        if (!currentUser) {
            console.warn('currentUser no disponible para cargar asignaciones');
            return;
        }
        
        const assignedCompanyElement = document.getElementById('assignedCompany');
        const assignedProjectElement = document.getElementById('assignedProject');
        const reportTypeElement = document.getElementById('reportType');
        
        if (!currentUser.assignedCompany || !currentUser.assignedProject) {
            if (assignedCompanyElement) assignedCompanyElement.textContent = 'No asignada';
            if (assignedProjectElement) assignedProjectElement.textContent = 'No asignado';
            if (reportTypeElement) reportTypeElement.textContent = 'No definido';
            return;
        }

        // Cargar datos de empresa y proyecto
        let company = null;
        let project = null;
        
        if (window.PortalDB) {
            company = window.PortalDB.getCompany(currentUser.assignedCompany);
            project = window.PortalDB.getProject(currentUser.assignedProject);
        }

        if (assignedCompanyElement) {
            assignedCompanyElement.textContent = company ? company.name : 'No encontrada';
        }
        if (assignedProjectElement) {
            assignedProjectElement.textContent = project ? project.name : 'No encontrado';
        }
        if (reportTypeElement) {
            reportTypeElement.textContent = currentUser.reportType || 'No definido';
        }
        
    } catch (error) {
        console.error('Error en loadUserAssignments:', error);
        showError('Error al cargar asignaciones: ' + error.message);
    }
}

// === GESTIÓN DE REPORTES ===
function handleSubmitReport(e) {
    try {
        e.preventDefault();
        
        if (!isInitialized) {
            showError('El sistema aún se está inicializando. Espera un momento.');
            return;
        }

        const titleElement = document.getElementById('reportTitle');
        const dateElement = document.getElementById('reportDate');
        const contentElement = document.getElementById('reportContent');
        const progressElement = document.getElementById('reportProgress');
        const priorityElement = document.getElementById('reportPriority');
        
        if (!titleElement || !dateElement || !contentElement || !progressElement || !priorityElement) {
            showError('Error: No se encontraron todos los campos del formulario');
            return;
        }

        const title = titleElement.value.trim();
        const date = dateElement.value;
        const content = contentElement.value.trim();
        const progress = progressElement.value;
        const priority = priorityElement.value;

        if (!title || !date || !content) {
            showError('Todos los campos obligatorios deben completarse');
            return;
        }

        if (!currentUser || !currentUser.assignedCompany || !currentUser.assignedProject) {
            showError('No tienes asignaciones activas. Contacta al administrador.');
            return;
        }

        const reportData = {
            userId: currentUser.id,
            title: title,
            content: content,
            reportDate: date,
            progress: parseInt(progress),
            priority: priority,
            reportType: currentUser.reportType || 'General',
            companyId: currentUser.assignedCompany,
            projectId: currentUser.assignedProject
        };

        if (!window.PortalDB) {
            showError('Error: Base de datos no disponible');
            return;
        }

        const result = window.PortalDB.createReport(reportData);

        if (result.success) {
            if (window.NotificationUtils) {
                window.NotificationUtils.success('¡Reporte enviado exitosamente!');
            }
            
            // Limpiar formulario
            const form = document.getElementById('reportForm');
            if (form) {
                form.reset();
            }
            if (dateElement) {
                dateElement.value = new Date().toISOString().split('T')[0];
            }
            if (progressElement) {
                progressElement.value = 0;
            }
            updateProgressDisplay(0);
            
            // Actualizar lista de reportes
            loadUserReports();
            
            // Limpiar auto-guardado
            clearAutoSave();
            
        } else {
            showError('Error al enviar reporte: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error en handleSubmitReport:', error);
        showError('Error al enviar reporte: ' + error.message);
    }
}

function loadUserReports() {
    try {
        if (!currentUser || !window.PortalDB) {
            return;
        }

        userReports = window.PortalDB.getReportsByUser(currentUser.id) || [];
        updateReportsList();
        updateReportsCount();
        
    } catch (error) {
        console.error('Error en loadUserReports:', error);
        showError('Error al cargar reportes: ' + error.message);
    }
}

function updateReportsList() {
    try {
        const container = document.getElementById('reportsList');
        if (!container) {
            console.warn('Container reportsList no encontrado');
            return;
        }
        
        if (userReports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-title">No hay reportes</div>
                    <div class="empty-state-desc">Los reportes que envíes aparecerán aquí</div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        // Ordenar reportes por fecha (más recientes primero)
        const sortedReports = [...userReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sortedReports.forEach(report => {
            const reportDiv = document.createElement('div');
            reportDiv.className = 'report-item hover-lift';
            
            const statusClass = {
                'Pendiente': 'status-pending',
                'Aprobado': 'status-approved',
                'Rechazado': 'status-rejected'
            }[report.status] || 'status-pending';

            const priorityIcon = {
                'Alta': '🔴',
                'Media': '🟡',
                'Baja': '🟢'
            }[report.priority] || '🟡';

            const truncatedContent = window.TextUtils ? 
                window.TextUtils.truncate(report.content, 80) : 
                report.content.substring(0, 80) + '...';
                
            const formattedDate = window.DateUtils ? 
                window.DateUtils.formatDate(report.reportDate) : 
                new Date(report.reportDate).toLocaleDateString();

            reportDiv.innerHTML = `
                <div class="report-content" style="flex: 1; cursor: pointer;" onclick="showReportDetail('${report.id}')">
                    <h4 style="color: #2c3e50; margin-bottom: 5px;">
                        ${priorityIcon} ${report.title}
                    </h4>
                    <p style="color: #666; font-size: 14px; margin-bottom: 8px;">
                        ${truncatedContent}
                    </p>
                    <div class="report-meta">
                        <span class="report-date">
                            📅 ${formattedDate}
                        </span>
                        ${report.progress !== undefined ? `
                            <span class="custom-badge badge-info">
                                📊 ${report.progress}%
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div>
                    <span class="report-status ${statusClass}">
                        ${report.status || 'Pendiente'}
                    </span>
                </div>
            `;
            
            container.appendChild(reportDiv);
        });
        
    } catch (error) {
        console.error('Error en updateReportsList:', error);
        showError('Error al actualizar lista de reportes: ' + error.message);
    }
}

function updateReportsCount() {
    try {
        const count = userReports.length;
        const countElement = document.getElementById('reportsCount');
        if (countElement) {
            countElement.textContent = count;
        }
    } catch (error) {
        console.error('Error en updateReportsCount:', error);
    }
}

function showReportDetail(reportId) {
    try {
        const report = userReports.find(r => r.id === reportId);
        if (!report) {
            showError('Reporte no encontrado');
            return;
        }

        let company = null;
        let project = null;
        
        if (window.PortalDB) {
            company = window.PortalDB.getCompany(report.companyId);
            project = window.PortalDB.getProject(report.projectId);
        }

        const priorityIcon = {
            'Alta': '🔴',
            'Media': '🟡',
            'Baja': '🟢'
        }[report.priority] || '🟡';

        const statusClass = {
            'Pendiente': 'status-pending',
            'Aprobado': 'status-approved',
            'Rechazado': 'status-rejected'
        }[report.status] || 'status-pending';

        const formatDate = (date) => window.DateUtils ? 
            window.DateUtils.formatDate(date) : 
            new Date(date).toLocaleDateString();
            
        const formatDateTime = (date) => window.DateUtils ? 
            window.DateUtils.formatDateTime(date) : 
            new Date(date).toLocaleString();

        const detailHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">
                    ${priorityIcon} ${report.title}
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <strong>📅 Fecha del Reporte:</strong><br>
                        ${formatDate(report.reportDate)}
                    </div>
                    <div>
                        <strong>⏰ Enviado:</strong><br>
                        ${formatDateTime(report.createdAt)}
                    </div>
                    <div>
                        <strong>🏢 Empresa:</strong><br>
                        ${company ? company.name : 'No disponible'}
                    </div>
                    <div>
                        <strong>📋 Proyecto:</strong><br>
                        ${project ? project.name : 'No disponible'}
                    </div>
                    <div>
                        <strong>📊 Progreso:</strong><br>
                        ${report.progress !== undefined ? `${report.progress}%` : 'No especificado'}
                    </div>
                    <div>
                        <strong>🎯 Estado:</strong><br>
                        <span class="report-status ${statusClass}">
                            ${report.status || 'Pendiente'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1cb5e0;">
                <h4 style="margin-bottom: 15px; color: #2c3e50;">📝 Contenido del Reporte:</h4>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #555;">
                    ${report.content}
                </div>
            </div>
            
            ${report.status === 'Rechazado' && report.feedback ? `
                <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c; margin-top: 20px;">
                    <h4 style="color: #e74c3c; margin-bottom: 10px;">❌ Comentarios de Revisión:</h4>
                    <p style="color: #666;">${report.feedback}</p>
                </div>
            ` : ''}
        `;

        const detailContainer = document.getElementById('reportDetailContent');
        if (detailContainer) {
            detailContainer.innerHTML = detailHTML;
            if (window.ModalUtils) {
                window.ModalUtils.open('reportDetailModal');
            }
        }
        
    } catch (error) {
        console.error('Error en showReportDetail:', error);
        showError('Error al mostrar detalle del reporte: ' + error.message);
    }
}

// === GESTIÓN DE TAREAS ===
function loadUserTasks() {
    try {
        updateTasksCount();
    } catch (error) {
        console.error('Error en loadUserTasks:', error);
    }
}

function updateTasksCount() {
    try {
        const pendingTasks = document.querySelectorAll('.task-item:not([style*="opacity: 0.7"])').length;
        const countElement = document.getElementById('tasksCount');
        if (countElement) {
            countElement.textContent = pendingTasks;
        }
    } catch (error) {
        console.error('Error en updateTasksCount:', error);
    }
}

function completeTask(taskId) {
    try {
        currentTaskId = taskId;
        const taskElements = document.querySelectorAll('.task-item h4');
        const taskElement = taskElements[taskId - 1];
        const taskTitle = taskElement ? taskElement.textContent.trim() : 'Tarea';
        
        const confirmElement = document.getElementById('taskConfirmText');
        if (confirmElement) {
            confirmElement.textContent = `¿Está seguro de marcar "${taskTitle}" como completada?`;
        }
        
        if (window.ModalUtils) {
            window.ModalUtils.open('taskModal');
        }
        
    } catch (error) {
        console.error('Error en completeTask:', error);
        showError('Error al completar tarea: ' + error.message);
    }
}

function confirmTaskCompletion() {
    try {
        const notesElement = document.getElementById('taskNotes');
        const notes = notesElement ? notesElement.value.trim() : '';
        
        if (window.NotificationUtils) {
            window.NotificationUtils.success('¡Tarea marcada como completada!');
        }
        
        // Mover tarea a completadas (simulación visual)
        setTimeout(() => {
            const taskItems = document.querySelectorAll('.task-item:not([style*="opacity: 0.7"])');
            if (taskItems[currentTaskId - 1]) {
                const taskItem = taskItems[currentTaskId - 1];
                taskItem.style.opacity = '0.7';
                taskItem.style.borderLeftColor = '#27ae60';
                
                const title = taskItem.querySelector('h4');
                if (title) {
                    title.style.color = '#27ae60';
                    title.innerHTML = '✅ ' + title.textContent.replace(/^[📋🔧📱]\s*/, '');
                }
                
                const button = taskItem.querySelector('button');
                if (button) {
                    button.innerHTML = '✅ Completada';
                    button.disabled = true;
                    button.style.background = '#27ae60';
                }
            }
            
            updateTasksCount();
        }, 500);
        
        closeModal('taskModal');
        if (notesElement) {
            notesElement.value = '';
        }
        
    } catch (error) {
        console.error('Error en confirmTaskCompletion:', error);
        showError('Error al confirmar tarea: ' + error.message);
    }
}

// === AUTO-GUARDADO ===
function autoSaveReport() {
    try {
        if (!currentUser) return;
        
        const titleElement = document.getElementById('reportTitle');
        const contentElement = document.getElementById('reportContent');
        
        if (!titleElement || !contentElement) return;
        
        const title = titleElement.value.trim();
        const content = contentElement.value.trim();
        
        if (title || content) {
            const autoSaveData = {
                title: title,
                content: content,
                date: document.getElementById('reportDate')?.value,
                progress: document.getElementById('reportProgress')?.value,
                priority: document.getElementById('reportPriority')?.value,
                timestamp: new Date().toISOString()
            };
            
            if (window.StorageUtils) {
                window.StorageUtils.set(`autosave_report_${currentUser.id}`, autoSaveData, new Date(Date.now() + 24 * 60 * 60 * 1000));
                showAutoSaveIndicator();
            }
        }
        
    } catch (error) {
        console.error('Error en autoSaveReport:', error);
    }
}

function loadAutoSavedReport() {
    try {
        if (!currentUser || !window.StorageUtils) return;
        
        const autoSaved = window.StorageUtils.get(`autosave_report_${currentUser.id}`);
        
        if (autoSaved) {
            if (confirm('Se encontró un reporte auto-guardado. ¿Desea recuperarlo?')) {
                const titleElement = document.getElementById('reportTitle');
                const contentElement = document.getElementById('reportContent');
                const dateElement = document.getElementById('reportDate');
                const progressElement = document.getElementById('reportProgress');
                const priorityElement = document.getElementById('reportPriority');
                
                if (titleElement) titleElement.value = autoSaved.title || '';
                if (contentElement) contentElement.value = autoSaved.content || '';
                if (dateElement) dateElement.value = autoSaved.date || '';
                if (progressElement) progressElement.value = autoSaved.progress || 0;
                if (priorityElement) priorityElement.value = autoSaved.priority || 'Media';
                
                updateProgressDisplay(autoSaved.progress || 0);
                
                if (window.NotificationUtils) {
                    window.NotificationUtils.info('Reporte auto-guardado recuperado');
                }
            } else {
                clearAutoSave();
            }
        }
        
    } catch (error) {
        console.error('Error en loadAutoSavedReport:', error);
    }
}

function clearAutoSave() {
    try {
        if (currentUser && window.StorageUtils) {
            window.StorageUtils.remove(`autosave_report_${currentUser.id}`);
        }
    } catch (error) {
        console.error('Error en clearAutoSave:', error);
    }
}

function showAutoSaveIndicator() {
    try {
        const indicator = document.getElementById('autoSaveIndicator') || (() => {
            const div = document.createElement('div');
            div.id = 'autoSaveIndicator';
            div.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2ecc71;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1001;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            div.textContent = '💾 Auto-guardado';
            document.body.appendChild(div);
            return div;
        })();
        
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
        
    } catch (error) {
        console.error('Error en showAutoSaveIndicator:', error);
    }
}

// === UTILIDADES ===
function updateProgressDisplay(value) {
    try {
        const progressElement = document.getElementById('progressDisplay');
        if (progressElement) {
            progressElement.textContent = `${value}%`;
            
            // Actualizar color según progreso
            if (value < 30) {
                progressElement.style.color = '#e74c3c';
            } else if (value < 70) {
                progressElement.style.color = '#f39c12';
            } else {
                progressElement.style.color = '#27ae60';
            }
        }
    } catch (error) {
        console.error('Error en updateProgressDisplay:', error);
    }
}

function toggleLanguage() {
    try {
        currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
        updateLanguage();
        
        const langBtn = document.getElementById('langText');
        if (langBtn) {
            langBtn.textContent = currentLanguage === 'es' ? 'Español (MX) ▼' : 'English (US) ▼';
        }
        
        if (window.NotificationUtils) {
            window.NotificationUtils.info(
                currentLanguage === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English'
            );
        }
    } catch (error) {
        console.error('Error en toggleLanguage:', error);
    }
}

function updateLanguage() {
    try {
        document.querySelectorAll('[data-es][data-en]').forEach(element => {
            const text = element.getAttribute(`data-${currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });
    } catch (error) {
        console.error('Error en updateLanguage:', error);
    }
}

function refreshDashboardData() {
    try {
        loadUserAssignments();
        loadUserReports();
        updateReportsCount();
        updateTasksCount();
    } catch (error) {
        console.error('Error en refreshDashboardData:', error);
    }
}

function viewReportHistory() {
    try {
        showSection('reports');
        if (window.NotificationUtils) {
            window.NotificationUtils.info('Mostrando historial de reportes');
        }
    } catch (error) {
        console.error('Error en viewReportHistory:', error);
    }
}

function showQuickActions() {
    try {
        const actions = [
            { text: '📝 Nuevo Reporte', action: () => showSection('reports') },
            { text: '✅ Ver Tareas', action: () => showSection('tasks') },
            { text: '🏠 Inicio', action: () => showSection('home') },
            { text: '🔄 Actualizar', action: refreshDashboardData }
        ];
        
        const existingMenu = document.getElementById('quickActionsMenu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const menu = document.createElement('div');
        menu.id = 'quickActionsMenu';
        menu.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            padding: 10px;
            z-index: 1001;
            min-width: 200px;
        `;
        
        actions.forEach(action => {
            const button = document.createElement('button');
            button.textContent = action.text;
            button.style.cssText = `
                width: 100%;
                padding: 12px 15px;
                border: none;
                background: white;
                text-align: left;
                cursor: pointer;
                border-radius: 5px;
                margin: 2px 0;
                transition: background 0.3s;
            `;
            
            button.onmouseover = () => button.style.background = '#f8f9fa';
            button.onmouseout = () => button.style.background = 'white';
            button.onclick = () => {
                action.action();
                menu.remove();
            };
            
            menu.appendChild(button);
        });
        
        document.body.appendChild(menu);
        
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !e.target.classList.contains('float-btn')) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
        
    } catch (error) {
        console.error('Error en showQuickActions:', error);
    }
}

function closeModal(modalId) {
    try {
        if (window.ModalUtils) {
            window.ModalUtils.close(modalId);
        }
    } catch (error) {
        console.error('Error en closeModal:', error);
    }
}

function logout() {
    try {
        if (confirm('¿Está seguro de cerrar sesión?')) {
            autoSaveReport();
            if (window.AuthSys) {
                window.AuthSys.logout();
            } else {
                window.location.href = '../index.html';
            }
        }
    } catch (error) {
        console.error('Error en logout:', error);
        window.location.href = '../index.html';
    }
}

function loadUserData() {
    try {
        loadUserReports();
        updateReportsCount();
        updateTasksCount();
        
        setTimeout(loadAutoSavedReport, 1000);
    } catch (error) {
        console.error('Error en loadUserData:', error);
    }
}

// === FUNCIONES EXPORTADAS GLOBALMENTE ===
window.showSection = showSection;
window.completeTask = completeTask;
window.confirmTaskCompletion = confirmTaskCompletion;
window.updateProgressDisplay = updateProgressDisplay;
window.toggleLanguage = toggleLanguage;
window.viewReportHistory = viewReportHistory;
window.showQuickActions = showQuickActions;
window.closeModal = closeModal;
window.logout = logout;
window.showReportDetail = showReportDetail;
window.hideError = hideError;

console.log('✅ Funciones del consultor exportadas globalmente');