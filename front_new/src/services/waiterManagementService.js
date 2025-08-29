import api from './api';

class WaiterManagementService {
  // Listar garçons com filtros e paginação
  async getWaiters(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.status && params.status.length > 0) {
      params.status.forEach(s => queryParams.append('status[]', s));
    }
    if (params.turno && params.turno.length > 0) {
      params.turno.forEach(t => queryParams.append('turno[]', t));
    }
    if (params.setor && params.setor.length > 0) {
      params.setor.forEach(s => queryParams.append('setor[]', s));
    }
    if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/garcons?${queryParams.toString()}`);
    return response.data;
  }

  // Obter métricas gerais (KPIs)
  async getMetrics(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params.dataFim) queryParams.append('dataFim', params.dataFim);

    const response = await api.get(`/garcons/metrics/overview?${queryParams.toString()}`);
    return response.data;
  }

  // Obter detalhes de um garçom específico
  async getWaiter(id) {
    const response = await api.get(`/garcons/${id}`);
    return response.data;
  }

  // Criar novo garçom
  async createWaiter(waiterData) {
    const response = await api.post('/garcons', waiterData);
    return response.data;
  }

  // Atualizar garçom
  async updateWaiter(id, waiterData) {
    const response = await api.put(`/garcons/${id}`, waiterData);
    return response.data;
  }

  // Atualizar status do garçom
  async updateWaiterStatus(id, status) {
    const response = await api.patch(`/garcons/${id}`, { status });
    return response.data;
  }

  // Deletar garçom
  async deleteWaiter(id) {
    await api.delete(`/garcons/${id}`);
  }

  // Exportar relatório
  async exportReport(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.format) queryParams.append('format', params.format);
    if (params.q) queryParams.append('q', params.q);
    if (params.status && params.status.length > 0) {
      params.status.forEach(s => queryParams.append('status[]', s));
    }
    if (params.turno && params.turno.length > 0) {
      params.turno.forEach(t => queryParams.append('turno[]', t));
    }
    if (params.setor && params.setor.length > 0) {
      params.setor.forEach(s => queryParams.append('setor[]', s));
    }
    if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const response = await api.get(`/garcons/report?${queryParams.toString()}`, {
      responseType: 'blob'
    });

    // Criar link para download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Determinar extensão do arquivo
    let extension = 'csv';
    if (params.format === 'xlsx') extension = 'xlsx';
    else if (params.format === 'pdf') extension = 'pdf';
    
    link.setAttribute('download', `relatorio_garcons_${new Date().toISOString().split('T')[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  }

  // Obter opções de filtros
  getFilterOptions() {
    return {
      status: [
        { value: 'todos', label: 'Todos os status' },
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
        { value: 'licenca', label: 'Licença' },
        { value: 'ferias', label: 'Férias' }
      ],
      turno: [
        { value: 'todos', label: 'Todos os turnos' },
        { value: 'Integral', label: 'Integral (06:00 - 22:00)' },
        { value: 'Manhã', label: 'Manhã (06:00 - 14:00)' },
        { value: 'Tarde', label: 'Tarde (14:00 - 22:00)' },
        { value: 'Noite', label: 'Noite (18:00 - 02:00)' }
      ],
      setor: [
        { value: 'todos', label: 'Todos os setores' },
        { value: 'Salão', label: 'Salão' },
        { value: 'Terraço', label: 'Terraço' },
        { value: 'VIP', label: 'VIP' },
        { value: 'Delivery', label: 'Delivery' }
      ]
    };
  }
}

export default new WaiterManagementService();
