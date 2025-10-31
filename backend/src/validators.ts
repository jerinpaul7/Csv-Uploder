export interface StockRow {
  ItemName: string;
  SKU: string;
  Category: string;
  Unit: string;
  CurrentStock: string | number;
  ReorderLevel: string | number;
  Status: string;
}

// Field validation logic
export const validateRow = (row: StockRow, index: number): string | null => {
  const requiredFields = ["ItemName", "SKU", "Category", "Unit", "CurrentStock", "ReorderLevel", "Status"];
  
  for (const field of requiredFields) {
    if (!row[field as keyof StockRow] || row[field as keyof StockRow].toString().trim() === "") {
      return `Row ${index + 1}: Missing required field '${field}'`;
    }
  }

  if (isNaN(Number(row.CurrentStock))) {
    return `Row ${index + 1}: Invalid value for CurrentStock (${row.CurrentStock})`;
  }

  if (isNaN(Number(row.ReorderLevel))) {
    return `Row ${index + 1}: Invalid value for ReorderLevel (${row.ReorderLevel})`;
  }

  return null;
};
