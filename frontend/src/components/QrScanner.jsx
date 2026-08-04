import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onScan }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 240,
      aspectRatio: 1.0,
    }, false);

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="qr-reader" className="scanner-box" />;
};

export default QrScanner;
