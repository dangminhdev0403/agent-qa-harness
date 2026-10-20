# Quy Tắc Toàn Cục: Tự Động Hóa Kiểm Thử & Chống Quên Kịch Bản (Agent Harness Protocol)

> **Hướng dẫn cài đặt:** Dán khối quy tắc bên dưới vào file cấu hình luật của Agent (như `.agents/AGENTS.md`, `docs/RULES.md` hoặc Global Agent Rules của Antigravity & Codex).  
> Quy tắc này là **bắt buộc thi hành (MANDATORY)** cho mọi Agent trên mọi dự án full-stack.

---

```markdown
<!-- BẮT ĐẦU QUY TẮC AGENT HARNESS PROTOCOL -->
## Mandatory Living Harness & Autonomous QA Gate

Mọi Agent (Antigravity, Codex, Orca) làm việc trong repository này BẮT BUỘC tuân thủ chu trình 3 bước sau:

1. **Khởi Tạo Kịch Bản Tự Động (Step-Zero Auto-Discovery)**:
   - Nếu thư mục gốc dự án chưa có file `harness.config.json`, Agent BẮT BUỘC chạy ngay:
     ```bash
     agent-harness discover
     ```
     Lệnh này tự động phân tích và lập chỉ mục toàn bộ routes giao diện, websocket gateways và các mutation endpoints quan trọng.

2. **Quy Chuẩn Đồng Bộ Tính Năng Mới (Living Harness Spec)**:
   - NGHIÊM CẤM hoàn thành task mà không ghi nhận kịch bản kiểm thử vào harness.
   - Khi tạo mới hoặc chỉnh sửa tính năng:
     * Chức năng Giao diện / Màn hình: `agent-harness add:flow "<tên-tính-năng>"`
     * Chức năng Realtime / Socket: `agent-harness add:socket "<tên-tính-năng>"`
     * Chức năng Duyệt đơn / Thanh toán / Trạng thái: `agent-harness add:concurrency "<tên-tính-năng>"`
   - Hệ thống tự động so khớp và nâng cấp (upgrade) kịch bản cũ, không sinh rác trùng lặp.

3. **Cổng Nghiệm Thu Tự Phục Hồi (Zero-Excuse Self-Healing Gate)**:
   - Trước khi báo cáo hoàn thành nhiệm vụ cho User, Agent BẮT BUỘC chạy:
     ```bash
     agent-harness run
     ```
   - Nếu kết quả trả về mã lỗi 1 (FAIL):
     * Mở file `harness-out/INCIDENT_PACK.json` để đọc chính xác nguyên nhân, payload và stacktrace.
     * Tự động sửa mã nguồn tại file gây lỗi.
     * Chạy lại probe mục tiêu (`agent-harness probe:<tier>`) cho đến khi đạt 100% PASSED.
   - Tuyệt đối KHÔNG bàn giao công việc khi còn bất kỳ lỗi Console, Socket Timeout hay Race Condition nào chưa được giải quyết.
<!-- KẾT THÚC QUY TẮC AGENT HARNESS PROTOCOL -->
```
