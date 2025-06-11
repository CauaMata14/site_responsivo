// Gerenciador de Carrinho
class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.cartCount = this.calculateCartCount();
    this.updateCartCount();
    this.setupEventListeners();
  }

  // Calcular o total de itens no carrinho
  calculateCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Atualizar o contador do carrinho na interface
  updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
      element.textContent = this.cartCount;
      element.style.display = this.cartCount > 0 ? 'inline-block' : 'none';
    });
  }

  // Adicionar item ao carrinho
  addItem(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image || 'imagens/sem-imagem.jpg',
        quantity: 1
      });
    }
    
    this.cartCount = this.calculateCartCount();
    this.updateCartCount();
    this.saveCart();
    this.showNotification(`"${product.name}" adicionado ao carrinho!`);
  }

  // Remover item do carrinho
  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.cartCount = this.calculateCartCount();
    this.updateCartCount();
    this.saveCart();
  }

  // Atualizar quantidade de um item
  updateQuantity(productId, newQuantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, parseInt(newQuantity) || 1);
      this.cartCount = this.calculateCartCount();
      this.updateCartCount();
      this.saveCart();
    }
  }

  // Obter todos os itens do carrinho
  getItems() {
    return [...this.cart];
  }

  // Calcular o total do carrinho
  calculateTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Limpar o carrinho
  clearCart() {
    this.cart = [];
    this.cartCount = 0;
    this.updateCartCount();
    this.saveCart();
  }

  // Salvar carrinho no localStorage
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  // Mostrar notificação
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Adicionar classe para animação de entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Configurar eventos
  setupEventListeners() {
    // Evento para botões de adicionar ao carrinho
    document.addEventListener('click', (e) => {
      const addToCartBtn = e.target.closest('.add-to-cart-btn');
      if (addToCartBtn) {
        e.preventDefault();
        const product = {
          id: addToCartBtn.dataset.id,
          name: addToCartBtn.dataset.name,
          price: parseFloat(addToCartBtn.dataset.price),
          image: addToCartBtn.dataset.image || ''
        };
        this.addItem(product);
      }

      // Evento para o botão do carrinho no cabeçalho
      const cartLink = e.target.closest('#carrinhoLink');
      if (cartLink) {
        // Se não houver itens no carrinho, impede a navegação
        if (this.cartCount === 0) {
          e.preventDefault();
          this.showNotification('Adicione itens ao carrinho primeiro!');
        } else {
          window.location.href = 'checkout.html';
        }
      }
    });
  }
}

// Inicializar o gerenciador de carrinho
const cartManager = new CartManager();

// Função para carregar itens do carrinho na página de checkout
function loadCheckoutItems() {
  const checkoutItems = document.getElementById('checkout-items');
  const cartTotal = document.getElementById('cart-total');
  const cartSubtotal = document.getElementById('cart-subtotal');
  
  if (!checkoutItems) return;
  
  const items = cartManager.getItems();
  
  if (items.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  
  // Calcular totais
  const subtotal = cartManager.calculateTotal();
  const frete = 0; // Frete grátis para este exemplo
  const total = subtotal + frete;
  
  // Atualizar itens
  checkoutItems.innerHTML = items.map(item => `
    <div class="order-item">
      <img src="${item.image}" alt="${item.name}" class="order-item-img">
      <div class="order-item-details">
        <h4 class="order-item-title">${item.name}</h4>
        <p class="order-item-quantity">Quantidade: ${item.quantity}</p>
        <p class="order-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
      </div>
    </div>
  `).join('');
  
  // Atualizar totais
  if (cartSubtotal) {
    cartSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  }
  
  if (cartTotal) {
    cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
}

// Carregar itens do carrinho quando a página de checkout for carregada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCheckoutItems);
} else {
  loadCheckoutItems();
}

// Exportar para uso em outros arquivos
window.cartManager = cartManager;
