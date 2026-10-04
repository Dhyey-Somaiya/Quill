import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
} from "lucide-react";

export default function RichEditor({ value = "", onChange, placeholder = "Tell your story..." }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(1);

  // Floating toolbar state
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  // Sync value into innerHTML initially or when updated externally
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
      updateCounts();
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      updateCounts();
      if (onChange) {
        const cleanHtml = html === "<br>" ? "" : html;
        onChange(cleanHtml);
      }
    }
  };

  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || editorRef.current.textContent || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setReadTime(Math.max(1, Math.ceil(words / 200)));
  };

  const checkSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setToolbarVisible(false);
      return;
    }

    if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();

      if (rect.width > 0) {
        let topPos = rect.top - editorRect.top - 50;
        if (topPos < 0) {
          topPos = rect.bottom - editorRect.top + 10;
        }

        setToolbarPosition({
          top: topPos,
          left: rect.left - editorRect.left + (rect.width / 2) - 160,
        });
        setToolbarVisible(true);
      } else {
        setToolbarVisible(false);
      }
    } else {
      setToolbarVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", checkSelection);
    return () => document.removeEventListener("selectionchange", checkSelection);
  }, [checkSelection]);

  // Robust DOM Image Inserter
  const insertImageElement = (src, alt = "Image") => {
    if (!editorRef.current || !src) return;

    editorRef.current.focus();

    const figure = document.createElement("figure");
    figure.className = "rich-figure";
    figure.style.margin = "2em 0";
    figure.style.textAlign = "center";

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    img.style.display = "block";
    img.style.margin = "0 auto";
    img.style.boxShadow = "0 4px 24px rgba(0,0,0,0.1)";

    figure.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.setAttribute("contenteditable", "true");
    figcaption.setAttribute("placeholder", "Add a caption (optional)...");
    figcaption.style.marginTop = "10px";
    figcaption.style.fontSize = "13px";
    figcaption.style.color = "var(--muted)";
    figcaption.style.fontStyle = "italic";
    figure.appendChild(figcaption);

    const followP = document.createElement("p");
    followP.innerHTML = "<br>";

    const sel = window.getSelection();
    let inserted = false;

    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

      while (node && node.parentNode && node.parentNode !== editorRef.current) {
        node = node.parentNode;
      }

      if (node && node.parentNode === editorRef.current) {
        node.after(figure);
        figure.after(followP);
        inserted = true;
      }
    }

    if (!inserted) {
      editorRef.current.appendChild(figure);
      editorRef.current.appendChild(followP);
    }

    try {
      const newRange = document.createRange();
      newRange.setStart(followP, 0);
      newRange.collapse(true);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    } catch (e) {
      // Cursor positioning fallback
    }

    handleInput();
  };

  // Handle pasting images directly (screenshots, files, HTML img, image URLs)
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    // 1. Check for image files in clipboard items / files
    const items = clipboardData.items;
    const files = clipboardData.files;

    let imageFile = null;

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.startsWith("image/")) {
          imageFile = items[i].getAsFile();
          break;
        }
      }
    }

    if (!imageFile && files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type && files[i].type.startsWith("image/")) {
          imageFile = files[i];
          break;
        }
      }
    }

    if (imageFile) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (event) => {
        insertImageElement(event.target.result, "Pasted Image");
      };
      reader.readAsDataURL(imageFile);
      return;
    }

    // 2. Check for HTML containing <img> tag (copied from browser or document)
    const htmlData = clipboardData.getData("text/html");
    if (htmlData && htmlData.includes("<img")) {
      const match = htmlData.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        e.preventDefault();
        insertImageElement(match[1], "Pasted Image");
        return;
      }
    }

    // 3. Check for direct Image URL pasted as plain text
    const textData = clipboardData.getData("text/plain")?.trim();
    if (textData && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(textData)) {
      e.preventDefault();
      insertImageElement(textData, "Pasted Image");
      return;
    }
  };

  // Handle drag and drop images
  const handleDrop = (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type && files[i].type.startsWith("image/")) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            insertImageElement(event.target.result, "Dropped Image");
          };
          reader.readAsDataURL(files[i]);
          return;
        }
      }
    }
  };

  // Handle file input upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        insertImageElement(event.target.result, file.name || "Uploaded Image");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Helper for execCommand
  const execCmd = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
      checkSelection();
    }
  };

  // Heading toggles
  const applyHeading = (tag) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const focusNode = selection.focusNode;
    let blockNode = focusNode?.nodeType === 3 ? focusNode.parentNode : focusNode;
    while (blockNode && blockNode !== editorRef.current && !["P", "H1", "H2", "H3", "BLOCKQUOTE", "DIV"].includes(blockNode.tagName)) {
      blockNode = blockNode.parentNode;
    }

    if (blockNode && blockNode.tagName === tag.toUpperCase()) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    handleInput();
    checkSelection();
  };

  const applyQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let blockNode = selection.focusNode?.parentNode;
    while (blockNode && blockNode !== editorRef.current && !["P", "H1", "H2", "H3", "BLOCKQUOTE", "DIV"].includes(blockNode.tagName)) {
      blockNode = blockNode.parentNode;
    }

    if (blockNode && blockNode.tagName === "BLOCKQUOTE") {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, "<blockquote>");
    }
    handleInput();
    checkSelection();
  };

  return (
    <div className="rich-editor-wrapper" style={{ position: "relative" }}>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* Floating Medium-Style Toolbar */}
      {toolbarVisible && (
        <div 
          className="rich-toolbar floating-toolbar" 
          style={{ 
            position: "absolute", 
            top: `${toolbarPosition.top}px`, 
            left: `${Math.max(0, toolbarPosition.left)}px`,
            zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "top 0.1s, left 0.1s",
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent losing focus when clicking toolbar
        >
          <div className="toolbar-group">
            <button
              type="button"
              className="tb-btn"
              onClick={() => execCmd("bold")}
              title="Bold (Ctrl+B)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              className="tb-btn"
              onClick={() => execCmd("italic")}
              title="Italic (Ctrl+I)"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              className="tb-btn"
              onClick={() => execCmd("underline")}
              title="Underline (Ctrl+U)"
            >
              <Underline size={15} />
            </button>
          </div>

          <div className="tb-divider" style={{ width: 1, height: 20, background: "var(--line)", margin: "0 4px" }} />

          <div className="toolbar-group">
            <button
              type="button"
              className="tb-btn"
              onClick={() => applyHeading("h2")}
              title="Section Heading (H2)"
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              className="tb-btn"
              onClick={() => applyHeading("h3")}
              title="Sub Heading (H3)"
            >
              <Heading3 size={16} />
            </button>
            <button
              type="button"
              className="tb-btn"
              onClick={applyQuote}
              title="Blockquote"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              className="tb-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Insert Image"
            >
              <ImageIcon size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="editor-canvas-container">
        <div
          ref={editorRef}
          className="rich-editor-content"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={handleInput}
          onBlur={handleInput}
          onPaste={handlePaste}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          data-placeholder={placeholder}
          style={{
            fontFamily: "var(--serif)",
            fontSize: "21px",
            lineHeight: "1.8",
            color: "var(--text)",
            outline: "none",
            minHeight: "300px",
            paddingBottom: "40px"
          }}
        />
      </div>

      {/* Bottom Editor Bar */}
      <div className="editor-footer-stats" style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "13px",
        color: "var(--muted)",
        background: "var(--bg)",
        padding: "4px 12px",
        borderRadius: "999px",
        border: "1px solid var(--line)"
      }}>
        <span>{wordCount} words</span>
        <span style={{ margin: "0 8px" }}>·</span>
        <span>{readTime} min read</span>
      </div>
    </div>
  );
}
