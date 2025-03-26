/**
 * Classe para gerenciar autenticação
 */
class Auth {
  /**
   * Construtor
   */
  constructor() {
    this.tokenKey = 'nmalls_token';
    this.userKey = 'nmalls_user';
    this.loginModalId = 'loginModal';
    this.loginFormId = 'loginForm';
    this.loginErrorId = 'loginError';
    this.logoutBtnId = 'logout';
    
    this.init();
  }

  /**
   * Inicializa o gerenciador de autenticação
   */
  init() {
    // Verificar se há token salvo
    const token = this.getToken();
    
    if (token) {
      api.setToken(token);
      this.verificarToken();
    } else {
      this.showLoginModal();
    }
    
    // Adicionar listeners para login e logout
    this.setupEventListeners();
  }

  /**
   * Configura os event listeners para autenticação
   */
  setupEventListeners() {
    // Form de login
    const loginForm = document.getElementById(this.loginFormId);
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById(this.logoutBtnId);
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }
  }

  /**
   * Realiza o login do usuário
   * @param {Event} event - Evento do formulário
   */
  async handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const loginError = document.getElementById(this.loginErrorId);
    
    try {
      const response = await api.login({ email, senha });
      
      if (response && response.token) {
        this.setToken(response.token);
        api.setToken(response.token);
        
        // Verificar token para obter dados do usuário
        await this.verificarToken();
        
        // Fechar modal de login
        this.hideLoginModal();
        
        // Recarregar a página para aplicar a autenticação
        window.location.reload();
      } else {
        this.showLoginError('Falha na autenticação. Verifique suas credenciais.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      this.showLoginError(error.message || 'Erro ao fazer login. Tente novamente.');
    }
  }

  /**
   * Realiza o logout do usuário
   * @param {Event} event - Evento do botão
   */
  handleLogout(event) {
    event.preventDefault();
    
    this.clearAuth();
    window.location.href = '/';
  }

  /**
   * Verifica se o token do usuário é válido
   */
  async verificarToken() {
    try {
      const response = await api.verificarToken();
      
      if (response && response.valido) {
        this.setUser(response.usuario);
        return true;
      } else {
        this.clearAuth();
        this.showLoginModal();
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      this.clearAuth();
      this.showLoginModal();
      return false;
    }
  }

  /**
   * Exibe o modal de login
   */
  showLoginModal() {
    const loginModal = document.getElementById(this.loginModalId);
    if (loginModal) {
      const modal = new bootstrap.Modal(loginModal);
      modal.show();
    }
  }

  /**
   * Esconde o modal de login
   */
  hideLoginModal() {
    const loginModal = document.getElementById(this.loginModalId);
    if (loginModal) {
      const modal = bootstrap.Modal.getInstance(loginModal);
      if (modal) {
        modal.hide();
      }
    }
  }

  /**
   * Exibe mensagem de erro no formulário de login
   * @param {string} message - Mensagem de erro
   */
  showLoginError(message) {
    const loginError = document.getElementById(this.loginErrorId);
    if (loginError) {
      loginError.textContent = message;
      loginError.classList.remove('d-none');
    }
  }

  /**
   * Salva o token no localStorage
   * @param {string} token - Token JWT
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Obtém o token do localStorage
   * @returns {string|null} - Token JWT ou null
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Salva os dados do usuário no localStorage
   * @param {Object} user - Dados do usuário
   */
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Obtém os dados do usuário do localStorage
   * @returns {Object|null} - Dados do usuário ou null
   */
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Limpa os dados de autenticação
   */
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    api.setToken(null);
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} - True se autenticado, false caso contrário
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

// Inicializa o gerenciador de autenticação após carregar o API
document.addEventListener('DOMContentLoaded', () => {
  // Garante que a API foi carregada
  if (typeof api !== 'undefined') {
    const auth = new Auth();
    window.auth = auth; // Expõe para uso global
  } else {
    console.error('API não foi carregada corretamente');
  }
}); 