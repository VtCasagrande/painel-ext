/**
 * Classe para lidar com requisições à API
 */
class API {
  /**
   * Construtor
   */
  constructor() {
    this.baseUrl = '/api';
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Define o token de autenticação para as requisições
   * @param {string} token - Token JWT
   */
  setToken(token) {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  /**
   * Faz uma requisição GET
   * @param {string} endpoint - Endpoint da API
   * @returns {Promise} - Promise com o resultado da requisição
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  /**
   * Faz uma requisição POST
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @returns {Promise} - Promise com o resultado da requisição
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  /**
   * Faz uma requisição PUT
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @returns {Promise} - Promise com o resultado da requisição
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  /**
   * Faz uma requisição DELETE
   * @param {string} endpoint - Endpoint da API
   * @returns {Promise} - Promise com o resultado da requisição
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
      }

      // Se o status for 204, não há conteúdo para retornar
      if (response.status === 204) {
        return true;
      }

      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }

  // Métodos específicos para cada recurso

  // Clientes
  async getClientes() {
    return this.get('/clientes');
  }

  async getClienteById(id) {
    return this.get(`/clientes/${id}`);
  }

  async getClienteByCPF(cpf) {
    return this.get(`/clientes/cpf/${cpf}`);
  }

  async createCliente(cliente) {
    return this.post('/clientes', cliente);
  }

  async updateCliente(id, cliente) {
    return this.put(`/clientes/${id}`, cliente);
  }

  async deleteCliente(id) {
    return this.delete(`/clientes/${id}`);
  }

  // Recorrências
  async getRecorrencias() {
    return this.get('/recorrencias');
  }

  async getRecorrenciaById(id) {
    return this.get(`/recorrencias/${id}`);
  }

  async getRecorrenciasByCliente(clienteId) {
    return this.get(`/recorrencias/cliente/${clienteId}`);
  }

  async createRecorrencia(recorrencia) {
    return this.post('/recorrencias', recorrencia);
  }

  async updateRecorrencia(id, recorrencia) {
    return this.put(`/recorrencias/${id}`, recorrencia);
  }

  async deleteRecorrencia(id) {
    return this.delete(`/recorrencias/${id}`);
  }

  async registrarCompra(id, data) {
    return this.post(`/recorrencias/${id}/registrar-compra`, data);
  }

  async getHistoricoCompras(id) {
    return this.get(`/recorrencias/${id}/historico`);
  }

  // Produtos
  async getProdutos() {
    return this.get('/produtos');
  }

  async getProdutoById(id) {
    return this.get(`/produtos/${id}`);
  }

  async getProdutoByCodigo(codigo) {
    return this.get(`/produtos/codigo/${codigo}`);
  }

  async createProduto(produto) {
    return this.post('/produtos', produto);
  }

  async updateProduto(id, produto) {
    return this.put(`/produtos/${id}`, produto);
  }

  async deleteProduto(id) {
    return this.delete(`/produtos/${id}`);
  }

  async buscarProdutos(termo) {
    return this.get(`/produtos/busca/${termo}`);
  }

  // Autenticação
  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async verificarToken() {
    return this.get('/auth/verificar');
  }
}

// Exporta uma instância da classe API
const api = new API(); 