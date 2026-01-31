const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Initialize Auth
const getAuth = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../google-credentials.json'),
        scopes: SCOPES,
    });
    return await auth.getClient();
};

/**
 * Appends an approved expense to the specific site sheet.
 * If sheet doesn't exist, creates it.
 * @param {string} siteName 
 * @param {object} expenseData 
 */
const appendToSheet = async (siteName, expenseData) => {
    try {
        const client = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth: client });

        // 1. Check if sheet (tab) exists for siteName
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
        });

        const sheetExists = spreadsheet.data.sheets.some(
            (s) => s.properties.title === siteName
        );

        // 2. Create sheet if not exists
        if (!sheetExists) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SHEET_ID,
                resource: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: siteName,
                                },
                            },
                        },
                    ],
                },
            });

            // Add Header Row
            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: `${siteName}!A1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [
                        [
                            'Date',
                            'Supervisor Name',
                            'Site Name',
                            'Material Name',
                            'Quantity',
                            'Price',
                            'Total Amount',
                            'Bill Number',
                            'Bill Name / Shop Name',
                            'Approved By',
                            'Approval Date'
                        ]
                    ]
                }
            });
        }

        // 3. Prepare Row Data
        const rowData = [
            // Date
            new Date(expenseData.date).toLocaleDateString(),
            // Supervisor Name
            expenseData.supervisor?.username || 'Unknown',
            // Site Name
            siteName,
            // Material Name
            expenseData.material_name,
            // Quantity
            expenseData.quantity,
            // Price
            expenseData.price_per_unit,
            // Total Amount
            expenseData.total_amount,
            // Bill Number
            expenseData.bill_number || '',
            // Bill Name
            expenseData.bill_name || '',
            // Approved By (Manager ID or Name if available context, for now 'Manager')
            'Manager',
            // Approval Date
            new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        ];

        // 4. Append Data
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${siteName}!A1`, // Google Sheets finds the first empty row
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [rowData],
            },
        });

        console.log(`Expense appended to sheet: ${siteName}`);
        return true;

    } catch (error) {
        console.error('Google Sheets Error:', error);
        throw error; // Propagate error to controller to handle user notification
    }
};

/**
 * Creates a new sheet (tab) for a site if it doesn't exist.
 * @param {string} siteName 
 */
const createSiteSheet = async (siteName) => {
    try {
        const client = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth: client });

        // 1. Check if sheet (tab) exists for siteName
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
        });

        const sheetExists = spreadsheet.data.sheets.some(
            (s) => s.properties.title === siteName
        );

        if (sheetExists) {
            console.log(`Sheet for ${siteName} already exists.`);
            return;
        }

        // 2. Create sheet
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: siteName,
                            },
                        },
                    },
                ],
            },
        });

        // 3. Add Header Row
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${siteName}!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [
                        'Date',
                        'Supervisor Name',
                        'Site Name',
                        'Material Name',
                        'Quantity',
                        'Price',
                        'Total Amount',
                        'Bill Number',
                        'Bill Name / Shop Name',
                        'Approved By',
                        'Approval Date'
                    ]
                ]
            }
        });

        console.log(`Created new sheet for site: ${siteName}`);
    } catch (error) {
        console.error('Error creating site sheet:', error);
        // Don't throw, just log. We don't want to break site creation if sheets fails.
    }
};

module.exports = {
    appendToSheet,
    createSiteSheet,
};
