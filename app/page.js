"use client";
import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import promptpay from "promptpay-qr";
import { IMaskInput } from "react-imask";
import html2canvas from "html2canvas"; // For downloading as PNG

export default function Home() {
  const [id, setId] = useState("");
  const [amount, setAmount] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // New state for "Remember Me"
  const qrCodeRef = useRef(null); // Ref for the QR code SVG element

  // Load values from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("promptpay_id") || "";
      const storedAmount = localStorage.getItem("promptpay_amount") || "";
      const storedRememberMe =
        localStorage.getItem("promptpay_remember_me") === "true";

      setId(storedId);
      setAmount(storedAmount);
      setRememberMe(storedRememberMe);

      if (storedRememberMe && storedId) {
        generateQr(storedId, storedAmount);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Clear success messages after a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const formatAmount = (value) => {
    // Ensure amount is always formatted to 2 decimal places if valid
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed.toFixed(2);
    }
    return value; // Return as-is if not a valid number or negative
  };

  const generateQr = (idValue, amountValue) => {
    setError("");
    setSuccessMessage("");
    setQr(""); // Clear previous QR while generating
    try {
      if (!idValue) {
        throw new Error("กรุณาใส่ PromptPay ID");
      }

      const cleanedId = idValue.replace(/[^0-9]/g, "");
      if (cleanedId.length !== 10 && cleanedId.length !== 13) {
        throw new Error(
          "PromptPay ID ต้องเป็นเบอร์มือถือ 10 หลัก หรือ เลขบัตรประชาชน 13 หลัก"
        );
      }

      let amt = undefined;
      if (amountValue) {
        const parsedAmt = parseFloat(amountValue);
        if (isNaN(parsedAmt) || parsedAmt < 0) {
          throw new Error("จำนวนเงินต้องเป็นตัวเลขที่เป็นบวก");
        }
        amt = parsedAmt;
      }

      const qrString = promptpay(cleanedId, { amount: amt });
      setQr(qrString);

      // Save to localStorage based on "Remember Me" preference
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("promptpay_id", idValue);
        localStorage.setItem("promptpay_amount", amountValue);
        localStorage.setItem("promptpay_remember_me", rememberMe);
      } else if (typeof window !== "undefined") {
        // Clear if rememberMe is false
        localStorage.removeItem("promptpay_id");
        localStorage.removeItem("promptpay_amount");
        localStorage.setItem("promptpay_remember_me", rememberMe);
      }
      setSuccessMessage("สร้าง QR Code สำเร็จ!");
    } catch (err) {
      setError(err.message);
      setQr("");
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    generateQr(id, amount);
  };

  const handleCopy = () => {
    if (qr && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(qr)
        .then(() => {
          setSuccessMessage("คัดลอก QR String แล้ว!");
        })
        .catch(() => {
          setError("ไม่สามารถคัดลอกได้ในเบราว์เซอร์นี้");
        });
    } else if (!qr) {
      setError("ไม่มี QR String ให้คัดลอก");
    } else {
      setError("ไม่รองรับการคัดลอกในเบราว์เซอร์นี้");
    }
  };

  const downloadQrCodeAsPng = () => {
    if (qrCodeRef.current) {
      setError(""); // Clear previous errors
      setSuccessMessage("");
      html2canvas(qrCodeRef.current, {
        useCORS: true, // Important for some environments
        backgroundColor: null, // Keep background transparent if needed, or set white
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `PromptPay_QR_${id}_${amount || "no-amount"}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setSuccessMessage("ดาวน์โหลด QR (PNG) สำเร็จ!");
        })
        .catch((err) => {
          setError("ไม่สามารถดาวน์โหลด QR (PNG) ได้: " + err.message);
        });
    } else {
      setError("ไม่มี QR Code ให้ดาวน์โหลด");
    }
  };

  const downloadQrCodeAsSvg = () => {
    if (qr) {
      setError(""); // Clear previous errors
      setSuccessMessage("");
      const svgString = `<svg width="260" height="260" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">${qrCodeRef.current.innerHTML}</svg>`;
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PromptPay_QR_${id}_${amount || "no-amount"}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up
      setSuccessMessage("ดาวน์โหลด QR (SVG) สำเร็จ!");
    } else {
      setError("ไม่มี QR Code ให้ดาวน์โหลด");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8 font-sans text-gray-800">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-blue-800 drop-shadow-lg text-center tracking-tight leading-tight">
        PromptPay QR Code Generator 🇹🇭
      </h1>

      <form
        onSubmit={handleGenerate}
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-10 flex flex-col gap-5 w-full max-w-md sm:max-w-lg border border-blue-200 ring-2 ring-blue-100/50"
        noValidate
      >
        <label
          htmlFor="promptpayId"
          className="font-semibold text-base sm:text-lg text-gray-800"
        >
          PromptPay ID{" "}
          <span className="text-gray-500 font-normal text-sm">
            (เบอร์มือถือ 10 หลัก หรือ เลขบัตรประชาชน 13 หลัก)
          </span>
        </label>
        <IMaskInput
          mask={
            id.replace(/[^0-9]/g, "").length === 10
              ? "000-000-0000"
              : "0-0000-00000-00-0"
          }
          value={id}
          onAccept={(value) => setId(value)}
          onBlur={() => {
            const cleaned = id.replace(/[^0-9]/g, "");
            if (cleaned.length === 10 || cleaned.length === 13) {
              generateQr(id, amount);
            }
          }}
          id="promptpayId"
          className="border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-gray-50 placeholder-gray-400 font-mono"
          type="text"
          placeholder="เช่น 0812345678 หรือ 1101700209261"
          required
        />

        <label
          htmlFor="amount"
          className="font-semibold text-base sm:text-lg text-gray-800"
        >
          Amount{" "}
          <span className="text-gray-500 font-normal text-sm">
            (THB, ไม่บังคับ)
          </span>
        </label>
        <input
          id="amount"
          className="border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-gray-50 placeholder-gray-400 font-mono"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={(e) => setAmount(formatAmount(e.target.value))} // Format on blur
          placeholder="เช่น 100.00"
        />

        <div className="flex items-center mt-1">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 block text-sm text-gray-700 select-none cursor-pointer"
          >
            จดจำ PromptPay ID และจำนวนเงินนี้
          </label>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-xl text-lg sm:text-xl shadow-lg transition-all duration-300 transform hover:scale-105 mt-4 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
        >
          สร้าง QR Code
        </button>

        {error && (
          <div className="text-red-700 font-semibold text-center text-md bg-red-100/90 p-3 rounded-lg border border-red-300 mt-2 animate-pulse-error">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="text-green-700 font-semibold text-center text-md bg-green-100/90 p-3 rounded-lg border border-green-300 mt-2 animate-fade-in-down">
            {successMessage}
          </div>
        )}
      </form>

      {qr && (
        <div className="mt-10 flex flex-col items-center gap-4 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 max-w-md sm:max-w-lg border border-blue-200 ring-2 ring-blue-100/50">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
            QR Code ของคุณ
          </h2>
          <div className="border-4 border-blue-500 rounded-lg p-2 bg-white flex justify-center items-center">
            <div ref={qrCodeRef}>
              {" "}
              {/* This div is referenced for screenshot */}
              <QRCodeSVG
                value={qr}
                size={260}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 break-all text-center mt-2 p-2 bg-gray-50 rounded-lg max-w-full select-all font-mono">
            QR String: {qr}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
            <button
              onClick={handleCopy}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 border border-blue-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="คัดลอก QR String"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              คัดลอก
            </button>
            <button
              onClick={downloadQrCodeAsPng}
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 border border-green-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-300"
              aria-label="ดาวน์โหลด QR (PNG)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              ดาวน์โหลด PNG
            </button>
            <button
              onClick={downloadQrCodeAsSvg}
              className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 border border-purple-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="ดาวน์โหลด QR (SVG)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M.82 10a.82.82 0 01-.004-.82L5.27 2.152a.82.82 0 011.16-.002L10 5.617l3.57-3.467a.82.82 0 011.162.002l4.454 7.026a.82.82 0 01-.004.82L14.73 17.848a.82.82 0 01-1.16.002L10 14.383l-3.57 3.467a.82.82 0 01-1.162-.002L.82 10zM10 13.52l3.29-3.197L10 7.126 6.71 10.323l3.29 3.197z"
                  clipRule="evenodd"
                />
              </svg>
              ดาวน์โหลด SVG
            </button>
          </div>
        </div>
      )}

      <footer className="mt-16 text-gray-500 text-sm sm:text-md font-medium text-center">
        Made with <span className="text-pink-500">❤️</span> for PromptPay users
        in Thailand
        <p className="mt-2">
          ใช้ `promptpay-qr` และ `qrcode.react` โดย KBank Developer
        </p>
      </footer>
    </div>
  );
}
