/**
 * Converts an array of objects to a CSV string.
 * @param data - The array of objects to convert.
 * @returns A string in CSV format.
 */
export function convertToCsv(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  const replacer = (key: string, value: any) => (value === null ? "" : value);
  const header = Object.keys(data[0]);
  const csv = [
    header.join(","),
    ...data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");

  return csv;
}

/**
 * Triggers a browser download for the given content.
 * @param content - The content of the file to download.
 * @param fileName - The name of the file.
 * @param mimeType - The MIME type of the file.
 */
export function downloadFile(
  content: string,
  fileName: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
