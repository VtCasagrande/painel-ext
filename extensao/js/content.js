// Função para extrair CPF do DOM na página do Tiny ERP
function extractCPFFromPage() {
  // Procurando elementos que contenham CPF na página de venda do Tiny
  const cpfField = document.querySelector('input[name="nomeContatoCPV"]');
  const cpfFieldValue = document.querySelector('input[id="idContatoCPV"]');
  
  if (cpfField && cpfFieldValue) {
    const cpfFieldContainer = cpfField.closest('.pdv-coluna-info');
    
    if (cpfFieldContainer) {
      // Adicionar botão de recorrência
      addRecurrenceButton(cpfFieldContainer, cpfField.value, cpfFieldValue.value);
    }
  }
}

// Função para adicionar botão de consulta de recorrência
function addRecurrenceButton(container, clienteName, cpfValue) {
  // Verificar se o botão já existe para evitar duplicação
  if (document.getElementById('nmalls-recurrence-btn')) {
    return;
  }
  
  // Criar container para o botão
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'nmalls-button-container';
  
  // Criar botão
  const button = document.createElement('button');
  button.id = 'nmalls-recurrence-btn';
  button.className = 'nmalls-btn';
  button.textContent = 'Consultar Recorrência';
  
  // Adicionar evento de clique
  button.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Remover caracteres não numéricos do CPF
    const cpf = cpfValue.replace(/\D/g, '');
    
    // Enviar mensagem para o background script
    chrome.runtime.sendMessage({
      action: 'openRecurrencePopup',
      data: { cpf: cpf, clienteName: clienteName }
    });
  });
  
  // Adicionar botão ao container
  buttonContainer.appendChild(button);
  
  // Adicionar o container após o elemento existente
  container.insertAdjacentElement('afterend', buttonContainer);
}

// Observar mudanças no DOM para capturar quando a página carregar completamente
function observeDOM() {
  // Configurar o MutationObserver para monitorar mudanças no DOM
  const observer = new MutationObserver(function(mutations) {
    // Verificar alterações relevantes que indiquem que a página de venda foi carregada
    const relevantChange = mutations.some(mutation => {
      // Procurar por elementos que indicam que estamos na página de venda
      return document.querySelector('.pdv-coluna-info') !== null;
    });
    
    if (relevantChange) {
      // Tentar extrair o CPF da página
      extractCPFFromPage();
    }
  });
  
  // Iniciar observação
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeDOM);
} else {
  observeDOM();
}

// Adicionar estilos CSS
const style = document.createElement('style');
style.textContent = `
  .nmalls-button-container {
    margin: 10px 0;
    padding: 5px 0;
  }
  
  .nmalls-btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .nmalls-btn:hover {
    background-color: #2980b9;
  }
`;

document.head.appendChild(style); 