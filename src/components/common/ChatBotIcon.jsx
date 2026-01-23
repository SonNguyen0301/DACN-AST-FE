import { MessageOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd"; 
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
        <Button
          type="primary"
          shape="circle" 
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            right: 30,
            bottom: 30,

            width: 64,
            height: 64,
            
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
          }}
          icon={
            <MessageOutlined
              style={{
                fontSize: '32px', 
                lineHeight: 0    
              }}
            />
          }
        />
      </Tooltip>

      {open && <ChatBotPopup onClose={() => setOpen(false)} />}
    </>
  );
}