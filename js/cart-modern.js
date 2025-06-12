// cart-modern.js - Gerenciamento moderno do carrinho e finalização de compra
class Cart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.cartCountElements = document.querySelectorAll('.cart-count');
    this.updateCartCount();
    this.setupAddToCartButtons();
    this.setupCartIcon();
    this.syncCheckoutPage();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  updateCartCount() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    // Se estiver na página de produtos, não exibe o número
    if (window.location.pathname.includes('produtos.html')) {
      this.cartCountElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
      });
      return;
    }
    this.cartCountElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  showNotification(msg, success = true) {
    let notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.backgroundColor = success ? '#4CAF50' : '#f44336';
    notif.style.color = 'white';
    notif.style.padding = '15px 25px';
    notif.style.borderRadius = '5px';
    notif.style.zIndex = '1000';
    notif.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 500);
    }, 2500);
  }

  addItem(product) {
    // Garante que id seja sempre string para comparação correta
    const prodId = String(product.id);
    let found = this.cart.find(item => String(item.id) === prodId);
    if (found) {
      found.quantity += 1;
    } else {
      product.quantity = 1;
      this.cart.push(product);
    }
    this.saveCart();
    this.updateCartCount();
    this.showNotification(`${product.name} adicionado ao carrinho!`);
  }

  setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      // Remove event listeners duplicados
      btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const product = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price),
          image: btn.dataset.image || ''
        };
        this.addItem(product);
      });
    });
  }

  setupCartIcon() {
    const cartIcon = document.getElementById('abrirCarrinho') || document.getElementById('carrinhoLink');
    if (cartIcon) {
      cartIcon.addEventListener('click', e => {
        if (window.location.pathname.includes('checkout.html')) return;
        if (this.cart.length === 0) {
          e.preventDefault();
          this.showNotification('Seu carrinho está vazio!', false);
        } else {
          window.location.href = 'checkout.html';
        }
      });
    }
  }

  syncCheckoutPage() {
    if (!window.location.pathname.includes('checkout.html')) return;
    const checkoutItems = document.getElementById('checkout-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const finalizeBtn = document.getElementById('finalizeOrder');
    if (!checkoutItems) return;
    if (this.cart.length === 0) {
      checkoutItems.innerHTML = '<p class="text-center text-muted">Seu carrinho está vazio.</p>';
      if (cartSubtotal) cartSubtotal.textContent = 'R$ 0,00';
      if (cartTotal) cartTotal.textContent = 'R$ 0,00';
      if (finalizeBtn) finalizeBtn.disabled = true;
      return;
    }
    let subtotal = 0;
    checkoutItems.innerHTML = this.cart.map(item => {
      const totalItem = (item.price * item.quantity);
      subtotal += totalItem;
      return `<div class='order-item d-flex align-items-center mb-3 p-2 border rounded'>
        <div class='order-item-details flex-grow-1'>
          <strong class='order-item-title'>${item.name}</strong><br>
          <small class='order-item-quantity text-muted'>Valor unitário: R$ ${item.price.toFixed(2).replace('.', ',')}</small><br>
          <div class='d-flex align-items-center my-2'>
            <button class='btn btn-outline-secondary btn-sm me-2 btn-qty' data-action='decrease' data-id='${item.id}' type='button'>-</button>
            <span class='mx-2 fw-bold'>${item.quantity}</span>
            <button class='btn btn-outline-secondary btn-sm ms-2 btn-qty' data-action='increase' data-id='${item.id}' type='button'>+</button>
            <button class='btn btn-outline-danger btn-sm ms-3 btn-remove' data-id='${item.id}' type='button'><i class='fas fa-trash'></i></button>
          </div>
          <span class='order-item-price fw-bold'>Total: R$ ${(totalItem).toFixed(2).replace('.', ',')}</span>
        </div>
      </div>`;
    }).join('');

    // Adiciona listeners de quantidade e remover
    checkoutItems.querySelectorAll('.btn-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const idx = this.cart.findIndex(item => String(item.id) === String(id));
        if (idx !== -1) {
          if (action === 'increase') {
            this.cart[idx].quantity++;
          } else if (action === 'decrease' && this.cart[idx].quantity > 1) {
            this.cart[idx].quantity--;
          }
          this.saveCart();
          this.syncCheckoutPage();
        }
      });
    });
    checkoutItems.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        this.cart = this.cart.filter(item => String(item.id) !== String(id));
        this.saveCart();
        this.syncCheckoutPage();
      });
    });

    if (cartSubtotal) cartSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (cartTotal) cartTotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (finalizeBtn) {
      finalizeBtn.disabled = false;
      finalizeBtn.onclick = (e) => {
        e.preventDefault();
        this.processPayment(finalizeBtn);
      };
    }
  }

  processPayment(btn) {
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processando...';
    setTimeout(() => {
      this.cart = [];
      this.saveCart();
      this.updateCartCount();
      // Exibe mensagem de carinho, agradecimento e info sobre pagamento na entrega
      const container = document.querySelector('.payment-form') || document.body;
      container.innerHTML = `<div class='text-center py-5'>
        <i class='fas fa-heart fa-3x text-danger mb-3'></i>
        <h2 class='fw-bold mb-3'>Agradecemos sua compra!</h2>
        <p class='lead mb-3'>Que as flores tragam alegria ao seu dia! 🌹🌷🌻</p>
        <div class='alert alert-info mx-auto mb-4' style='max-width:400px;'>
          <i class='fas fa-info-circle me-2'></i>O pagamento será realizado no momento da entrega do seu pedido.
        </div>
        <a href='index.html' class='btn btn-primary mt-4'><i class='fas fa-home me-2'></i>Voltar para a loja</a>
      </div>`;
    }, 1800);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.cartModern = new Cart();
  // Força sincronização do carrinho ao abrir o checkout
  if (window.location.pathname.includes('checkout.html')) {
    window.cartModern.syncCheckoutPage();
  }
});
