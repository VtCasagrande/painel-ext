// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openRecurrencePopup') {
    // Verificar se há um CPF na mensagem
    const cpf = request.data.cpf;
    
    if (cpf) {
      // Salvar temporariamente o CPF para uso no popup
      chrome.storage.local.set({ lastCpf: cpf }, () => {
        // Abrir o popup da extensão
        chrome.action.openPopup();
      });
    }
  }
  
  // Retornar true para manter a conexão aberta para resposta assíncrona
  return true;
});

// Abrir popup quando o ícone da extensão for clicado
chrome.action.onClicked.addListener((tab) => {
  // Verificar se estamos em uma página válida do Tiny ERP
  if (tab.url && tab.url.includes('erp.tiny.com.br')) {
    // Injetar script para tentar obter o CPF do cliente atual
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractCPFFromPage
    });
  }
});

// Função que será injetada na página para extrair o CPF do cliente atual
function extractCPFFromPage() {
  // Tentativa de encontrar o CPF na página atual do Tiny ERP
  const cpfField = document.querySelector('input[name="nomeContatoCPV"]');
  const cpfFieldValue = document.querySelector('input[id="idContatoCPV"]');
  
  if (cpfField && cpfFieldValue) {
    // Se encontrou, envia o CPF para o background script
    const cpf = cpfFieldValue.value.replace(/\D/g, '');
    
    chrome.runtime.sendMessage({
      action: 'foundCPF',
      data: { cpf: cpf, clienteName: cpfField.value }
    });
  }
}

// Ouvir por mensagens sobre CPF encontrado na página
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'foundCPF') {
    // Salvar o CPF encontrado para uso no popup
    chrome.storage.local.set({ 
      lastCpf: request.data.cpf,
      lastClienteName: request.data.clienteName
    });
  }
  
  // Retornar true para manter a conexão aberta para resposta assíncrona
  return true;
}); 