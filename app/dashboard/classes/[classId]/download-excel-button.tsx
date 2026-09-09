"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Button from "@/components/ui/Button";
import { FileSpreadsheetIcon } from "@/components/ui/Icons";

export type StudentResultRow = {
  id: number;
  studentCode: string;
  name: string;
  testsTaken: number;
  testsPending: number;
  averageScore: number | null;
  testScores?: Record<string, { score: number; totalQuestions: number }>;
};

export type AssignedTestInfo = {
  id: string;
  title: string;
  totalQuestions: number;
};

export default function DownloadClassExcelButton({
  className,
  students,
  assignedTests = [],
}: {
  className: string;
  students: StudentResultRow[];
  assignedTests?: AssignedTestInfo[];
}) {
  const [downloading, setDownloading] = useState(false);

  function handleDownload() {
    setDownloading(true);
    try {
      // 1. Sort students strictly from highest to lowest average score
      const sortedStudents = [...students].sort((a, b) => {
        const scoreA = a.averageScore !== null ? a.averageScore : -1;
        const scoreB = b.averageScore !== null ? b.averageScore : -1;
        if (scoreB !== scoreA) {
          return scoreB - scoreA; // Highest score first
        }
        return a.name.localeCompare(b.name);
      });

      // 2. Build headers
      const headers = [
        "O'rin",
        "ID raqami",
        "O'quvchi F.I.SH.",
        "Topshirgan testlar",
        "Kutilmoqda",
        "O'rtacha ball (%)",
        "Baholash",
        ...assignedTests.map((t) => `${t.title} (${t.totalQuestions} savol)`),
      ];

      // 3. Build data rows
      const dataRows = sortedStudents.map((s, index) => {
        let grade = "Topshirmagan";
        if (s.averageScore !== null) {
          if (s.averageScore >= 85) grade = "A'lo (5)";
          else if (s.averageScore >= 70) grade = "Yaxshi (4)";
          else if (s.averageScore >= 55) grade = "Qoniqarli (3)";
          else grade = "Qoniqarsiz (2)";
        }

        const testColumns = assignedTests.map((t) => {
          const testRes = s.testScores?.[t.id];
          if (!testRes) return "Topshirmagan";
          const percent =
            testRes.totalQuestions > 0
              ? Math.round((testRes.score / testRes.totalQuestions) * 100)
              : 0;
          return `${testRes.score}/${testRes.totalQuestions} (${percent}%)`;
        });

        return [
          index + 1,
          s.studentCode,
          s.name,
          s.testsTaken,
          s.testsPending,
          s.averageScore !== null ? `${s.averageScore}%` : "—",
          grade,
          ...testColumns,
        ];
      });

      const today = new Date().toLocaleDateString("uz-UZ");
      const titleRow = [`${className} sinfi o'quvchilari natijalari`];
      const subRow = [`Sana: ${today} | Jami o'quvchilar soni: ${students.length}`];
      const emptyRow: string[] = [];

      const aoa = [titleRow, subRow, emptyRow, headers, ...dataRows];
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);

      // Set responsive column widths
      worksheet["!cols"] = [
        { wch: 8 },  // O'rin
        { wch: 12 }, // ID raqami
        { wch: 26 }, // F.I.SH.
        { wch: 18 }, // Topshirgan testlar
        { wch: 14 }, // Kutilmoqda
        { wch: 18 }, // O'rtacha ball (%)
        { wch: 16 }, // Baholash
        ...assignedTests.map(() => ({ wch: 24 })),
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");

      const dateStr = new Date().toISOString().slice(0, 10);
      const safeClassName = className.replace(/[^a-zA-Z0-9_\u0400-\u04FF-]/g, "_");
      XLSX.writeFile(workbook, `${safeClassName}_natijalar_${dateStr}.xlsx`);
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
      disabled={students.length === 0}
      icon={<FileSpreadsheetIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      className="text-xs font-semibold hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer"
    >
      <span>Excel yuklab olish</span>
    </Button>
  );
}
