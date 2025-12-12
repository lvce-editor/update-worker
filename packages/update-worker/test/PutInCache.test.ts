/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { expect, jest, test } from '@jest/globals'
import type { ICache } from '../src/parts/GetCache/GetCache.ts'
import { isLowDiskSpaceError, putInCache } from '../src/parts/PutInCache/PutInCache.ts'

test('isLowDiskSpaceError returns true for DOMException NetworkError', () => {
  const networkError = new DOMException('NetworkError: Cache.add() encountered a network error', 'NetworkError')
  expect(isLowDiskSpaceError(networkError)).toBe(true)
})

test('isLowDiskSpaceError returns true for DOMException NetworkError with different message', () => {
  const networkError = new DOMException('Some network error', 'NetworkError')
  expect(isLowDiskSpaceError(networkError)).toBe(true)
})

test('isLowDiskSpaceError returns false for DOMException with different name', () => {
  const quotaExceededError = new DOMException('Quota exceeded', 'QuotaExceededError')
  expect(isLowDiskSpaceError(quotaExceededError)).toBe(false)
})

test('isLowDiskSpaceError returns false for generic Error', () => {
  const genericError = new Error('Generic error')
  expect(isLowDiskSpaceError(genericError)).toBe(false)
})

test('isLowDiskSpaceError returns false for non-error values', () => {
  expect(isLowDiskSpaceError(null)).toBe(false)
  expect(isLowDiskSpaceError(undefined)).toBe(false)
  expect(isLowDiskSpaceError('string')).toBe(false)
  expect(isLowDiskSpaceError(123)).toBe(false)
})

test('putInCache successfully caches response', async () => {
  const url = 'https://example.com/update'
  const response = new Response('test data')
  let putCalled = false

  const cache: ICache = {
    async match() {
      return undefined
    },
    async put(requestUrl: RequestInfo | URL) {
      putCalled = true
      expect(requestUrl).toBe(url)
    },
  }

  await putInCache(url, response, cache)
  expect(putCalled).toBe(true)
})

test('putInCache gracefully handles DOMException NetworkError', async () => {
  const url = 'https://example.com/update'
  const response = new Response('test data')

  const networkError = new DOMException('NetworkError: Cache.add() encountered a network error', 'NetworkError')

  const cache: ICache = {
    async match() {
      return undefined
    },
    async put() {
      throw networkError
    },
  }

  await expect(putInCache(url, response, cache)).resolves.toBeUndefined()
})

test('putInCache gracefully handles other errors', async () => {
  const url = 'https://example.com/update'
  const response = new Response('test data')
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

  const genericError = new Error('Generic cache error')

  const cache: ICache = {
    async match() {
      return undefined
    },
    async put() {
      throw genericError
    },
  }

  await expect(putInCache(url, response, cache)).resolves.toBeUndefined()
  expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to put response in cache:', genericError)

  consoleWarnSpy.mockRestore()
})

test('putInCache gracefully handles DOMException NetworkError with different message', async () => {
  const url = 'https://example.com/update'
  const response = new Response('test data')

  const networkError = new DOMException('Some network error', 'NetworkError')

  const cache: ICache = {
    async match() {
      return undefined
    },
    async put() {
      throw networkError
    },
  }

  await expect(putInCache(url, response, cache)).resolves.toBeUndefined()
})

test('putInCache gracefully handles DOMException with different name', async () => {
  const url = 'https://example.com/update'
  const response = new Response('test data')
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

  const quotaExceededError = new DOMException('Quota exceeded', 'QuotaExceededError')

  const cache: ICache = {
    async match() {
      return undefined
    },
    async put() {
      throw quotaExceededError
    },
  }

  await expect(putInCache(url, response, cache)).resolves.toBeUndefined()
  expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to put response in cache:', quotaExceededError)

  consoleWarnSpy.mockRestore()
})
