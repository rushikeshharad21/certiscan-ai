const extractField = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const parseTC = (text) => {
  return {
    name: extractField(text, [
      /Name of Pupil\s*[i:]\s*(.+)/i,
    ]),
    fatherName: extractField(text, [
      /Father'?s?\s*\/?\s*Guardians?\s*Name\s*[iE:]\s*(.+)/i,
    ]),
    motherName: extractField(text, [
      /Mother'?s?\s*Name\s*[i3:]\s*(.+)/i,
    ]),
    dateOfBirth: extractField(text, [
      /Date of Birth\s*\(in figures\)\s*(.+)/i,
    ]),
    nationality: extractField(text, [
      /Nationality\s*[i:]\s*(.+)/i,
    ]),
    category: extractField(text, [
      /SC\s*\/\s*ST\s*\/\s*OBC\s*\/\s*General\s+(.+)/i,
    ]),
    dateOfFirstAdmission: extractField(text, [
      /Date of first admission in the School\s*[©:]\s*(.+)/i,
    ]),
        lastClassStudied: extractField(text, [
      /\(in words\)\s*\n?\s*(.+)/i,
    ]),
    examResult: extractField(text, [
      /Annual Examination last taken with result\s*[©:]\s*(.+)/i,
    ]),
    subjectsStudied: extractField(text, [
      /Subjects Studied\s*[©:]\s*(.+)/i,
    ]),
    dateOfIssue: extractField(text, [
      /Date of issue of certificate\s*[©:]\s*(.+)/i,
    ]),
  };
};

const parseMarksheet = (text) => {
  return {
    studentName: extractField(text, [
      /(?:Name of )?the Student\s*[:\-]?\s*([A-Za-z\s]+?)\s*=/i,
      /Student'?s?\s*Name\s*[:\-]?\s*(.+)/i,
    ]),
    fatherName: extractField(text, [
      /=\s*Name\s*[:\-]?\s*([A-Za-z\s]+?)\n/i,
    ]),
    motherName: extractField(text, [
      /Mother'?s?\s*Name\s*[©:\-]?\s*([A-Za-z\s]+?)\s*Date of Birth/i,
    ]),
    dateOfBirth: extractField(text, [
      /Date of Birth\s*[©:\-]?\s*(.+)/i,
    ]),
    prn: extractField(text, [
      /(?:PRN|Permanent Registration No\.?\s*\(PRN\))\s*[:\-]?\s*(\d+)/i,
    ]),
    seatNumber: extractField(text, [
      /Seat\s*(?:No\.?|Number)\s*[:\-]?\s*(.+)/i,
    ]),
        college: extractField(text, [
      /College\s*\/?\s*School\s*[:\-]?\s*([^\n]+?)\s*,?\s*Gender/i,
      /College\s*\/?\s*School\s*[:\-]?\s*([^\n]+)/i,
    ]),
    programme: extractField(text, [
      /Programme\s*[^\w]*?\s*(B\.?Sc\.?.+|B\.?E\.?.+|B\.?Tech\.?.+|M\.?Sc\.?.+)/i,
    ]),
    percentage: extractField(text, [
      /\d+\s+\d+\.\d+\s+\d+\.\d+\s+(\d+\.\d+)\s*\|\s*PASS/i,
    ]),
    cgpa: extractField(text, [
      /\d+\s+\d+\.\d+\s+(\d+\.\d+)\s+\d+\.\d+\s*\|\s*PASS/i,
    ]),
    finalResult: extractField(text, [
      /\|\s*PASS\s+([A-Z\s]+CLASS[A-Z\s]*)\s*\|/i,
    ]),
  };
};

const parseCasteCertificate = (text) => {
  return {
    name: extractField(text, [
      /Name\s*(?:of\s*(?:the\s*)?(?:Applicant|Candidate))?\s*[:\-]?\s*(.+)/i,
    ]),
    fatherName: extractField(text, [
      /Father'?s?\s*Name\s*[:\-]?\s*(.+)/i,
    ]),
    caste: extractField(text, [
      /Caste\s*[:\-]?\s*(.+)/i,
    ]),
    subCaste: extractField(text, [
      /Sub[\s\-]?Caste\s*[:\-]?\s*(.+)/i,
    ]),
    category: extractField(text, [
      /Category\s*[:\-]?\s*(SC|ST|OBC|NT|VJ|SBC|General)/i,
    ]),
    certificateNumber: extractField(text, [
      /Certificate\s*(?:No\.?|Number)\s*[:\-]?\s*(.+)/i,
    ]),
    dateOfIssue: extractField(text, [
      /Date\s*of\s*Issue\s*[:\-]?\s*(.+)/i,
    ]),
    issuingAuthority: extractField(text, [
      /(?:Issuing\s*Authority|Issued\s*By)\s*[:\-]?\s*(.+)/i,
    ]),
    taluka: extractField(text, [
      /Taluka\s*[:\-]?\s*(.+)/i,
    ]),
    district: extractField(text, [
      /District\s*[:\-]?\s*(.+)/i,
    ]),
  };
};

const parseAadhaar = (text) => {
  return {
    name: extractField(text, [
      /Name\s*[:\-]?\s*(.+)/i,
    ]),
    dateOfBirth: extractField(text, [
      /DOB\s*[:\-]?\s*.*?(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
      /Date of Birth\s*[:\-]?\s*.*?(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    ]),
    gender: extractField(text, [
      /\b(Male|Female|Transgender)\b/i,
    ]),
    aadhaarNumber: extractField(text, [
      /(\d{4}\s?\d{4}\s?\d{4})/,
    ]),
    address: extractField(text, [
      /Address\s*[:\-]?\s*(.+)/i,
    ]),
  };
};

const parseOcrData = (documentType, text) => {
  if (!text) return null;

  switch (documentType) {
    case 'tc':
      return parseTC(text);
         case 'marksheet':
      return parseMarksheet(text);
         case 'casteCertificate':
      return parseCasteCertificate(text);
    case 'aadhaar':
      return parseAadhaar(text);
    default:
      return null;
  }
};

export { parseOcrData };