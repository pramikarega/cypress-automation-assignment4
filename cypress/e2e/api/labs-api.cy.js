/// <reference types="cypress" />
import { API_URL as apiUrl } from '../../support/constants'

/**
 * Automation Testing API - Script Labs
 * Swagger : https://api-script-labs.hendri.me/api-docs/
 * Method  : GET, POST, PUT, DELETE
 */
describe('Script Labs API', () => {
  let users
  let token
  let labId

  const uniqueTitle = `Cypress API Lab ${Date.now()}`
  const labPayload = {
    title: uniqueTitle,
    description: 'Dibuat oleh Cypress API automation test',
  }
  const updatedPayload = {
    title: `${uniqueTitle} - Updated`,
    description: 'Deskripsi sudah di-update melalui PUT',
  }

  before(() => {
    cy.fixture('users').then((data) => {
      users = data
    })
  })

  context('System', () => {
    it('GET /health - server berjalan normal', () => {
      cy.request('GET', `${apiUrl}/health`).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.success).to.eq(true)
        expect(res.body.message).to.eq('Server is healthy')
        expect(res.body).to.have.property('timestamp')
      })
    })
  })

  context('Authentication', () => {
    it('POST /api/auth/login - login berhasil dengan akun valid', () => {
      cy.request('POST', `${apiUrl}/api/auth/login`, users.standard).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.success).to.eq(true)
        expect(res.body.message).to.eq('Login successful')
        expect(res.body.data.token).to.be.a('string').and.not.be.empty
        expect(res.body.data.user.email).to.eq(users.standard.email)
        expect(res.body.data.user.status).to.eq('active')
        token = res.body.data.token
      })
    })

    it('POST /api/auth/login - gagal dengan password salah (401)', () => {
      cy.apiRequest('POST', '/api/auth/login', null, users.invalid).then((res) => {
        expect(res.status).to.eq(401)
        expect(res.body.success).to.eq(false)
        expect(res.body.error.code).to.eq('AUTH_FAILED')
        expect(res.body.error.message).to.eq('Invalid email or password')
      })
    })

    it('POST /api/auth/login - akun terkunci ditolak (403)', () => {
      cy.apiRequest('POST', '/api/auth/login', null, users.locked).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body.error.code).to.eq('USER_LOCKED')
      })
    })

    it('GET /api/auth/me - mengambil data user yang sedang login', () => {
      cy.apiRequest('GET', '/api/auth/me', token).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.success).to.eq(true)
        expect(JSON.stringify(res.body.data)).to.contain(users.standard.email)
      })
    })
  })

  context('Labs CRUD', () => {
    before(() => {
      cy.apiLogin().then((t) => {
        token = t
      })
    })

    it('GET /api/labs - tanpa token ditolak (401)', () => {
      cy.apiRequest('GET', '/api/labs').then((res) => {
        expect(res.status).to.eq(401)
        expect(res.body.message).to.eq('No token provided')
      })
    })

    it('POST /api/labs - membuat lab baru', () => {
      cy.apiRequest('POST', '/api/labs', token, labPayload).then((res) => {
        expect(res.status).to.eq(201)
        expect(res.body.success).to.eq(true)
        expect(res.body.message).to.eq('Lab added successfully')
        expect(res.body.data).to.include(labPayload)
        expect(res.body.data.id).to.be.a('number')
        labId = res.body.data.id
      })
    })

    it('POST /api/labs - validasi title & description kosong (400)', () => {
      cy.apiRequest('POST', '/api/labs', token, { title: '', description: '' }).then((res) => {
        expect(res.status).to.eq(400)
        expect(res.body.success).to.eq(false)
        expect(res.body.error.message).to.contain('Title cannot be empty')
        expect(res.body.error.message).to.contain('Description cannot be empty')
      })
    })

    it('GET /api/labs - mengambil daftar lab dengan pagination', () => {
      cy.apiRequest('GET', '/api/labs?page=1&limit=5', token).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.success).to.eq(true)
        expect(res.body.data).to.be.an('array').and.have.length.at.most(5)
        expect(res.body.pagination).to.include({ page: 1, limit: 5 })
        expect(res.body.pagination.total).to.be.greaterThan(0)
      })
    })

    it('GET /api/labs?search= - mencari lab yang baru dibuat', () => {
      cy.apiRequest('GET', `/api/labs?search=${encodeURIComponent(uniqueTitle)}`, token).then((res) => {
        expect(res.status).to.eq(200)
        const ids = res.body.data.map((lab) => lab.id)
        expect(ids).to.include(labId)
      })
    })

    it('GET /api/labs/{id} - mengambil detail lab berdasarkan id', () => {
      cy.apiRequest('GET', `/api/labs/${labId}`, token).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.data.id).to.eq(labId)
        expect(res.body.data.title).to.eq(labPayload.title)
        expect(res.body.data.description).to.eq(labPayload.description)
      })
    })

    it('PUT /api/labs/{id} - mengubah title & description lab', () => {
      cy.apiRequest('PUT', `/api/labs/${labId}`, token, updatedPayload).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.success).to.eq(true)
        expect(res.body.message).to.eq('lab updated successfully')
        expect(res.body.data).to.include({ id: labId, ...updatedPayload })
      })

      // Verifikasi perubahan tersimpan
      cy.apiRequest('GET', `/api/labs/${labId}`, token).its('body.data').should('include', updatedPayload)
    })

    it('DELETE /api/labs/{id} - menghapus lab', () => {
      cy.apiRequest('DELETE', `/api/labs/${labId}`, token).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.success).to.eq(true)
        expect(res.body.message).to.eq('lab deleted successfully')
        expect(res.body.data.id).to.eq(labId)
      })
    })

    it('GET /api/labs/{id} - lab yang sudah dihapus tidak ditemukan (404)', () => {
      cy.apiRequest('GET', `/api/labs/${labId}`, token).then((res) => {
        expect(res.status).to.eq(404)
        expect(res.body.error.message).to.eq('lab not found')
      })
    })
  })
})
