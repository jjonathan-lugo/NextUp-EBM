// Deliberately NOT under pages/api/__tests__ — Next.js's Pages Router
// treats every file inside pages/ (including pages/api/) as a route, so
// a test file living there would build into a real (broken) API
// endpoint. Learned this the hard way: `npm run build` picked up an
// earlier version of this file as `/api/__tests__/weighting.test`.
import handler from '../../pages/api/weighting'

// Minimal mock req/res — the handler is a plain Next.js API function, no
// React or a running server needed to exercise it directly.
function mockReqRes(method, body) {
  const req = { method, body }
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
    end(payload) {
      this.body = payload
      return this
    },
    setHeader(key, value) {
      this.headers[key] = value
    },
  }
  return { req, res }
}

describe('POST /api/weighting', () => {
  it('returns the computed weight for valid input', () => {
    const { req, res } = mockReqRes('POST', { effort: 2, priority: 3 })
    handler(req, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ weight: 5.5 }) // 3*1.5 + 2*0.5
  })

  it('rejects a score below 1', () => {
    const { req, res } = mockReqRes('POST', { effort: 0, priority: 3 })
    handler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('rejects a score above 5', () => {
    const { req, res } = mockReqRes('POST', { effort: 6, priority: 3 })
    handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('rejects a non-numeric score', () => {
    const { req, res } = mockReqRes('POST', { effort: 'high', priority: 3 })
    handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('rejects a missing body', () => {
    const { req, res } = mockReqRes('POST', undefined)
    handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('rejects non-POST methods', () => {
    const { req, res } = mockReqRes('GET', {})
    handler(req, res)
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toEqual(['POST'])
  })
})
