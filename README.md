# Agent QA Harness (`agent-qa-harness`)

> **Bộ khung kiểm thử tự động đa tầng (4-Tier Autonomous QA Harness) dành cho AI Agents & Archon Workflows.**  
> Giải quyết triệt để các lỗi tiềm ẩn nguy hiểm trong các dự án full-stack: **"Socket không ăn / mất realtime"**, **"Duyệt sai / Race Condition / Double Approval"**, **"Lỗi ngầm Console / Network 4xx/5xx"**, và **"Lệch chuẩn API Contract & UI Rules"**.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/dangminhdev0403/agent-qa-harness/blob/master/LICENSE)
[![Engine](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![Archon](https://img.shields.io/badge/archon-workflow%20ready-purple.svg)](https://github.com/dangminhdev0403/agent-qa-harness)

---

## 📑 Mục Lục
1. [Tại sao cần Agent QA Harness?](#-tại-sao-cần-agent-qa-harness)
2. [2 Chế Độ Kiểm Thử Riêng Biệt & Cơ Chế Khử Mơ Hồ](#-2-chế-độ-kiểm-thử-riêng-biệt)
3. [4 Tấm Khiên Bảo Vệ Đột Phá (Bulletproof Protections)](#-4-tấm-khiên-bảo-vệ-đột-phá-bulletproof)
4. [Nguyên Tắc Bất Biến: Living Harness Contract](#-nguyên-tắc-bất-biến-living-harness-contract)
5. [Kiến Trúc Kiểm Thử 4 Tầng](#-kiến-trúc-kiểm-thử-đa-tầng-4-tier-test-architecture)
6. [Bắt Đầu Nhanh (Quickstart 60 Giây)](#-bắt-đầu-nhanh-áp-dụng-cho-mọi-repo-trong-60-giây)
7. [Tích Hợp Archon Workflow DAG](#-tích-hợp-archon-workflow-dag)
8. [Bảng Tra Cứu Lệnh CLI Toàn Cục](#-bảng-tra-cứu-lệnh-cli-toàn-cục)
9. [Tài Liệu Chi Tiết](#-tài-liệu-chi-tiết)

---

## 🎯 Tại sao bạn cần Agent QA Harness?

Khi các lập trình viên hoặc AI Agents (Antigravity, Codex, Orca) phát triển tính năng, các bài unit test thông thường thường bỏ sót các lỗi tích hợp thực tế:
1. **Socket không ăn**: Client không nhận được event realtime do sai tên phòng (`room`), sai namespace, token JWT handshake hết hạn hoặc Redis Pub/Sub bị nghẽn.
2. **Duyệt sai / Tranh chấp (Race Condition)**: Khi 2 người quản trị hoặc 2 thao tác click đồng thời duyệt 1 đơn hàng, hệ thống xử lý trùng lặp (double-approval) làm sai lệch cơ sở dữ liệu.
3. **Lỗi ngầm trình duyệt**: Giao diện nhìn có vẻ bình thường nhưng Console đỏ rực lỗi `TypeError`, lỗi React Hydration mismatch, hoặc các request ngầm trả về `401`, `404`, `500`.
4. **Phá vỡ trải nghiệm Tab**: Link / nút bấm tự ý redirect toàn trang, làm mất bộ lọc và trạng thái đang làm việc.

**Agent QA Harness** tách biệt hoàn toàn giữa **Engine kiểm thử dùng chung** và **Cấu hình riêng của từng dự án**. Chỉ cần đặt một file `harness.config.json` ở thư mục gốc của bất kỳ repository nào, toàn bộ quy trình kiểm thử 4 tầng sẽ tự động kích hoạt.

---

## 🚦 2 Chế Độ Kiểm Thử Riêng Biệt

Harness phân định rạch ròi thành 2 chế độ độc lập để phục vụ đúng ngữ cảnh phát triển:

| Chế độ | Lệnh CLI | Nội dung & Phạm vi kiểm tra |
| :--- | :--- | :--- |
| **Chế độ 1: Test Code & Ổn Định Hệ Thống** | `agent-harness test:code` | • Kiểm tra TypeScript (`tsc`), Build/Bundle, UI Design Rules (font floor, balance).<br>• Kiểm tra Zod schema & API contract.<br>• Kiểm tra kết nối Realtime Socket (Handshake, Rooms).<br>• Kiểm tra Concurrency & State Invariants (Chống duyệt trùng / Race condition). |
| **Chế độ 2: Test Flow Luồng & Giao Diện với Chrome** | `agent-harness test:flow` | • Mở trình duyệt tương tác trực tiếp bằng **Chrome DevTools MCP**.<br>• Thực thi các chuỗi hành động mô phỏng người dùng (`navigate`, `fill`, `click`, `waitFor`, `assertText`).<br>• Giám sát ngầm nghiêm ngặt: **0 lỗi Console** đỏ và **0 lỗi Network 4xx/5xx**.<br>• Chụp ảnh màn hình lưu bằng chứng tại `harness-out/screenshots/`. |
| **Chạy Toàn Diện Cả Hai (Dual-Pass)** | `agent-harness run` | Chạy tuần tự và toàn diện cả Chế độ 1 và Chế độ 2. |

> **🔔 Cơ Chế Khử Mơ Hồ (Prompt Disambiguation):**  
> Khi bạn nhập prompt ngắn gọn hoặc chưa rõ ràng (ví dụ: *"test dự án giúp tôi"*, *"soát lỗi giùm"*, *"kiểm tra chức năng"*), Agent sẽ **tự động hiển thị bảng lựa chọn (Interactive Options qua `ask_question`)** để bạn bấm chọn ngay Mode 1, Mode 2 hoặc cả hai mà không cần giải thích dài dòng.

---

## 🛡️ 4 Tấm Khiên Bảo Vệ Đột Phá (Bulletproof)

1. **Khởi Động Máy Chủ An Toàn (`--auto-start`)**:
   - Nếu máy chủ chưa chạy, Harness tự động bật server ngầm.
   - **QUY TẮC BẤT DI BẤT DỊCH: CHỈ CHẠY `START` (`npm run start` / `pnpm start`), TUYỆT ĐỐI CẤM CHẠY `DEV`**.
   - Tránh việc Hot-Module Replacement (HMR) và file watcher gây xung đột dữ liệu khi bạn đang vừa test vừa sửa code.
   - Test xong tự động kill tiến trình giải phóng cổng (hoặc giữ lại với `--no-kill`).

2. **Động Hóa Biến Mẫu (`{{timestamp}}`, `{{uuid}}`)**:
   - Tự động thay thế biến động trong URL, Headers và Body (ví dụ: `/orders/ORD-{{timestamp}}/approve`).
   - Xóa bỏ triệt để bẫy rác database, cho phép chạy test 1.000 lần liên tục mà không lo trùng lặp ID hay đụng đơn đã duyệt.

3. **Cấp Token JWT Tươi Mới Tự Động (`authProvider`)**:
   - Khai báo endpoint đăng nhập một lần, Harness tự động login trước phiên test và trích xuất JWT mới.
   - Bơm thẳng vào WebSocket handshake và HTTP headers, không bao giờ lo token cũ hết hạn gây lỗi 401 giả.

4. **Cô Lập Nhánh & Ngắt Vòng Lặp Vô Tận (`isolation-manager.mjs`)**:
   - **Anti-Infinite-Loop Circuit Breaker**: Giới hạn tối đa 3 lần sửa code tự động. Nếu quá 3 lần lỗi vẫn lặp lại $\rightarrow$ Tự động ngắt mạch (Exit Code 2), ngăn chặn 2 agents cuốn vào vòng lặp sửa-test-sửa vô tận.
   - **Branch Isolator (`--isolate-branch`)**: Tự động chuyển sang nhánh cô lập `git checkout -b harness-fix/...` khi sửa lỗi, giữ nguyên vẹn nhánh chính và không đè code của task khác.
   - **Concurrency Lock (`.harness.lock`)**: Khóa file chống va chạm khi nhiều Agent cùng truy cập một codebase.

---

## 💡 Nguyên Tắc Bất Biến: Living Harness Contract

Để dự án luôn luôn trơn tru và **không bao giờ bị quên test khi dự án phình to**:
> **Bất kỳ khi nào bạn hoặc AI Agent phát triển xong một tính năng mới (dù là UI, Socket hay API duyệt đơn), BẮT BUỘC phải ghi nhận ngay kịch bản kiểm thử vào `harness.config.json`!**

### 1. Tự Động Quét & Khởi Tạo Dự Án Mới (Zero-Effort Auto-Discover)
```bash
agent-harness discover
```
Lệnh này sẽ **tự động quét toàn bộ mã nguồn** (Next.js routes, NestJS `@WebSocketGateway`, `@SubscribeMessage`, và các endpoint Mutation nhạy cảm như `/approve`, `/checkout`, `/pay`) để tự động sinh ra kịch bản ban đầu đầy đủ!

### 2. Thêm Nhanh & Tự Động Nâng Cấp (Smart Upgrade & Deduplication)
```bash
# Thêm/Nâng cấp kịch bản kiểm tra giao diện / luồng thao tác người dùng (UI Flow)
agent-harness add:flow "quan-ly-dat-phong"

# Thêm/Nâng cấp kịch bản kiểm tra realtime socket cho tính năng mới
agent-harness add:socket "thong-bao-nhan-phong"

# Thêm/Nâng cấp kịch bản kiểm tra chống duyệt trùng / tranh chấp (Race condition)
agent-harness add:concurrency "duyet-hoan-tien"
```

> **🛡️ Cơ chế Lọc Trùng Thông Minh:**  
> Nếu tính năng đã tồn tại, Harness sẽ **tự động nâng cấp (upgrade)** các bước, selector và payload mới nhất thay vì tạo kịch bản trùng lặp. Tuyệt đối không sinh rác cấu hình.

---

## 🏗️ Kiến trúc Kiểm thử Đa Tầng (4-Tier Test Architecture)

```mermaid
flowchart TD
    Trigger["Archon Workflow / Lệnh CLI<br/>(agent-harness run)"] --> ConfigLoader["Nạp cấu hình harness.config.json"]

    subgraph Tiers ["4 Tầng Kiểm Soát Chất Lượng Tự Động"]
        ConfigLoader --> T0["Tier 0: Static & Contract Gate<br/>• Quét quy chuẩn UI (Sàn font >= 12px, text-balance)<br/>• Đồng bộ Zod Schema & API Contract"]
        
        T0 --> T1["Tier 1: Realtime Socket Probe<br/>• Giả lập Client headless (Socket.io / WS)<br/>• Kiểm tra Handshake, Auth Token & Room Isolation<br/>• Đo độ trễ & xác thực payload event"]
        
        T0 --> T2["Tier 2: Concurrency & State Invariant Gate<br/>• Bắn request song song với tần suất cao (Burst)<br/>• Chống duyệt trùng (Đúng 1 thành công 200, N-1 bị chặn 409)<br/>• Bảo vệ tính toàn vẹn State Machine"]

        T0 --> T3["Tier 3: Browser & Route Health<br/>• Quét sạch lỗi Console (Zero-Tolerance)<br/>• Bắt toàn bộ lỗi ngầm Network 4xx/5xx<br/>• Thực thi kịch bản tương tác người dùng (UI Flows)"]
    end

    T1 --> Convergence["Bộ Tổng Hợp & Đánh Giá"]
    T2 --> Convergence
    T3 --> Convergence

    Convergence --> Check{Tất cả đều PASS?}
    Check -- CÓ --> Pass[" Cấp chứng nhận PASSED.json & Xuất Báo Cáo"]
    Check -- KHÔNG --> IncidentPack[" Tạo INCIDENT_PACK.json<br/>Tự động bàn giao cho AI Agent sửa lỗi ngay"]
```

---

## ⚡ Bắt đầu Nhanh (Áp dụng cho mọi Repo trong 60 giây)

### 1. Khởi tạo cấu hình cho dự án
Đứng tại thư mục gốc của repository cần kiểm thử:
```bash
# Tự động quét và phát hiện các route, socket, mutation
agent-harness discover
```

### 2. Xem và tinh chỉnh file `harness.config.json`
```json
{
  "project": "ten-du-an-cua-ban",
  "baseUrl": "http://localhost:3000",
  "timeoutMs": 30000,

  "server": {
    "autoStart": false,
    "startCommand": "npm run start"
  },

  "authProvider": {
    "enabled": false,
    "endpoint": "/api/v1/auth/login",
    "credentials": { "email": "admin@vietsage.vn", "password": "{{env:ADMIN_PASS}}" },
    "tokenPath": "data.accessToken"
  },

  "static": {
    "enabled": true,
    "commands": [
      { "name": "Kiểm tra UI Rules", "cmd": "node scripts/verify-ui-rules.cjs" }
    ]
  },

  "realtime": {
    "enabled": true,
    "provider": "socket.io",
    "scenarios": [
      {
        "name": "kich-ban-khach-yeu-cau-le-tan-nhan",
        "receiver": {
          "endpoint": "/hotel-ops",
          "listenEvent": "REQUEST_CREATED"
        },
        "trigger": {
          "type": "http",
          "method": "POST",
          "path": "/api/v1/guest/requests",
          "body": { "serviceId": "cleaning", "roomId": "101" }
        },
        "timeoutMs": 3000
      }
    ]
  },

  "concurrency": {
    "enabled": true,
    "scenarios": [
      {
        "name": "chong-duyet-trung-don-hang",
        "path": "/api/v1/orders/ORD-{{timestamp}}/approve",
        "method": "POST",
        "concurrentBurst": 5,
        "assert": { "expected200": 1, "expectedConflictOrBad": 4 }
      }
    ]
  },

  "browser": {
    "enabled": true,
    "zeroConsoleErrors": true,
    "zeroNetworkErrors": true,
    "routes": [
      { "path": "/dashboard", "waitForSelector": "[data-testid='metrics-board']" }
    ],
    "flows": [
      {
        "name": "luong-dang-nhap-va-xem-bao-cao",
        "steps": [
          { "action": "navigate", "url": "/login" },
          { "action": "waitFor", "durationMs": 300 },
          { "action": "assertNoErrors" }
        ]
      }
    ]
  }
}
```

### 3. Thực thi kiểm thử
```bash
# Chạy Chế độ 1: Test Code & Độ Ổn Định
agent-harness test:code

# Chạy Chế độ 2: Test User Flow với Chrome DevTools MCP
agent-harness test:flow

# Chạy toàn diện cả hai kèm tự khởi động server start (nếu chưa bật)
agent-harness run --auto-start --isolate-branch
```

---

## 🤖 Tích hợp Archon Workflow DAG

Copy file template `templates/archon/universal-qa-harness.yaml` vào thư mục `.archon/workflows/` của dự án, sau đó kích hoạt:
```bash
archon run .archon/workflows/universal-qa-harness.yaml
```

---

## 📋 Bảng Tra Cứu Lệnh CLI Toàn Cục

| Lệnh | Ý nghĩa & Mô tả |
| :--- | :--- |
| `agent-harness test:code` | **[Chế độ 1]** Test Code, Types, Build, Static Rules, Realtime Socket & Concurrency |
| `agent-harness test:flow` | **[Chế độ 2]** Test Flow luồng người dùng & Giao diện thực tế bằng Chrome DevTools MCP |
| `agent-harness run` | Chạy toàn diện cả 2 chế độ (Dual-pass) |
| `agent-harness run --auto-start` | Tự động khởi động máy chủ bằng lệnh `START` nếu chưa chạy (TUYỆT ĐỐI CẤM CHẠY `DEV`) |
| `agent-harness run --isolate-branch` | Tự động tách nhánh Git cô lập (`harness-fix/...`) khi phát hiện lỗi để tránh xung đột giữa 2 agents |
| `agent-harness run --max-retries <n>` | Giới hạn số lần thử sửa code tự động (Mặc định: 3, ngắt mạch chống vòng lặp vô tận) |
| `agent-harness discover` | Tự động quét dự án, phát hiện routes, socket gateways, mutations và tạo config |
| `agent-harness init` | Khởi tạo file cấu hình trắng `harness.config.json` |
| `agent-harness add:flow <tên>` | Thêm hoặc nâng cấp kịch bản tương tác người dùng (UI Flow) |
| `agent-harness add:socket <tên>` | Thêm hoặc nâng cấp kịch bản kiểm tra Realtime Socket |
| `agent-harness add:concurrency <tên>` | Thêm hoặc nâng cấp kịch bản kiểm tra tranh chấp (chống duyệt trùng) |
| `agent-harness probe:socket` | Chạy riêng rẽ Tier 1 (Realtime Socket Probe) |
| `agent-harness probe:concurrency` | Chạy riêng rẽ Tier 2 (Concurrency Gate) |
| `agent-harness probe:browser` | Chạy riêng rẽ Tier 3 (Chrome & Route Scanner) |
| `agent-harness --tier <0\|1\|2\|3>` | Chạy một Tier cụ thể được chỉ định |

---

## 📚 Tài Liệu Chi Tiết

- 📐 [**Kiến Trúc Toàn Diện Hệ Thống (ARCHITECTURE.md)**](docs/ARCHITECTURE.md): Phân tích chi tiết thuật toán 4 tầng kiểm thử, cơ chế đo độ trễ socket, burst concurrency và circuit breaker.
- ⚙️ [**Đặc Tả File Cấu Hình (CONFIG_SPEC.md)**](docs/CONFIG_SPEC.md): Bảng tra cứu toàn bộ tham số trong `harness.config.json` (server, preflight, authProvider, flows...).
- 🤖 [**Sổ Tay Hành Động Độc Lập Cho AI Agents (AGENT_PLAYBOOK.md)**](docs/AGENT_PLAYBOOK.md): Cẩm nang tự sửa lỗi, tự tách nhánh cô lập và tương tác Chrome DevTools MCP dành cho Agent.
- 📜 [**Quy Tắc Bắt Buộc Toàn Cục (AGENT_HARNESS_GLOBAL_RULE.md)**](rules/AGENT_HARNESS_GLOBAL_RULE.md): Khối quy tắc copy-paste dành cho `.agents/AGENTS.md`.

---

## 📄 Giấy phép
Bản quyền © 2026 [dangminhdev0403](https://github.com/dangminhdev0403). Phát hành dưới giấy phép MIT.
