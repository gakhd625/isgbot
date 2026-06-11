import type { Appointment } from "@/types/database";

const headers = [
  "Client Name",
  "Phone Number",
  "Area",
  "Appointment Date",
  "Appointment Time",
  "Setter",
  "Status",
  "Checked By",
  "Checked At",
  "Remarks",
  "Created At"
];

function cell(value: string | null) {
  return `"${(value ?? "").replaceAll('"', '""')}"`;
}

export function appointmentsToCsv(rows: Appointment[]) {
  const body = rows.map((row) =>
    [
      row.client_name,
      row.phone_number,
      row.area,
      row.appointment_date,
      row.appointment_time,
      row.setter_name,
      row.status,
      row.checked_by,
      row.checked_at,
      row.remarks,
      row.created_at
    ]
      .map(cell)
      .join(",")
  );

  return [headers.map(cell).join(","), ...body].join("\n");
}
