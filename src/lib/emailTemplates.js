export function otpEmailTemplate({ code, role, appName = "School Portal" }) {
  const digits = String(code).split("").map((d) => `<span style="display:inline-block;width:44px;height:56px;line-height:56px;margin:0 6px;border:1px solid #e5e7eb;border-radius:10px;background:#ffffff;font-size:24px;font-weight:700;color:#111827;text-align:center;font-family:Inter,Segoe UI,Arial,sans-serif;">${d}</span>`).join("")
  return `<!doctype html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${appName} OTP</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <div style="width:100%;padding:32px 0;background:#f8fafc;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.04);">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#2563eb 0%,#1e40af 100%);color:#fff;">
        <div style="display:flex;align-items:center;">
          <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin-right:12px;">
            <span style="font-size:22px;font-weight:800;">S</span>
          </div>
          <div style="font-size:18px;font-weight:700;letter-spacing:0.2px;">${appName}</div>
        </div>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 8px 0;font-size:14px;color:#4b5563;font-family:Inter,Segoe UI,Arial,sans-serif;">Hello,</p>
        <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#111827;font-family:Inter,Segoe UI,Arial,sans-serif;">Your ${role} verification code</h1>
        <p style="margin:0 0 20px 0;font-size:14px;color:#4b5563;font-family:Inter,Segoe UI,Arial,sans-serif;">Use this one-time code to securely sign in to ${appName}. This code expires in 10 minutes.</p>
        <div style="text-align:center;margin:20px 0;">${digits}</div>
        <div style="margin-top:4px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;background:#1d4ed8;color:#eff6ff;font-size:13px;font-family:Inter,Segoe UI,Arial,sans-serif;">
            <span style="font-weight:600;">Copy code</span>
            <span style="padding:2px 10px;border-radius:6px;background:rgba(15,23,42,0.16);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;letter-spacing:2px;font-size:15px;">${code}</span>
          </div>
        </div>
        <div style="margin-top:24px;padding:14px;border-radius:12px;background:#f1f5f9;border:1px solid #e2e8f0;">
          <p style="margin:0;font-size:13px;color:#334155;font-family:Inter,Segoe UI,Arial,sans-serif;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      </div>
      <div style="padding:18px 28px;border-top:1px solid #f1f5f9;background:#fafafa;">
        <p style="margin:0;font-size:12px;color:#6b7280;font-family:Inter,Segoe UI,Arial,sans-serif;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function attendanceAbsentEmailTemplate({ studentName, className, date, remarks = "", appName = "School Portal" }) {
  const dateStr = new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  return `<!doctype html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${appName} Attendance Alert</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <div style="width:100%;padding:32px 0;background:#f8fafc;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.04);">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#dc2626 0%,#7f1d1d 100%);color:#fff;">
        <div style="display:flex;align-items:center;">
          <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin-right:12px;">
            <span style="font-size:22px;font-weight:800;">S</span>
          </div>
          <div style="font-size:18px;font-weight:700;letter-spacing:0.2px;">${appName} • Attendance Alert</div>
        </div>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#111827;font-family:Inter,Segoe UI,Arial,sans-serif;">Absence Notification</h1>
        <p style="margin:0 0 12px 0;font-size:14px;color:#4b5563;font-family:Inter,Segoe UI,Arial,sans-serif;">
          Dear Parent/Guardian,
        </p>
        <p style="margin:0 0 16px 0;font-size:14px;color:#334155;font-family:Inter,Segoe UI,Arial,sans-serif;">
          This is to inform you that <strong>${studentName}</strong>${className ? ` (Class ${className})` : ""} was marked <strong>Absent</strong> on <strong>${dateStr}</strong>.
        </p>
        ${remarks ? `<div style="margin:16px 0;padding:14px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;">
          <p style="margin:0;font-size:13px;color:#9a3412;font-family:Inter,Segoe UI,Arial,sans-serif;"><strong>Remarks:</strong> ${remarks}</p>
        </div>` : ""}
        <p style="margin:12px 0 0 0;font-size:13px;color:#64748b;font-family:Inter,Segoe UI,Arial,sans-serif;">
          If you have any questions, please contact the school administration.
        </p>
      </div>
      <div style="padding:18px 28px;border-top:1px solid #f1f5f9;background:#fafafa;">
        <p style="margin:0;font-size:12px;color:#6b7280;font-family:Inter,Segoe UI,Arial,sans-serif;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function marksheetEmailTemplate({ studentName, className, term, results, average, overallGrade, appName = "School Portal" }) {
  const safeResults = Array.isArray(results) ? results : []
  const rows = safeResults.map((r, idx) => {
    const marks = typeof r.marks === "number" ? r.marks : 0
    const grade = r.grade || ""
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${idx + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${r.subject}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;text-align:center;">100</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;text-align:center;">${marks}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;text-align:center;">${marks}%</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;text-align:center;">${grade}</td>
    </tr>`
  }).join("")

  return `<!doctype html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${appName} Marksheet</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <div style="width:100%;padding:32px 0;background:#f3f4f6;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#2563eb 0%,#1e40af 100%);color:#fff;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;">
            <div style="width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;margin-right:14px;">
              <span style="font-size:24px;font-weight:800;">S</span>
            </div>
            <div>
              <div style="font-size:20px;font-weight:700;letter-spacing:0.2px;">${appName}</div>
              <div style="font-size:12px;color:rgba(239,246,255,0.85);margin-top:2px;">Official Academic Marksheet</div>
            </div>
          </div>
          <div style="text-align:right;font-size:12px;color:rgba(239,246,255,0.9);">
            <div>Generated on ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div style="padding:24px 28px 8px 28px;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-bottom:16px;">
          <div>
            <div style="font-size:13px;color:#6b7280;">Student Name</div>
            <div style="font-size:16px;font-weight:600;color:#111827;">${studentName}</div>
          </div>
          ${className ? `<div>
            <div style="font-size:13px;color:#6b7280;">Class</div>
            <div style="font-size:15px;font-weight:500;color:#111827;">${className}</div>
          </div>` : ""}
          ${term ? `<div>
            <div style="font-size:13px;color:#6b7280;">Term</div>
            <div style="font-size:15px;font-weight:500;color:#111827;">${term}</div>
          </div>` : ""}
          <div>
            <div style="font-size:13px;color:#6b7280;">Overall</div>
            <div style="font-size:15px;font-weight:600;color:#111827;">${average}% • Grade ${overallGrade}</div>
          </div>
        </div>

        <div style="margin-top:12px;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#4b5563;text-align:left;border-bottom:1px solid #e5e7eb;">#</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#4b5563;text-align:left;border-bottom:1px solid #e5e7eb;">Subject</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#4b5563;text-align:center;border-bottom:1px solid #e5e7eb;">Total</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#4b5563;text-align:center;border-bottom:1px solid #e5e7eb;">Marks</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#4b5563;text-align:center;border-bottom:1px solid #e5e7eb;">%</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#4b5563;text-align:center;border-bottom:1px solid #e5e7eb;">Grade</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="6" style="padding:12px;font-size:13px;color:#6b7280;text-align:center;">No results available</td></tr>`}
            </tbody>
          </table>
        </div>

        <div style="margin-top:18px;padding:14px 16px;border-radius:10px;background:#f9fafb;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
          This email contains an automatically generated marksheet based on the latest results recorded in ${appName}.
        </div>
      </div>

      <div style="padding:18px 28px;border-top:1px solid #f1f5f9;background:#fafafa;">
        <p style="margin:0;font-size:12px;color:#6b7280;font-family:Inter,Segoe UI,Arial,sans-serif;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}
