/**
 * Classe para gerenciar o roteamento baseado em hash
 */
class Router {
  /**
   * Construtor
   */
  constructor() {
    this.routes = {};
    this.defaultRoute = '/';
    this.contentElement = document.getElementById('content');
    this.loadingElement = document.getElementById('loading');
  }

  /**
   * Adiciona uma rota
   * @param {string} path - Caminho da rota
   * @param {Function} callback - Função a ser executada
   */
  addRoute(path, callback) {
    this.routes[path] = callback;
  }

  /**
   * Define a rota padrão
   * @param {string} path - Caminho da rota padrão
   */
  setDefaultRoute(path) {
    this.defaultRoute = path;
  }

  /**
   * Inicializa o roteador
   */
  init() {
    // Adicionar listener para evento hashchange
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    
    // Processar rota inicial
    this.handleRouteChange();
  }

  /**
   * Lida com a mudança de rota
   */
  handleRouteChange() {
    let path = window.location.hash.substring(1) || this.defaultRoute;
    
    // Verificar se o caminho contém parâmetros (após ?)
    const queryIndex = path.indexOf('?');
    let params = {};
    
    if (queryIndex > -1) {
      const queryParams = path.substring(queryIndex + 1).split('&');
      path = path.substring(0, queryIndex);
      
      // Parse dos parâmetros da URL
      queryParams.forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value || '');
      });
    }
    
    this.navigateTo(path, params);
  }

  /**
   * Navega para uma rota específica
   * @param {string} path - Caminho da rota
   * @param {Object} params - Parâmetros da URL
   */
  navigateTo(path, params = {}) {
    this.showLoading();
    
    // Verificar se o caminho existe
    const routeCallback = this.findRouteCallback(path);
    
    // Se não existir, redirecionar para rota padrão ou 404
    if (!routeCallback) {
      window.location.hash = '#' + this.defaultRoute;
      return;
    }
    
    // Atualizar a URL se necessário
    if (window.location.hash.substring(1).split('?')[0] !== path) {
      window.location.hash = '#' + path;
      return; // O evento hashchange vai lidar com o resto
    }
    
    // Executar callback da rota
    try {
      routeCallback(params);
    } catch (error) {
      console.error('Erro ao carregar a rota:', error);
      this.showRouteError();
    }
  }

  /**
   * Encontra a callback para uma rota específica
   * @param {string} path - Caminho da rota
   * @returns {Function|null} - Callback da rota ou null
   */
  findRouteCallback(path) {
    // Verificar rota exata
    if (this.routes[path]) {
      return this.routes[path];
    }
    
    // Verificar rotas dinâmicas (com parâmetros)
    for (const routePath in this.routes) {
      // Verificar se a rota tem /:
      if (routePath.includes('/:')) {
        const regexPattern = routePath
          .replace(/:[a-zA-Z0-9_]+/g, '([^/]+)') // Substituir :param por ([^/]+)
          .replace(/\//g, '\\/'); // Escapar barras
        
        const regex = new RegExp(`^${regexPattern}$`);
        
        if (regex.test(path)) {
          const paramsNames = routePath.match(/:[a-zA-Z0-9_]+/g) || [];
          const paramsValues = path.match(regex).slice(1);
          
          return (queryParams) => {
            const routeParams = { ...queryParams };
            
            // Adicionar parâmetros de rota
            paramsNames.forEach((param, index) => {
              const paramName = param.substring(1); // Remover :
              routeParams[paramName] = paramsValues[index];
            });
            
            return this.routes[routePath](routeParams);
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Exibe o elemento de loading
   */
  showLoading() {
    if (this.loadingElement) {
      this.contentElement.innerHTML = '';
      this.loadingElement.classList.remove('d-none');
    }
  }

  /**
   * Esconde o elemento de loading
   */
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.classList.add('d-none');
    }
  }

  /**
   * Renderiza conteúdo em um elemento
   * @param {string} content - Conteúdo HTML a ser renderizado
   */
  renderContent(content) {
    this.hideLoading();
    
    if (this.contentElement) {
      this.contentElement.innerHTML = content;
    }
  }

  /**
   * Renderiza um template
   * @param {string} templateId - ID do elemento de template
   * @param {Object} data - Dados para o template
   */
  renderTemplate(templateId, data = {}) {
    const template = document.getElementById(templateId);
    
    if (template) {
      let content = template.innerHTML;
      
      // Substituir variáveis no template
      if (data) {
        Object.keys(data).forEach(key => {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          content = content.replace(regex, data[key]);
        });
      }
      
      this.renderContent(content);
    } else {
      console.error(`Template não encontrado: ${templateId}`);
      this.showRouteError();
    }
  }

  /**
   * Exibe mensagem de erro ao carregar rota
   */
  showRouteError() {
    this.hideLoading();
    
    if (this.contentElement) {
      this.contentElement.innerHTML = `
        <div class="alert alert-danger mt-4">
          <h4 class="alert-heading">Erro!</h4>
          <p>Ocorreu um erro ao carregar esta página. Tente novamente mais tarde.</p>
        </div>
      `;
    }
  }
}

// Inicializa o roteador
const router = new Router(); 