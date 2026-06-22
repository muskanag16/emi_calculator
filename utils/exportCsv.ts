export function exportCSV(
  rows: any[]
) {
  const headers =
    Object.keys(rows[0]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map(
          (h) => row[h]
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(
    [csv],
    {
      type: "text/csv",
    }
  );

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "amortization.csv";

  a.click();

  URL.revokeObjectURL(url);
}