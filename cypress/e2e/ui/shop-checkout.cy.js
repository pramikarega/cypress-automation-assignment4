/// <reference types="cypress" />

describe('UI - Product Shop, Cart & Checkout', () => {
  beforeEach(() => {
    cy.fixture('users').then(({ standard }) => {
      cy.uiLogin(standard.email, standard.password)
    })
    cy.get('[data-testid="shop-section"]').should('be.visible')
  })

  it('Menampilkan 6 produk dan cart kosong', () => {
    cy.get('[data-testid="shop-section"] article').should('have.length', 6)
    cy.get('[data-testid="cart-panel"]').should('contain', 'Your cart is empty')
    cy.get('[data-testid="cart-total"]').invoke('text').should('match', /Rp\s0/)
    cy.get('[data-testid="checkout-submit"]').should('be.disabled')
  })

  it('Search produk berdasarkan nama', () => {
    cy.get('[data-testid="product-search"]').type('Cypress')
    cy.get('[data-testid="shop-section"] article')
      .should('have.length', 1)
      .and('contain', 'Cypress Checkout Suite')
  })

  it('Filter produk berdasarkan kategori', () => {
    cy.get('[data-testid="category-filter"]').select('API Testing')
    cy.get('[data-testid="shop-section"] article')
      .should('have.length', 1)
      .and('contain', 'Postman API Collection')
  })

  it('Add to cart, ubah quantity, dan remove item', () => {
    cy.get('[data-testid="add-cypress-checkout-suite"]').click()
    cy.get('[data-testid="add-postman-api-collection"]').click()
    cy.get('[data-testid="cart-total"]').invoke('text').should('match', /Rp\s118\.000/)

    // Tambah quantity Cypress Checkout Suite menjadi 2
    cy.get('button[aria-label="Increase Cypress Checkout Suite"]').click()
    cy.get('[data-testid="qty-cypress-checkout-suite"]').should('have.text', '2')
    cy.get('[data-testid="cart-total"]').invoke('text').should('match', /Rp\s197\.000/)

    // Kurangi lagi menjadi 1
    cy.get('button[aria-label="Decrease Cypress Checkout Suite"]').click()
    cy.get('[data-testid="qty-cypress-checkout-suite"]').should('have.text', '1')

    // Remove Postman API Collection
    cy.get('[data-testid="qty-postman-api-collection"]')
      .parent() // container tombol quantity
      .parent() // baris item cart
      .contains('button', 'Remove')
      .click()
    cy.get('[data-testid="qty-postman-api-collection"]').should('not.exist')
    cy.get('[data-testid="cart-total"]').invoke('text').should('match', /Rp\s79\.000/)
  })

  it('Checkout berhasil dengan data lengkap', () => {
    cy.get('[data-testid="add-selenium-login-pack"]').click()
    cy.get('[data-testid="checkout-name"]').type('QA Tester')
    cy.get('[data-testid="checkout-email"]').type('qa.tester@example.com')
    cy.get('textarea[name="notes"]').type('Checkout via Cypress UI automation')
    cy.get('[data-testid="checkout-submit"]').should('be.enabled').click()

    cy.get('[data-testid="checkout-success"]')
      .should('be.visible')
      .and('contain', 'Checkout successful')
    cy.get('[data-testid="cart-panel"]').should('contain', 'Your cart is empty')
  })

  it('Checkout gagal jika field wajib kosong', () => {
    cy.get('[data-testid="add-selenium-login-pack"]').click()
    cy.get('[data-testid="checkout-submit"]').click()
    cy.get('[data-testid="checkout-success"]').should('not.exist')
    cy.get('[data-testid="checkout-name"]').then(($input) => {
      expect($input[0].checkValidity()).to.eq(false)
    })
  })
})
