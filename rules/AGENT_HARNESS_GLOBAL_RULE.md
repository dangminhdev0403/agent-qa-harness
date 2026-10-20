# Quy Tắc Toàn Cục: Tự Động Hóa Kiểm Thử & Chống Quên Kịch Bản (Agent Harness Protocol)

> **Dán quy tắc này vào `.agents/AGENTS.md` hoặc cấu hình Agent Toàn Cục (Global Rules).**  
> Áp dụng bắt buộc cho mọi AI Agent (Antigravity, Codex, Orca) làm việc trên bất kỳ repository nào.

---

## 1. Nguyên Tắc "Living Harness Contract" (Không bao giờ để sót kịch bản)

Mỗi khi Agent nhận task:
1. **Khởi tạo tự động nếu dự án chưa có**:
   - Nếu thư mục gốc chưa có `harness.config.json`, Agent **tự động** chạy lệnh:
     ```bash
     agent-harness discover
     ```
     Lệnh này sẽ tự động phân tích routes frontend, socket gateways backend và các API duyệt đơn quan trọng.

2. **Khi phát triển tính năng mới hoặc nâng cấp tính năng cũ**:
   - **Thêm màn hình / Route mới**: Bắt buộc thêm hoặc nâng cấp UI Flow (`agent-harness add:flow "<tên-tính-năng>"`).
   - **Thêm Socket / Realtime Event**: Bắt buộc thêm kịch bản Socket (`agent-harness add:socket "<tên-tính-năng>"`).
   - **Thêm API duyệt đơn / Thanh toán / Trạng thái**: Bắt buộc thêm kịch bản Concurrency (`agent-harness add:concurrency "<tên-tính-năng>"`).
   - *Cơ chế lọc trùng thông minh*: Hệ thống sẽ tự động so khớp `(endpoint + event)` hoặc `(method + path)` để **nâng cấp kịch bản cũ**, tuyệt đối không sinh rác trùng lặp.

3. **Cổng kiểm duyệt trước khi báo cáo hoàn thành (Zero-Excuse Verification)**:
   - Trước khi Agent thông báo "Đã hoàn thành", Agent bắt buộc phải chạy:
     ```bash
     agent-harness run
     ```
     Chỉ khi kết quả trả về `PASSED (0 Error)`, Agent mới được phép bàn giao cho User.
