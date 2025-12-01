import { MessageOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd"; // 1. Đổi FloatButton thành Button
import { useState } from "react";
import ChatBotPopup from "./ChatBotPopup";

export default function ChatBotIcon() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip
        title={<span style={{ fontSize: '14px', fontWeight: 'bold' }}>Hỗ trợ (AI)</span>}
        placement="left"
      >
        {/* ----- BẮT ĐẦU THAY ĐỔI ----- */}
        <Button
          type="primary"
          shape="circle" // Dùng shape="circle" cho tròn
          onClick={() => setOpen(true)}
          style={{
            // CSS để biến nó thành "float"
            position: 'fixed',
            right: 30,
            bottom: 30,

            // Kích thước vỏ nút
            width: 64,
            height: 64,
            
            // Thêm bóng cho đẹp (giống FloatButton)
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
          }}
          // Truyền icon vào prop và style trực tiếp
          icon={
            <MessageOutlined
              style={{
                fontSize: '32px', // <-- 2. Chỉnh kích thước icon thoải mái ở đây
                lineHeight: 0     // Giúp căn icon vào giữa
              }}
            />
          }
        />
      </Tooltip>

      {open && <ChatBotPopup onClose={() => setOpen(false)} />}
    </>
  );
}