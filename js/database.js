/**
 * === SISTEMA DE BASE DE DATOS PARA PORTAL ARVIC ===
 * Maneja todos los datos del portal usando localStorage
 */

class PortalDatabase {
    constructor() {
        this.prefix = 'arvic_';
        this.initializeDefaultData();
    }

    // === INICIALIZACIÓN ===
    initializeDefaultData() {
        // Verificar si ya existen datos
        if (!this.getData('initialized')) {
            this.setupDefaultUsers();
            this.setupDefaultCompanies();
            this.setupDefaultProjects();
            this.setData('initialized', true);
            this.setData('user_counter', 3);
            this.setData('company_counter', 4);
            this.setData('project_counter', 4);
        }
    }

    setupDefaultUsers() {
        const defaultUsers = {
            'admin': {
                id: 'admin',
                name: 'Administrador Principal',
                email: 'admin@arvic.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0001': {
                id: '0001',
                name: 'Juan Pérez García',
                email: 'juan.perez@arvic.com',
                password: 'consultor123',
                role: 'consultor',
                createdAt: new Date().toISOString(),
                isActive: true,
                assignedCompany: '0001',
                assignedProject: '0001',
                reportType: 'Mensual'
            },
            '0002': {
                id: '0002',
                name: 'María Elena Rodríguez',
                email: 'maria.rodriguez@arvic.com',
                password: 'consultor456',
                role: 'consultor',
                createdAt: new Date().toISOString(),
                isActive: true,
                assignedCompany: '0002',
                assignedProject: '0002',
                reportType: 'Semanal'
            }
        };
        this.setData('users', defaultUsers);
    }

    setupDefaultCompanies() {
        const defaultCompanies = {
            '0001': {
                id: '0001',
                name: 'Tecnología Avanzada SA de CV',
                description: 'Empresa especializada en soluciones tecnológicas',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0002': {
                id: '0002',
                name: 'Consultoría Digital SRL',
                description: 'Servicios de consultoría y transformación digital',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0003': {
                id: '0003',
                name: 'Innovación Tech Corp',
                description: 'Desarrollo de software y aplicaciones móviles',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('companies', defaultCompanies);
    }

    setupDefaultProjects() {
        const defaultProjects = {
            '0001': {
                id: '0001',
                name: 'Sistema de Gestión Empresarial',
                description: 'ERP completo para gestión de recursos empresariales',
                status: 'En Progreso',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0002': {
                id: '0002',
                name: 'Portal Web Corporativo',
                description: 'Desarrollo de sitio web institucional con CMS',
                status: 'En Progreso',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0003': {
                id: '0003',
                name: 'App Móvil de Ventas',
                description: 'Aplicación móvil para gestión de ventas y clientes',
                status: 'Planificación',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('projects', defaultProjects);
    }

    // === MÉTODOS GENERALES ===
    setData(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    deleteData(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            return false;
        }
    }

    clearAllData() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // === GESTIÓN DE USUARIOS ===
    getUsers() {
        return this.getData('users') || {};
    }

    getUser(userId) {
        const users = this.getUsers();
        return users[userId] || null;
    }

    createUser(userData) {
        const users = this.getUsers();
        const counter = this.getData('user_counter') || 1;
        const userId = counter.toString().padStart(4, '0');
        
        const newUser = {
            id: userId,
            name: userData.name,
            email: userData.email || '',
            password: userData.password || `user${userId}`,
            role: userData.role || 'consultor',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        users[userId] = newUser;
        this.setData('users', users);
        this.setData('user_counter', counter + 1);
        
        return { success: true, user: newUser };
    }

    updateUser(userId, updateData) {
        const users = this.getUsers();
        if (!users[userId]) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        users[userId] = { ...users[userId], ...updateData };
        this.setData('users', users);
        
        return { success: true, user: users[userId] };
    }

    deleteUser(userId) {
        const users = this.getUsers();
        if (!users[userId]) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        delete users[userId];
        this.setData('users', users);
        
        // Eliminar asignaciones relacionadas
        this.deleteAssignmentsByUser(userId);
        
        return { success: true, message: 'Usuario eliminado correctamente' };
    }

    validateUser(userId, password) {
        const user = this.getUser(userId);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        if (user.password !== password) {
            return { success: false, message: 'Contraseña incorrecta' };
        }
        
        if (!user.isActive) {
            return { success: false, message: 'Usuario inactivo' };
        }
        
        return { success: true, user: user };
    }

    // === GESTIÓN DE EMPRESAS ===
    getCompanies() {
        return this.getData('companies') || {};
    }

    getCompany(companyId) {
        const companies = this.getCompanies();
        return companies[companyId] || null;
    }

    createCompany(companyData) {
        const companies = this.getCompanies();
        const counter = this.getData('company_counter') || 1;
        const companyId = counter.toString().padStart(4, '0');
        
        const newCompany = {
            id: companyId,
            name: companyData.name,
            description: companyData.description || '',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        companies[companyId] = newCompany;
        this.setData('companies', companies);
        this.setData('company_counter', counter + 1);
        
        return { success: true, company: newCompany };
    }

    updateCompany(companyId, updateData) {
        const companies = this.getCompanies();
        if (!companies[companyId]) {
            return { success: false, message: 'Empresa no encontrada' };
        }
        
        companies[companyId] = { ...companies[companyId], ...updateData };
        this.setData('companies', companies);
        
        return { success: true, company: companies[companyId] };
    }

    deleteCompany(companyId) {
        const companies = this.getCompanies();
        if (!companies[companyId]) {
            return { success: false, message: 'Empresa no encontrada' };
        }
        
        delete companies[companyId];
        this.setData('companies', companies);
        
        // Eliminar asignaciones relacionadas
        this.deleteAssignmentsByCompany(companyId);
        
        return { success: true, message: 'Empresa eliminada correctamente' };
    }

    // === GESTIÓN DE PROYECTOS ===
    getProjects() {
        return this.getData('projects') || {};
    }

    getProject(projectId) {
        const projects = this.getProjects();
        return projects[projectId] || null;
    }

    createProject(projectData) {
        const projects = this.getProjects();
        const counter = this.getData('project_counter') || 1;
        const projectId = counter.toString().padStart(4, '0');
        
        const newProject = {
            id: projectId,
            name: projectData.name,
            description: projectData.description || '',
            status: projectData.status || 'Planificación',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        projects[projectId] = newProject;
        this.setData('projects', projects);
        this.setData('project_counter', counter + 1);
        
        return { success: true, project: newProject };
    }

    updateProject(projectId, updateData) {
        const projects = this.getProjects();
        if (!projects[projectId]) {
            return { success: false, message: 'Proyecto no encontrado' };
        }
        
        projects[projectId] = { ...projects[projectId], ...updateData };
        this.setData('projects', projects);
        
        return { success: true, project: projects[projectId] };
    }

    deleteProject(projectId) {
        const projects = this.getProjects();
        if (!projects[projectId]) {
            return { success: false, message: 'Proyecto no encontrado' };
        }
        
        delete projects[projectId];
        this.setData('projects', projects);
        
        // Eliminar asignaciones relacionadas
        this.deleteAssignmentsByProject(projectId);
        
        return { success: true, message: 'Proyecto eliminado correctamente' };
    }

    // === GESTIÓN DE ASIGNACIONES ===
    getAssignments() {
        return this.getData('assignments') || {};
    }

    getAssignment(assignmentId) {
        const assignments = this.getAssignments();
        return assignments[assignmentId] || null;
    }

    createAssignment(assignmentData) {
        const assignments = this.getAssignments();
        const assignmentId = Date.now().toString();
        
        // Verificar que existan el usuario, empresa y proyecto
        const user = this.getUser(assignmentData.userId);
        const company = this.getCompany(assignmentData.companyId);
        const project = this.getProject(assignmentData.projectId);
        
        if (!user || !company || !project) {
            return { success: false, message: 'Usuario, empresa o proyecto no válido' };
        }
        
        const newAssignment = {
            id: assignmentId,
            userId: assignmentData.userId,
            companyId: assignmentData.companyId,
            projectId: assignmentData.projectId,
            reportType: assignmentData.reportType,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        assignments[assignmentId] = newAssignment;
        this.setData('assignments', assignments);
        
        // Actualizar usuario con la asignación
        this.updateUser(assignmentData.userId, {
            assignedCompany: assignmentData.companyId,
            assignedProject: assignmentData.projectId,
            reportType: assignmentData.reportType
        });
        
        return { success: true, assignment: newAssignment };
    }

    deleteAssignment(assignmentId) {
        const assignments = this.getAssignments();
        const assignment = assignments[assignmentId];
        
        if (!assignment) {
            return { success: false, message: 'Asignación no encontrada' };
        }
        
        // Remover asignación del usuario
        const user = this.getUser(assignment.userId);
        if (user) {
            this.updateUser(assignment.userId, {
                assignedCompany: null,
                assignedProject: null,
                reportType: null
            });
        }
        
        delete assignments[assignmentId];
        this.setData('assignments', assignments);
        
        return { success: true, message: 'Asignación eliminada correctamente' };
    }

    deleteAssignmentsByUser(userId) {
        const assignments = this.getAssignments();
        Object.keys(assignments).forEach(assignmentId => {
            if (assignments[assignmentId].userId === userId) {
                delete assignments[assignmentId];
            }
        });
        this.setData('assignments', assignments);
    }

    deleteAssignmentsByCompany(companyId) {
        const assignments = this.getAssignments();
        Object.keys(assignments).forEach(assignmentId => {
            if (assignments[assignmentId].companyId === companyId) {
                delete assignments[assignmentId];
            }
        });
        this.setData('assignments', assignments);
    }

    deleteAssignmentsByProject(projectId) {
        const assignments = this.getAssignments();
        Object.keys(assignments).forEach(assignmentId => {
            if (assignments[assignmentId].projectId === projectId) {
                delete assignments[assignmentId];
            }
        });
        this.setData('assignments', assignments);
    }

    // === GESTIÓN DE REPORTES ===
    getReports() {
        return this.getData('reports') || {};
    }

    getReportsByUser(userId) {
        const reports = this.getReports();
        return Object.values(reports).filter(report => report.userId === userId);
    }

    createReport(reportData) {
        const reports = this.getReports();
        const reportId = Date.now().toString();
        
        const newReport = {
            id: reportId,
            userId: reportData.userId,
            title: reportData.title,
            content: reportData.content,
            reportType: reportData.reportType,
            status: 'Pendiente',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        reports[reportId] = newReport;
        this.setData('reports', reports);
        
        return { success: true, report: newReport };
    }

    updateReport(reportId, updateData) {
        const reports = this.getReports();
        if (!reports[reportId]) {
            return { success: false, message: 'Reporte no encontrado' };
        }
        
        reports[reportId] = { 
            ...reports[reportId], 
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        this.setData('reports', reports);
        
        return { success: true, report: reports[reportId] };
    }

    deleteReport(reportId) {
        const reports = this.getReports();
        if (!reports[reportId]) {
            return { success: false, message: 'Reporte no encontrado' };
        }
        
        delete reports[reportId];
        this.setData('reports', reports);
        
        return { success: true, message: 'Reporte eliminado correctamente' };
    }

    // === ESTADÍSTICAS ===
    getStats() {
        const users = this.getUsers();
        const companies = this.getCompanies();
        const projects = this.getProjects();
        const assignments = this.getAssignments();
        const reports = this.getReports();
        
        return {
            totalUsers: Object.keys(users).length - 1, // -1 para excluir admin
            totalCompanies: Object.keys(companies).length,
            totalProjects: Object.keys(projects).length,
            totalAssignments: Object.keys(assignments).length,
            totalReports: Object.keys(reports).length,
            activeUsers: Object.values(users).filter(u => u.isActive && u.role === 'consultor').length,
            pendingReports: Object.values(reports).filter(r => r.status === 'Pendiente').length
        };
    }

    // === UTILIDADES ===
    generateId(type = 'general') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${type}_${timestamp}_${random}`;
    }

    exportData() {
        const data = {
            users: this.getUsers(),
            companies: this.getCompanies(),
            projects: this.getProjects(),
            assignments: this.getAssignments(),
            reports: this.getReports(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.users) this.setData('users', data.users);
            if (data.companies) this.setData('companies', data.companies);
            if (data.projects) this.setData('projects', data.projects);
            if (data.assignments) this.setData('assignments', data.assignments);
            if (data.reports) this.setData('reports', data.reports);
            
            return { success: true, message: 'Datos importados correctamente' };
        } catch (error) {
            return { success: false, message: 'Error al importar datos: ' + error.message };
        }
    }
}

// Crear instancia global de la base de datos
window.PortalDB = new PortalDatabase();