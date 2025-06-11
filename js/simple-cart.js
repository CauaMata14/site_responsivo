
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const cartCount = document.querySelector('.cart-count');
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  const cartIcon = document.getElementById('abrirCarrinho');
  
  // Inicializar contador do carrinho
  let count = 0;
  
  // Atualizar contador do carrinho
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (cartCount) {
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }
  
  // Adicionar ao carrinho
  function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Verifica se o produto já existe no carrinho
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      product.quantity = 1;
      cart.push(product);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(product.nome + ' adicionado ao carrinho!');
  }
  
  // Mostrar notificação
  function showNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Estilo da notificação
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.animation = 'slideIn 0.5s ease-out';
    
    // Adicionar ao corpo
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
  
  // Salvar carrinho no localStorage
  function saveCart() {
    localStorage.setItem('cartCount', count);
  }
  
  // Carregar carrinho do localStorage
  function loadCart() {
    const savedCount = localStorage.getItem('cartCount');
    if (savedCount) {
      count = parseInt(savedCount);
      updateCartCount();
    }
  }
  
  // Configurar eventos
  function setupEventListeners() {
    // Botões de adicionar ao carrinho
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const product = {
          nome: this.getAttribute('data-name') || 'Produto',
          preco: this.getAttribute('data-price') || '0',
          id: this.getAttribute('data-id') || '0'
        };
        addToCart(product);
      });
    });
    
    // Ícone do carrinho
    if (cartIcon) {
      cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        alert(`Você tem ${count} ${count === 1 ? 'item' : 'itens'} no carrinho.`);
        // Aqui você pode abrir o modal do carrinho se preferir
        // abrirCarrinho();
      });
    }
  }
  
  // Inicializar
  function init() {
    loadCart();
    setupEventListeners();
  }
  
  // Iniciar
  init();
});
