# Đặc Tả Cấu Hình Chi Tiết: `harness.config.json`

> **Tài liệu tham chiếu toàn bộ các thuộc tính và kịch bản trong file cấu hình `harness.config.json`.**  
> Mỗi repository sử dụng `agent-qa-harness` chỉ cần duy nhất file này ở thư mục gốc để quản lý toàn bộ các tầng kiểm thử.

---

## 1. Cấu Trúc Tổng Thể

```json
{
  "$schema": "https://json.schemastore.org/harness.config.json",
  "project": "ten-du-an",
  "baseUrl": "http://localhost:3000",
  "timeoutMs": 30000,
  "outputDir": "harness-out",

  "static": { ... },
  "realtime": { ... },
  "concurrency": { ... },
  "browser": { ... }
}
```

### Các Thuộc Tính Gốc (Root Properties)

| Thuộc tính | Kiểu dữ liệu | Mặc định | Ý nghĩa & Mô tả |
| :--- | :--- | :--- | :--- |
| `project` | `string` | Tên thư mục | Tên định danh của dự án (hiển thị trên các báo cáo QA). |
| `baseUrl` | `string` | `"http://localhost:3000"` | Địa chỉ gốc của server đang chạy (Next.js, NestJS, Express, FastAPI...). |
| `timeoutMs` | `number` | `30000` | Thời gian timeout tối đa cho mỗi lệnh kiểm thử (mili-giây). |
| `outputDir` | `string` | `"harness-out"` | Thư mục lưu trữ kết quả kiểm thử, ảnh chụp màn hình và gói sự cố `INCIDENT_PACK.json`. |
| `preflight` | `object` | `{ enabled: true }` | Kiểm tra kết nối và chờ server sẵn sàng trước khi test. |
| `authProvider` | `object` | `{ enabled: false }` | Tự động đăng nhập lấy JWT Token tươi trước khi chạy test. |
| `static` | `object` | `{ enabled: true }` | Cấu hình kiểm tra tĩnh Tier 0 (UI rules, ESLint, Zod contracts, Typecheck). |
| `realtime` | `object` | `{ enabled: false }` | Cấu hình kiểm tra Realtime Socket Tier 1 (Socket.io hoặc Native WebSocket). |
| `concurrency` | `object` | `{ enabled: false }` | Cấu hình kiểm tra tranh chấp / Race Condition Tier 2 (Duyệt đơn, thanh toán). |
| `browser` | `object` | `{ enabled: false }` | Cấu hình kiểm tra giao diện và kịch bản người dùng Tier 3 (Chrome / Web). |

---

## 2. Động Hóa Biến Mẫu (Dynamic Template Variables)

Hệ thống hỗ trợ tự động thay thế biến động trong **URL, Path, Headers, Body, Input selectors** để đảm bảo kiểm thử nhiều lần không bị trùng lặp dữ liệu:

- `{{timestamp}}`: Timestamp hiện tại dạng mili-giây (ví dụ: `1729472345678`).
- `{{uuid}}`: Chuỗi UUID ngẫu nhiên v4.
- `{{shortId}}`: Chuỗi ngẫu nhiên 8 ký tự hex (ví dụ: `a3f9c012`).
- `{{randomInt}}`: Số nguyên ngẫu nhiên từ 1000 đến 9999.
- `{{date}}`: Ngày hiện tại dạng `YYYY-MM-DD`.
- `{{env:TÊN_BIẾN}}`: Đọc giá trị từ biến môi trường `process.env.TÊN_BIẾN`.

*Ví dụ sử dụng:*  
`"path": "/api/v1/orders/ORD-{{timestamp}}/approve"` $\rightarrow$ Không bao giờ bị lỗi "đơn đã duyệt" khi chạy lại nhiều lần!

---

## 3. Cấu Hình `preflight` & `authProvider`

```json
"preflight": {
  "enabled": true,
  "retries": 3,
  "delayMs": 1000,
  "healthEndpoint": "/health"
},
"authProvider": {
  "enabled": true,
  "endpoint": "/api/v1/auth/login",
  "method": "POST",
  "credentials": {
    "email": "admin@vietsage.vn",
    "password": "{{env:ADMIN_PASSWORD}}"
  },
  "tokenPath": "data.accessToken"
}
```

---

## 2. Chi Tiết `static` (Tier 0: Static & Contract Gate)

Dùng để chạy các lệnh kiểm tra tĩnh đặc thù của dự án (như kiểm tra quy chuẩn UI, quét lỗi chính tả, typecheck).

```json
"static": {
  "enabled": true,
  "commands": [
    {
      "name": "Kiểm tra UI Rules & Sàn Cỡ Chữ",
      "cmd": "node scripts/verify-ui-rules.cjs"
    },
    {
      "name": "Kiểm tra Tính Đồng Bộ Zod Contract",
      "cmd": "npm run test:contracts"
    },
    {
      "name": "TypeScript Typecheck",
      "cmd": "npx tsc --noEmit"
    }
  ]
}
```

- `commands[].name`: Tên dễ đọc của bài kiểm tra.
- `commands[].cmd`: Câu lệnh shell thực tế sẽ được chạy trong thư mục gốc của repo.

---

## 3. Chi Tiết `realtime` (Tier 1: Socket & Realtime Probe)

Dùng để kiểm tra kết nối realtime, handshake, phân lập phòng (`rooms`), và độ trễ nhận tin.

```json
"realtime": {
  "enabled": true,
  "provider": "socket.io", // "socket.io" hoặc "ws"
  "scenarios": [
    {
      "name": "khach-tao-yeu-cau-le-tan-nhan",
      "description": "Khi khách tạo yêu cầu dịch vụ, socket lễ tân phải nhận được REQUEST_CREATED trong 3s",
      "receiver": {
        "endpoint": "/hotel-ops",
        "auth": {
          "token": "Bearer eyJhbGciOi...",
          "role": "RECEPTIONIST",
          "hotelId": "hotel-test-01"
        },
        "query": { "transport": "polling" },
        "listenEvent": "REQUEST_CREATED",
        "assertPayload": {
          "status": "PENDING"
        }
      },
      "trigger": {
        "type": "http",
        "method": "POST",
        "path": "/api/v1/guest/requests",
        "headers": {
          "Authorization": "Bearer guest-jwt-token"
        },
        "body": {
          "serviceId": "laundry",
          "roomId": "room-102"
        }
      },
      "timeoutMs": 3000
    }
  ]
}
```

### Các trường trong `receiver`:
- `endpoint`: Đường dẫn namespace hoặc gateway Socket (ví dụ: `/hotel-ops`, `/chat`).
- `auth`: Dữ liệu xác thực được gửi kèm trong WebSocket handshake (`auth` payload của Socket.io).
- `listenEvent`: Tên sự kiện cần lắng nghe (`REQUEST_CREATED`, `ORDER_PAID`, `NEW_MESSAGE`).
- `assertPayload`: *(Tùy chọn)* Cặp key-value bắt buộc phải có trong dữ liệu nhận về.

### Các trường trong `trigger`:
- `type`: Hiện tại hỗ trợ `"http"` (bắn API kích hoạt sự kiện).
- `method`: Phương thức HTTP (`POST`, `PUT`, `PATCH`).
- `path`: Đường dẫn API kích hoạt sự kiện.
- `body`: Dữ liệu gửi lên API.

---

## 4. Chi Tiết `concurrency` (Tier 2: Concurrency & State Invariants)

Dùng để bắn các đợt request song song nhằm kiểm tra cơ chế khóa (Mutex, Database Transaction Lock, Idempotency).

```json
"concurrency": {
  "enabled": true,
  "scenarios": [
    {
      "name": "chong-duyet-trung-don-hang",
      "description": "Bắn 5 request duyệt đồng thời cho 1 đơn hàng - chỉ đúng 1 thành công",
      "path": "/api/v1/orders/ORD-999/approve",
      "method": "POST",
      "headers": {
        "Authorization": "Bearer admin-token"
      },
      "body": { "approvedBy": "manager-1" },
      "concurrentBurst": 5,
      "injectRequestId": true,
      "assert": {
        "expected200": 1,
        "expectedConflictOrBad": 4
      }
    }
  ]
}
```

### Các trường quan trọng:
- `concurrentBurst`: Số lượng request được bắn đồng thời trong cùng một micro-giây (khuyên dùng: 5 đến 10).
- `injectRequestId`: Nếu `true`, hệ thống sẽ tự sinh header `X-Client-Request-Id` ngẫu nhiên cho từng request trong đợt burst.
- `assert.expected200`: Số lượng request thành công mong đợi (thường là `1` để đảm bảo tính duy nhất).
- `assert.expectedConflictOrBad`: Số lượng request bị từ chối mong đợi (trả về `409 Conflict` hoặc `400 Bad Request`).

---

## 5. Chi Tiết `browser` (Tier 3: Browser & UI Action Flows)

Dùng để kiểm tra tính ổn định của giao diện, bắt sạch lỗi console, network ngầm và chạy chuỗi hành động của người dùng.

```json
"browser": {
  "enabled": true,
  "zeroConsoleErrors": true,
  "zeroNetworkErrors": true,
  "routes": [
    { "path": "/dashboard", "waitForSelector": "[data-testid='metrics-board']" },
    { "path": "/rooms", "waitForSelector": "table" }
  ],
  "flows": [
    {
      "name": "dang-nhap-va-mo-danh-sach-phong",
      "description": "Đăng nhập và kiểm tra mở màn hình quản lý phòng trơn tru",
      "steps": [
        { "action": "navigate", "url": "/login" },
        { "action": "fill", "selector": "input[name='email']", "value": "admin@vietsage.vn" },
        { "action": "fill", "selector": "input[name='password']", "value": "secret123" },
        { "action": "click", "selector": "button[type='submit']" },
        { "action": "waitFor", "durationMs": 500 },
        { "action": "assertText", "selector": "h1", "expected": "Bảng Điều Khiển" },
        { "action": "assertNoErrors" },
        { "action": "screenshot", "name": "dashboard-thanh-cong.png" }
      ]
    }
  ]
}
```

### Các hành động hỗ trợ trong `steps[]`:
| Action | Thuộc tính đi kèm | Mô tả |
| :--- | :--- | :--- |
| `navigate` | `url` | Điều hướng đến đường dẫn (tương đối hoặc tuyệt đối). |
| `fill` | `selector`, `value` | Điền giá trị vào trường input / textarea. |
| `click` | `selector` | Nhấp chuột vào nút bấm, liên kết hoặc phần tử. |
| `waitFor` | `durationMs` hoặc `selector` | Chờ đợi trong số mili-giây hoặc chờ phần tử xuất hiện trong DOM. |
| `assertText` | `selector`, `expected` | Khẳng định nội dung văn bản của phần tử phải chứa giá trị mong đợi. |
| `assertNoErrors` | *(Không cần)* | Kiểm tra nghiêm ngặt: Console phải có 0 lỗi đỏ và Network không có mã 4xx/5xx. |
| `screenshot` | `name` | Chụp ảnh màn hình lưu vào `harness-out/screenshots/<name>`. |
