/**
 * Aplicação principal
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeRouter();
  setupUtilityFunctions();
});

/**
 * Inicializa o roteador com as rotas da aplicação
 */
function initializeRouter() {
  // Rota da home
  router.addRoute('/', async (params) => {
    router.renderTemplate('home-template');
    
    try {
      // Carregar estatísticas do dashboard
      const [clientes, recorrencias] = await Promise.all([
        api.getClientes(),
        api.getRecorrencias()
      ]);
      
      // Exibir contadores
      document.getElementById('totalClientes').textContent = clientes.length;
      
      // Filtrar recorrências ativas
      const recorrenciasAtivas = recorrencias.filter(r => r.status === 'ativa');
      document.getElementById('totalRecorrencias').textContent = recorrenciasAtivas.length;
      
      // Verificar compras para hoje
      const hoje = new Date().toISOString().split('T')[0];
      const comprasHoje = recorrencias.filter(r => r.proxima_compra === hoje);
      document.getElementById('comprasHoje').textContent = comprasHoje.length;
      
      // Listar próximas compras
      loadProximasCompras();
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      showErrorMessage('Erro ao carregar estatísticas do dashboard.');
    }
  });
  
  // Rota de clientes
  router.addRoute('/clientes', async (params) => {
    renderPageTemplate('Clientes', `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
        <h1 class="h2">Clientes</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <a href="#/clientes/novo" class="btn btn-sm btn-primary">
            <i class="bi bi-plus-circle"></i> Novo Cliente
          </a>
        </div>
      </div>
      
      <div class="row mb-3">
        <div class="col-md-6 mb-3">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="searchCliente" class="form-control" placeholder="Buscar por nome ou CPF...">
          </div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Recorrências</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="clientesTableBody">
            <tr>
              <td colspan="5" class="text-center">Carregando...</td>
            </tr>
          </tbody>
        </table>
      </div>
    `);
    
    try {
      // Carregar clientes
      const clientes = await api.getClientes();
      
      const tableBody = document.getElementById('clientesTableBody');
      
      if (clientes.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center">Nenhum cliente cadastrado.</td>
          </tr>
        `;
        return;
      }
      
      // Renderizar tabela de clientes
      tableBody.innerHTML = clientes.map(cliente => `
        <tr>
          <td>${cliente.nome}</td>
          <td>${formatCPF(cliente.cpf)}</td>
          <td>${formatPhone(cliente.telefone || '')}</td>
          <td>
            <a href="#/recorrencias?cliente=${cliente.id}" class="btn btn-sm btn-outline-info">
              Ver Recorrências
            </a>
          </td>
          <td>
            <div class="btn-group">
              <a href="#/clientes/${cliente.id}" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-eye"></i>
              </a>
              <a href="#/clientes/${cliente.id}/editar" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-pencil"></i>
              </a>
              <button class="btn btn-sm btn-outline-danger btn-delete-cliente" data-id="${cliente.id}" data-nome="${cliente.nome}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
      
      // Adicionar evento para filtrar clientes
      const searchInput = document.getElementById('searchCliente');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const searchTerm = e.target.value.toLowerCase();
          
          const rows = tableBody.querySelectorAll('tr');
          rows.forEach(row => {
            const nome = row.cells[0]?.textContent.toLowerCase() || '';
            const cpf = row.cells[1]?.textContent.toLowerCase() || '';
            
            if (nome.includes(searchTerm) || cpf.includes(searchTerm)) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        });
      }
      
      // Adicionar evento para excluir cliente
      document.querySelectorAll('.btn-delete-cliente').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          const nome = e.currentTarget.dataset.nome;
          
          if (confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
            try {
              await api.deleteCliente(id);
              showSuccessMessage('Cliente excluído com sucesso!');
              router.navigateTo('/clientes');
            } catch (error) {
              console.error('Erro ao excluir cliente:', error);
              showErrorMessage('Erro ao excluir cliente. Verifique se não há recorrências associadas.');
            }
          }
        });
      });
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showErrorMessage('Erro ao carregar clientes.');
    }
  });
  
  // Adicionar outras rotas (clientes/novo, recorrências, etc)
  // ...
  
  // Iniciar o roteador
  router.init();
}

/**
 * Configura funções utilitárias globais
 */
function setupUtilityFunctions() {
  // Formatar CPF
  window.formatCPF = function(cpf) {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return cpf;
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  };
  
  // Formatar telefone
  window.formatPhone = function(phone) {
    if (!phone) return '';
    phone = phone.replace(/\D/g, '');
    if (phone.length !== 11) return phone;
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };
  
  // Formatar data
  window.formatDate = function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };
  
  // Formatar moeda
  window.formatCurrency = function(value) {
    if (value === undefined || value === null) return 'R$ 0,00';
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
  };
  
  // Exibir mensagem de sucesso
  window.showSuccessMessage = function(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-success alert-dismissible fade show fixed-top mx-auto mt-3';
    alertElement.style.maxWidth = '500px';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    document.body.appendChild(alertElement);
    
    setTimeout(() => {
      alertElement.remove();
    }, 5000);
  };
  
  // Exibir mensagem de erro
  window.showErrorMessage = function(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show fixed-top mx-auto mt-3';
    alertElement.style.maxWidth = '500px';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    document.body.appendChild(alertElement);
    
    setTimeout(() => {
      alertElement.remove();
    }, 5000);
  };
}

/**
 * Renderiza um template de página com título
 * @param {string} title - Título da página
 * @param {string} content - Conteúdo HTML
 */
function renderPageTemplate(title, content) {
  router.renderContent(`
    <div class="fade-in">
      ${content}
    </div>
  `);
  
  // Atualizar título da página
  document.title = `${title} - NMalls Recorrência`;
}

/**
 * Carrega as próximas compras para o dashboard
 */
async function loadProximasCompras() {
  try {
    const recorrencias = await api.getRecorrencias();
    
    // Ordenar por data de próxima compra
    recorrencias.sort((a, b) => new Date(a.proxima_compra) - new Date(b.proxima_compra));
    
    // Pegar as 5 primeiras
    const proximasCompras = recorrencias.slice(0, 5);
    
    const tbody = document.getElementById('proximasCompras');
    
    if (proximasCompras.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">Nenhuma compra recorrente programada.</td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = proximasCompras.map(rec => `
      <tr>
        <td>${rec.cliente?.nome || '-'}</td>
        <td>${formatPhone(rec.cliente?.telefone || '')}</td>
        <td>${formatDate(rec.proxima_compra)}</td>
        <td>${formatCurrency(rec.valor_total)}</td>
        <td>
          <a href="#/recorrencias/${rec.id}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-eye"></i> Detalhes
          </a>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar próximas compras:', error);
    document.getElementById('proximasCompras').innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger">Erro ao carregar próximas compras.</td>
      </tr>
    `;
  }
} 