"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download, Copy, Check, ArrowLeft } from "lucide-react";
import type { Page } from "@/app/page";

interface QRGeneratorProps {
  onNavigate: (page: Page) => void;
}

export default function QRGenerator({ onNavigate }: QRGeneratorProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const generateQR = () => {
    if (!tableNumber) return;

    const baseUrl = window.location.origin;
    const url = `${baseUrl}?table=${tableNumber}`;
    setQrUrl(url);
  };

  const copyToClipboard = async () => {
    if (qrUrl) {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;

    // Create QR code using a simple QR API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrUrl
    )}`;

    const link = document.createElement("a");
    link.href = qrApiUrl;
    link.download = `table-${tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-emerald-800 p-2"
            onClick={() => onNavigate("waiter-dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">QR Code Generator</h1>
            <p className="text-emerald-100 text-sm">
              Generate QR codes for table ordering
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Generate Table QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number (e.g., 1, 2, 3...)"
                type="number"
              />
            </div>

            <Button
              onClick={generateQR}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={!tableNumber}
            >
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        {qrUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Table {tableNumber} QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    qrUrl
                  )}`}
                  alt={`QR Code for Table ${tableNumber}`}
                  className="mx-auto border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>QR Code URL:</Label>
                <div className="flex gap-2">
                  <Input value={qrUrl} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={downloadQR}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Instructions:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Print this QR code and place it on Table {tableNumber}
                  </li>
                  <li>
                    • Customers can scan the code to order directly from their
                    table
                  </li>
                  <li>
                    • Orders will show "Table {tableNumber}" in the waiter
                    dashboard
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
