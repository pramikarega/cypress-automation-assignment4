import { API_URL } from './constants'

/**
 * Login melalui API dan mengembalikan JWT token.
 * Contoh: cy.apiLogin().then((token) => { ... })
 */
Cypress.Commands.add('apiLogin', (email, password) => {
  return cy.fixture('users').then((users) => {
    return cy
      .request({
        method: 'POST',
        url: `${API_URL}/api/auth/login`,
        body: {
          email: email || users.standard.email,
          password: password || users.standard.password,
        },
      })
      .then((res) => {
        expect(res.status).to.eq(200)
        return res.body.data.token
      })
  })
})

/**
 * Request ke API dengan header Authorization Bearer token.
 * failOnStatusCode dimatikan agar skenario negatif bisa di-assert.
 */
Cypress.Commands.add('apiRequest', (method, path, token, body) => {
  return cy.request({
    method,
    url: `${API_URL}${path}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
    failOnStatusCode: false,
  })
})

/**
 * Login melalui UI (halaman https://labs.hendri.me).
 */
Cypress.Commands.add('uiLogin', (email, password) => {
  cy.visit('/')
  cy.get('#email').clear().type(email)
  cy.get('#password').clear().type(password, { log: false })
  cy.get('button[type="submit"]').click()
})
