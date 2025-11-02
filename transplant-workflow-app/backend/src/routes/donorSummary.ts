import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';
import multer from 'multer';
import path from 'path';
import pdfParse from 'pdf-parse';
import fs from 'fs';

const router = Router();

router.use(requireAuth, loadUser);

// Configure file upload for PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'donor-summary-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
});

// Upload and parse donor summary PDF
router.post('/upload', upload.single('file'), requirePermission('upload:donor-summary'), asyncHandler(async (req, res) => {
  const { donorCaseId, matchId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const filePath = req.file.path;

  try {
    // Parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // Extract metadata (basic example - customize based on your PDF format)
    const parsedMetadata = extractDonorMetadata(pdfData.text);

    // Create donor summary record
    const summary = await prisma.donorSummary.create({
      data: {
        donorCaseId,
        matchId,
        fileName: req.file.originalname,
        fileUrl,
        parsedMetadata,
        organHighlights: extractOrganHighlights(parsedMetadata),
        uploadedBy: req.user!.id,
      },
    });

    await createAuditLog(req.user!.id, 'CREATE', 'DonorSummary', summary.id, null, req);

    res.status(201).json({ summary });
  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
}));

// Get donor summaries by case
router.get('/case/:donorCaseId', requirePermission('view:donor-summary'), asyncHandler(async (req, res) => {
  const { donorCaseId } = req.params;

  const summaries = await prisma.donorSummary.findMany({
    where: { donorCaseId },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json({ summaries });
}));

// Get single donor summary
router.get('/:id', requirePermission('view:donor-summary'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const summary = await prisma.donorSummary.findUnique({
    where: { id },
    include: {
      donorCase: true,
    },
  });

  if (!summary) {
    return res.status(404).json({ error: 'Donor summary not found' });
  }

  await createAuditLog(req.user!.id, 'VIEW', 'DonorSummary', id, null, req);

  res.json({ summary });
}));

// Helper function to extract donor metadata from PDF text
function extractDonorMetadata(text: string): any {
  const metadata: any = {};

  // Example patterns - customize based on your PDF format
  const patterns = {
    donorId: /Donor\s*ID[:\s]*([A-Z0-9]+)/i,
    age: /Age[:\s]*(\d+)/i,
    bloodType: /Blood\s*Type[:\s]*([ABO]+[\+\-]?)/i,
    weight: /Weight[:\s]*(\d+\.?\d*)\s*(kg|lbs?)/i,
    height: /Height[:\s]*(\d+\.?\d*)\s*(cm|in)/i,
    causeOfDeath: /Cause\s*of\s*Death[:\s]*([^\n]+)/i,
    hospital: /Hospital[:\s]*([^\n]+)/i,
    opo: /OPO[:\s]*([^\n]+)/i,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      metadata[key] = match[1].trim();
    }
  }

  // Store full text for search
  metadata.fullText = text;

  return metadata;
}

// Helper function to extract organ-specific highlights
function extractOrganHighlights(metadata: any): any {
  const highlights: any = {};

  // Extract organ-specific data (customize based on your needs)
  const organs = ['heart', 'lung', 'liver', 'kidney', 'pancreas'];

  for (const organ of organs) {
    const organData: any = {};

    // Look for organ-specific measurements in fullText
    const text = metadata.fullText || '';

    // Example: Extract organ sizes, function tests, etc.
    if (organ === 'heart') {
      const efMatch = text.match(/EF[:\s]*(\d+)%/i);
      if (efMatch) organData.ejectionFraction = efMatch[1];
    }

    if (organ === 'liver') {
      const astMatch = text.match(/AST[:\s]*(\d+)/i);
      const altMatch = text.match(/ALT[:\s]*(\d+)/i);
      if (astMatch) organData.ast = astMatch[1];
      if (altMatch) organData.alt = altMatch[1];
    }

    if (organ === 'kidney') {
      const crMatch = text.match(/Creatinine[:\s]*(\d+\.?\d*)/i);
      if (crMatch) organData.creatinine = crMatch[1];
    }

    if (Object.keys(organData).length > 0) {
      highlights[organ] = organData;
    }
  }

  return highlights;
}

export default router;
