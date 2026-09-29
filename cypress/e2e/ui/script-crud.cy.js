/// <reference types="cypress" />

describe('UI - Script CRUD', () => {
  const title = `Cypress UI Lab ${Date.now()}`
  const description = 'Dibuat oleh Cypress UI automation test'
  const updatedTitle = `${title} - Updated`
  const updatedDescription = 'Deskripsi di-update melalui UI'

  const openCrudTab = () => {
    cy.fixture('users').then(({ standard }) => {
      cy.uiLogin(standard.email, standard.password)
    })
    cy.contains('button[role="tab"]', 'Script CRUD').click()
    cy.contains('h2', 'Add New Script Lab').should('be.visible')
  }

  const searchScript = (keyword) => {
    cy.get('input[aria-label="Search scripts"]').clear().type(keyword)
  }

  beforeEach(openCrudTab)

  it('Tombol Add Script disabled jika form kosong', () => {
    cy.get('#title').should('have.value', '')
    cy.contains('button', 'Add Script').should('be.disabled')
  })

  it('Create - menambahkan script baru', () => {
    cy.intercept('POST', '**/api/labs').as('createLab')
    cy.get('#title').type(title)
    cy.get('#description').type(description)
    cy.contains('button', 'Add Script').should('be.enabled').click()
    cy.wait('@createLab').its('response.statusCode').should('eq', 201)

    cy.get('#title').should('have.value', '')
    searchScript(title)
    cy.contains('h3', title).should('be.visible').next('p').should('have.text', description)
  })

  it('Update - mengubah script yang sudah dibuat', () => {
    cy.intercept('PUT', '**/api/labs/*').as('updateLab')
    searchScript(title)
    cy.contains('h3', title).parent().contains('button', 'Edit').click()

    cy.get('input[placeholder="Script Title"]').clear().type(updatedTitle)
    cy.get('textarea[placeholder="Script Description"]').clear().type(updatedDescription)
    cy.contains('button', 'Save').click()
    cy.wait('@updateLab').its('response.statusCode').should('eq', 200)

    searchScript(updatedTitle)
    cy.contains('h3', updatedTitle).should('be.visible').next('p').should('have.text', updatedDescription)
  })

  it('Delete - menghapus script', () => {
    cy.intercept('DELETE', '**/api/labs/*').as('deleteLab')
    searchScript(updatedTitle)
    cy.contains('h3', updatedTitle).parent().contains('button', 'Delete').click()

    // Modal konfirmasi hapus
    cy.get('.modal-content').should('be.visible').within(() => {
      cy.contains('h3', 'Confirm Delete').should('be.visible')
      cy.get('.item-title-highlight').should('have.text', `"${updatedTitle}"`)
      cy.contains('button', 'Delete').click()
    })
    cy.wait('@deleteLab').its('response.statusCode').should('eq', 200)

    cy.contains('h3', updatedTitle).should('not.exist')
  })
})
