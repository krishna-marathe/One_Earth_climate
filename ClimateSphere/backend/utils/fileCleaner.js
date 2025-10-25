const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');

class FileCleaner {
  async processFile(filePath) {
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    let data = [];
    
    if (fileExtension === 'csv') {
      data = await this.processCSV(filePath);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      data = await this.processExcel(filePath);
    } else {
      throw new Error('Unsupported file format');
    }

    return this.cleanData(data);
  }

  async processCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  async processExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  cleanData(data) {
    if (!data || data.length === 0) {
      throw new Error('No data found in file');
    }

    const columns = Object.keys(data[0]);
    let cleanedData = [...data];

    // Remove rows with all null/empty values
    cleanedData = cleanedData.filter(row => {
      return columns.some(col => row[col] !== null && row[col] !== undefined && row[col] !== '');
    });

    // Handle missing values
    cleanedData = cleanedData.map(row => {
      const cleanedRow = { ...row };
      columns.forEach(col => {
        if (cleanedRow[col] === null || cleanedRow[col] === undefined || cleanedRow[col] === '') {
          // For numeric columns, use 0 or median
          if (this.isNumericColumn(data, col)) {
            cleanedRow[col] = 0;
          } else {
            cleanedRow[col] = 'Unknown';
          }
        }
      });
      return cleanedRow;
    });

    // Generate summary statistics
    const summary = this.generateSummary(cleanedData, columns);

    return {
      data: cleanedData,
      rowCount: cleanedData.length,
      columns: columns,
      summary: summary
    };
  }

  isNumericColumn(data, columnName) {
    const sample = data.slice(0, 10);
    const numericCount = sample.filter(row => {
      const value = row[columnName];
      return value !== null && value !== undefined && value !== '' && !isNaN(Number(value));
    }).length;
    
    return numericCount > sample.length * 0.7; // 70% threshold
  }

  generateSummary(data, columns) {
    const summary = {};
    
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined && val !== '');
      
      summary[col] = {
        totalValues: values.length,
        uniqueValues: new Set(values).size,
        missingValues: data.length - values.length
      };

      if (this.isNumericColumn(data, col)) {
        const numericValues = values.map(Number).filter(val => !isNaN(val));
        if (numericValues.length > 0) {
          summary[col].min = Math.min(...numericValues);
          summary[col].max = Math.max(...numericValues);
          summary[col].mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        }
      }
    });

    return summary;
  }
}

module.exports = new FileCleaner();