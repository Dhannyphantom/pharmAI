export const BILLING_RECORDS = [
  { id: "NHIS-4021", patient: "O. Adisa", drug: "Amoxicillin 500mg", prescribedQty: 21, billedQty: 21, unitCost: 45, receiptNo: "RCT-88213", status: "Match" },
  { id: "NHIS-4022", patient: "F. Okonkwo", drug: "Metformin 500mg", prescribedQty: 60, billedQty: 60, unitCost: 20, receiptNo: "RCT-88214", status: "Match" },
  { id: "NHIS-4023", patient: "B. Yusuf", drug: "Amlodipine 5mg", prescribedQty: 30, billedQty: 45, unitCost: 35, receiptNo: "RCT-88215", status: "Mismatch" },
  { id: "NHIS-4024", patient: "C. Nwosu", drug: "Ceftriaxone 1g Vial", prescribedQty: 6, billedQty: 6, unitCost: 1800, receiptNo: "—", status: "Pending Payment" },
  { id: "NHIS-4025", patient: "A. Bello", drug: "Warfarin 5mg", prescribedQty: 28, billedQty: 20, unitCost: 30, receiptNo: "RCT-88217", status: "Mismatch" },
  { id: "NHIS-4026", patient: "D. Eze", drug: "Salbutamol Inhaler", prescribedQty: 1, billedQty: 1, unitCost: 1200, receiptNo: "RCT-88218", status: "Match" },
];

export const ERROR_LOG = [
  { id: "ERR-901", type: "Dose Error", description: "Metformin 2000mg prescribed as single dose instead of divided doses", drug: "Metformin", severity: "Moderate", time: "42 min ago" },
  { id: "ERR-902", type: "Missing Frequency", description: "Amoxicillin prescription missing dosing frequency", drug: "Amoxicillin", severity: "Low", time: "1 hr ago" },
  { id: "ERR-903", type: "Allergy Conflict", description: "Ceftriaxone prescribed for patient with documented cephalosporin allergy", drug: "Ceftriaxone", severity: "High", time: "2 hrs ago" },
  { id: "ERR-904", type: "Duplicate Therapy", description: "Two PPIs prescribed concurrently — omeprazole and esomeprazole", drug: "Omeprazole / Esomeprazole", severity: "Moderate", time: "3 hrs ago" },
  { id: "ERR-905", type: "Quantity Mismatch", description: "Billed quantity exceeds prescribed quantity by 15 units", drug: "Amlodipine", severity: "Moderate", time: "4 hrs ago" },
];

export const QUEUE_DATA = [
  { hour: "08:00", patients: 12 },
  { hour: "09:00", patients: 22 },
  { hour: "10:00", patients: 34 },
  { hour: "11:00", patients: 41 },
  { hour: "12:00", patients: 38 },
  { hour: "13:00", patients: 25 },
  { hour: "14:00", patients: 30 },
  { hour: "15:00", patients: 27 },
  { hour: "16:00", patients: 18 },
];

export function getPeakHour() {
  return QUEUE_DATA.reduce((max, d) => (d.patients > max.patients ? d : max), QUEUE_DATA[0]);
}
