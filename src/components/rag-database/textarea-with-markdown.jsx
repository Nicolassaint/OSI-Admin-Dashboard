import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import MarkdownToolbar from "./markdown-toolbar";

export default function TextareaWithMarkdown({ 
  value, 
  onChange, 
  placeholder, 
  className = "", 
  rows = 3,
  label
}) {
  const textareaRef = useRef(null);
  
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <MarkdownToolbar textareaRef={textareaRef} />
      <Textarea
        ref={textareaRef}
        className={`w-full resize-y ${className}`}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
} 