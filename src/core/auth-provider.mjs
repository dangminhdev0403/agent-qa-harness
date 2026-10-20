import { interpolateTemplates } from './template-engine.mjs';

/**
 * Universal Dynamic Authentication Provider.
 * Automatically logs in before test execution to obtain a fresh, non-expiring JWT token.
 */
let cachedToken = null;

export async function resolveAuthToken(config) {
  const authConfig = config.authProvider;
  if (!authConfig || !authConfig.enabled) {
    return null;
  }

  if (cachedToken) {
    return cachedToken;
  }

  const baseUrl = config.baseUrl;
  const endpoint = authConfig.endpoint || '/api/v1/auth/login';
  const loginUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const method = (authConfig.method || 'POST').toUpperCase();
  const credentials = interpolateTemplates(authConfig.credentials || {});

  console.log(`\n[Auth Provider] Đang tự động đăng nhập để lấy JWT Token mới tại: ${loginUrl}...`);

  try {
    const res = await fetch(loginUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authConfig.headers || {})
      },
      body: JSON.stringify(credentials)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Đăng nhập thất bại (HTTP ${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const tokenPath = authConfig.tokenPath || 'accessToken';
    const token = extractNestedValue(data, tokenPath);

    if (!token) {
      throw new Error(
        `Không trích xuất được token từ phản hồi đăng nhập theo đường dẫn '${tokenPath}'. Phản hồi: ${JSON.stringify(data).slice(0, 200)}`
      );
    }

    cachedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    console.log(`   Đã nhận JWT Token mới thành công (Độ dài: ${token.length} chars).\n`);
    return cachedToken;
  } catch (err) {
    console.error(`   [CẢNH BÁO] Không thể tự động lấy Auth Token: ${err.message}`);
    return null;
  }
}

export function clearAuthCache() {
  cachedToken = null;
}

function extractNestedValue(obj, pathStr) {
  const parts = pathStr.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}
