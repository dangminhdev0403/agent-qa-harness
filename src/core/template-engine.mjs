import crypto from 'node:crypto';

/**
 * Universal Template Engine for Harness Payloads, URLs, and Headers.
 * Replaces dynamic variables at runtime to ensure tests are 100% idempotent and non-polluting.
 *
 * Supported variables:
 * - {{timestamp}}  -> e.g. 1729472345678
 * - {{uuid}}       -> e.g. a3c9f8e2-1234-5678-9abc-def012345678
 * - {{shortId}}    -> e.g. 8 characters hex
 * - {{randomInt}}  -> random integer between 1000 and 9999
 * - {{date}}       -> YYYY-MM-DD
 * - {{env:VAR}}    -> Reads from process.env[VAR]
 */
export function interpolateTemplates(data, customContext = {}) {
  const context = {
    timestamp: Date.now().toString(),
    uuid: crypto.randomUUID(),
    shortId: crypto.randomBytes(4).toString('hex'),
    randomInt: Math.floor(1000 + Math.random() * 9000).toString(),
    date: new Date().toISOString().split('T')[0],
    ...customContext
  };

  return deepReplace(data, context);
}

function deepReplace(target, context) {
  if (typeof target === 'string') {
    return target.replace(/\{\{([a-zA-Z0-9_:]+)\}\}/g, (match, key) => {
      if (key.startsWith('env:')) {
        const envKey = key.slice(4);
        return process.env[envKey] || '';
      }
      return context[key] !== undefined ? context[key] : match;
    });
  }

  if (Array.isArray(target)) {
    return target.map(item => deepReplace(item, context));
  }

  if (target !== null && typeof target === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(target)) {
      result[deepReplace(k, context)] = deepReplace(v, context);
    }
    return result;
  }

  return target;
}
