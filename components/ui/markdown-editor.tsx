"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { 
  Type, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Quote, 
  Code, 
  Eye, 
  Edit3,
  HelpCircle,
  Maximize2,
  Minimize2
} from "lucide-react";

interface MarkdownEditorProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  maxHeight?: string;
}

const MarkdownEditor = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter your markdown content...",
  rows = 8,
  className = "",
  maxHeight = "400px"
}: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert markdown syntax at cursor position
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = 
      value.substring(0, start) + 
      before + 
      textToInsert + 
      after + 
      value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      }
      textarea.focus();
    }, 0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            insertMarkdown('**', '**', 'bold text');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdown('*', '*', 'italic text');
            break;
          case 'k':
            e.preventDefault();
            insertMarkdown('[', '](url)', 'link text');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [value]);

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold (Ctrl+B)",
      onClick: () => insertMarkdown('**', '**', 'bold text'),
    },
    {
      icon: Italic,
      label: "Italic (Ctrl+I)",
      onClick: () => insertMarkdown('*', '*', 'italic text'),
    },
    {
      icon: Type,
      label: "Heading",
      onClick: () => insertMarkdown('## ', '', 'Heading'),
    },
    {
      icon: List,
      label: "Bullet List",
      onClick: () => insertMarkdown('- ', '', 'List item'),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      onClick: () => insertMarkdown('1. ', '', 'List item'),
    },
    {
      icon: Link,
      label: "Link (Ctrl+K)",
      onClick: () => insertMarkdown('[', '](https://)', 'link text'),
    },
    {
      icon: Image,
      label: "Image",
      onClick: () => insertMarkdown('![', '](image-url)', 'alt text'),
    },
    {
      icon: Quote,
      label: "Quote",
      onClick: () => insertMarkdown('> ', '', 'Quote text'),
    },
    {
      icon: Code,
      label: "Code",
      onClick: () => insertMarkdown('`', '`', 'code'),
    },
  ];

  const markdownGuide = [
    { syntax: "**bold text**", description: "Bold text" },
    { syntax: "*italic text*", description: "Italic text" },
    { syntax: "# Heading 1", description: "Large heading" },
    { syntax: "## Heading 2", description: "Medium heading" },
    { syntax: "### Heading 3", description: "Small heading" },
    { syntax: "- Item 1\n- Item 2", description: "Bullet list" },
    { syntax: "1. Item 1\n2. Item 2", description: "Numbered list" },
    { syntax: "[Link text](URL)", description: "Link" },
    { syntax: "![Alt text](image-URL)", description: "Image" },
    { syntax: "> Quote text", description: "Quote/blockquote" },
    { syntax: "`code`", description: "Inline code" },
    { syntax: "```\ncode block\n```", description: "Code block" },
    { syntax: "---", description: "Horizontal line" },
    { syntax: "~~strikethrough~~", description: "Strikethrough" },
  ];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          {label}
        </Label>
      )}
      
      <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Markdown Editor
              <Badge variant="outline" className="text-xs">
                {value.length} chars
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="h-7 w-7 p-0"
              >
                <HelpCircle className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-7 w-7 p-0"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50 mb-3">
            {toolbarButtons.map((button, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={button.onClick}
                title={button.label}
              >
                <button.icon className="w-3 h-3" />
              </Button>
            ))}
          </div>

          {/* Help Panel */}
          {showHelp && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <HelpCircle className="w-4 h-4" />
                  Markdown Syntax Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {markdownGuide.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">
                        {item.syntax}
                      </code>
                      <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editor Tabs */}
          <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as "edit" | "preview")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-3">
              <Textarea
                ref={textareaRef}
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={isFullscreen ? 25 : rows}
                className={`font-mono text-sm resize-none ${isFullscreen ? 'min-h-[500px]' : ''}`}
                style={{ maxHeight: isFullscreen ? 'none' : maxHeight }}
              />
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                <span>Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links</span>
                <span>{value.split('\n').length} lines</span>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-3">
              <div 
                className={`border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-950 prose prose-sm dark:prose-invert max-w-none overflow-auto ${
                  isFullscreen ? 'min-h-[500px]' : ''
                }`}
                style={{
                  maxHeight: isFullscreen ? 'none' : maxHeight,
                  minHeight: isFullscreen ? '500px' : 'auto'
                }}
              >
                {value.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({ children, ...props }) => <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white" {...props}>{children}</h1>,
                      h2: ({ children, ...props }) => <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white" {...props}>{children}</h2>,
                      h3: ({ children, ...props }) => <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white" {...props}>{children}</h3>,
                      p: ({ children, ...props }) => <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>{children}</p>,
                      strong: ({ children, ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props}>{children}</strong>,
                      em: ({ children, ...props }) => <em className="italic text-gray-600 dark:text-gray-400" {...props}>{children}</em>,
                      ul: ({ children, ...props }) => <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300" {...props}>{children}</ul>,
                      ol: ({ children, ...props }) => <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300" {...props}>{children}</ol>,
                      li: ({ children, ...props }) => <li className="mb-1 text-gray-700 dark:text-gray-300" {...props}>{children}</li>,
                      blockquote: ({ children, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props}>{children}</blockquote>,
                      code: ({ children, ...props }) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400" {...props}>{children}</code>,
                      pre: ({ children, ...props }) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto" {...props}>{children}</pre>,
                      a: ({ children, href, ...props }) => <a href={href} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline" {...props}>{children}</a>,
                      img: ({ src, alt, ...props }) => <img src={src} alt={alt} className="max-w-full h-auto rounded" {...props} />
                    }}
                  >
                    {value}
                  </ReactMarkdown>
                ) : (
                  <div className="text-gray-400 dark:text-gray-600 italic text-center py-8">
                    Nothing to preview. Start typing in the Edit tab to see the rendered markdown here.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkdownEditor;
