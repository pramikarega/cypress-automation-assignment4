/// <reference types="cypress" />

describe('UI - Login Script Labs', () => {
  let users

  before(() => {
    cy.fixture('users').then((data) => {
      users = data
    })
  })

  it('Halaman utama tampil dan dapat diakses', () => {
    cy.visit('/')
    cy.title().should('eq', 'Script Labs - QA Testing Platform')
    cy.contains('h1', 'Script Labs').should('be.visible')
    cy.get('#auth-panel').should('contain', 'Welcome Back')
    cy.get('#email').should('have.attr', 'placeholder', 'Enter your email')
    cy.get('#password').should('have.attr', 'type', 'password')
  })

  it('Login berhasil dengan akun standard_user', () => {
    cy.uiLogin(users.standard.email, users.standard.password)
    cy.get('#welcome-user').should('have.text', `Hello, ${users.standard.email}`)
    cy.contains('button', 'Logout').should('be.visible')
    cy.get('[data-testid="shop-section"]').should('be.visible')
  })

  it('Login gagal dengan password salah', () => {
    cy.uiLogin(users.invalid.email, users.invalid.password)
    cy.contains('Invalid email or password').should('be.visible')
    cy.get('#welcome-user').should('not.exist')
  })

  it('Login gagal dengan akun yang terkunci', () => {
    cy.uiLogin(users.locked.email, users.locked.password)
    cy.contains(/locked/i).should('be.visible')
    cy.get('#welcome-user').should('not.exist')
  })

  it('Logout kembali ke halaman login', () => {
    cy.uiLogin(users.standard.email, users.standard.password)
    cy.get('#welcome-user').should('be.visible')
    cy.contains('button', 'Logout').click()
    cy.get('#email').should('be.visible')
    cy.get('#welcome-user').should('not.exist')
  })
})
