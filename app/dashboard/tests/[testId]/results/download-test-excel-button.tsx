"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Button from "@/components/ui/Button";
import { FileSpreadsheetIcon } from "@/components/ui/Icons";

export type TestAttemptRow = {
  id: string;
  studentCode: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  submittedAt: Date | string;
};

export default function DownloadTestExcelButton({
  testTitle,
  attempts,
}: {
  testTitle: string;
  attempts: TestAttemptRow[];
}) {
  const [downloading, setDownloading] = useState(false);

  function handleDownload() {
    setDownloading(true);
    try {
      // 1. Sort attempts from highest to lowest score
      const sortedAttempts = [...attempts].sort((a, b) => {
        const percentA = a.totalQuestions > 0 ? a.score / a.totalQuestions : 0;
        const percentB = b.totalQuestions > 0 ? b.score / b.totalQuestions : 0;
        if (percentB !== percentA) {
          return percentB - percentA; // Highest to lowest
        }
        return b.score - a.score;
      });

      // 2. Build rows
      const headers = [
        "O'rin",
        "ID raqami",
        "O'quvchi F.I.SH.",
        "To'g'ri javoblar",
        "Jami savollar",
        "Natija (%)",
        "Baholash",
        "Topshirilgan vaqti",
      ];

      const dataRows = sortedAttempts.map((a, index) => {
        const percent = a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0;
        let grade = "Qoniqarsiz (2)";
        if (percent >= 85) grade = "A'lo (5)";
        else if (percent >= 70) grade = "Yaxshi (4)";
        else if (percent >= 55) grade = "Qoniqarli (3)";

        const submittedTime = new Date(a.submittedAt).toLocaleString("uz-UZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        return [
          index + 1,
          a.studentCode,
          a.studentName,
          a.score,
          a.totalQuestions,
          `${percent}%`,
          grade,
          submittedTime,
        ];
      });

      const today = new Date().toLocaleDateString("uz-UZ");
      const titleRow = [`"${testTitle}" testi natijalari`];
      const subRow = [`Sana: ${today} | Jami topshirganlar soni: ${attempts.length}`];
      const emptyRow: string[] = [];

      const aoa = [titleRow, subRow, emptyRow, headers, ...dataRows];
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);

      worksheet["!cols"] = [
        { wch: 8 },  // O'rin
        { wch: 12 }, // ID
        { wch: 26 }, // Name
        { wch: 18 }, // Score
        { wch: 16 }, // Total
        { wch: 14 }, // %
        { wch: 16 }, // Grade
        { wch: 22 }, // Time
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");

      const dateStr = new Date().toISOString().slice(0, 10);
      const safeTitle = testTitle.replace(/[^a-zA-Z0-9_\u0400-\u04FF-]/g, "_");
      XLSX.writeFile(workbook, `${safeTitle}_natijalar_${dateStr}.xlsx`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleDownload}
      loading={downloading}
      disabled={attempts.length === 0}
      icon={<FileSpreadsheetIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      className="text-xs font-semibold hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer"
    >
      <span>Excel yuklab olish</span>
    </Button>
  );
}
