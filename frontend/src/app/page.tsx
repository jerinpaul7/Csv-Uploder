'use client';

import React, { useState } from 'react';
import Papa, { ParseResult } from 'papaparse';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<string[][]>([]);

  // Handle file selection & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setMessage('');
    setPreviewData([]);

    if (!selectedFile) return;

    // ✅ Check file type before parsing
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setMessage('Only CSV files are allowed.');
      setFile(null);
      return;
    }

    Papa.parse(selectedFile, {
      complete: (result: ParseResult<string[]>) => {
        const rows = result.data
          .filter((r) => Array.isArray(r) && r.length > 0)
          .map((r) => r.map((cell) => String(cell).trim()));
        setPreviewData(rows.slice(0, 6)); // header + 5 rows
      },
      skipEmptyLines: true,
      error: (err) => {
        console.error('CSV Parse Error:', err);
        setMessage('Error parsing CSV file.');
      },
    });
  };

  // Handle upload to backend
  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV file first.');
      return;
    }

    // ✅ Prevent accidental uploads of non-CSV even if mimetype bypassed
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage('Invalid file type. Only CSV files are accepted.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Upload successful. Inserted ${result.count} records.`);
      } else {
        setMessage(result.error || 'Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error while uploading CSV.');
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl font-bold mb-6">MY CSV UP</h1>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-[500px] text-center">
        <input
          type="file"
          name="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full border-2 border-gray-600 rounded-lg p-3 bg-gray-900 hover:border-blue-400 cursor-pointer transition mb-4"
        />

        {previewData.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-3 mb-4 text-left overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Preview (first 5 rows):</h2>
            <table className="w-full border-collapse border border-gray-600 text-sm">
              <tbody>
                {previewData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-600 ${
                      index === 0 ? 'font-semibold bg-gray-800' : ''
                    }`}
                  >
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className="border border-gray-600 px-2 py-1 whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload CSV'}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.startsWith('Upload successful')
                ? 'text-green-400'
                : message.toLowerCase().includes('error') ||
                  message.toLowerCase().includes('fail') ||
                  message.toLowerCase().includes('invalid')
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
