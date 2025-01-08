// // pages/api/merge-pdfs.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { PDFDocument } from 'pdf-lib';
// import fetch from 'node-fetch';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     console.log('req.method:', req.method);
//   if (req.method === 'POST') {
//     try {
//       const { reportPdfUrl, attachmentUrls } = req.body;

//       // Fetch the report PDF
//       const reportPdfBytes = await fetch(reportPdfUrl).then(res => res.arrayBuffer());
//       const pdfDoc = await PDFDocument.load(reportPdfBytes);

//       // Fetch and merge each attachment PDF
//       for (const url of attachmentUrls) {
//         const attachmentBytes = await fetch(url).then(res => res.arrayBuffer());
//         const attachmentDoc = await PDFDocument.load(attachmentBytes);
//         const copiedPages = await pdfDoc.copyPages(attachmentDoc, attachmentDoc.getPageIndices());
//         copiedPages.forEach((page) => pdfDoc.addPage(page));
//       }

//       // Save the merged PDF
//       const pdfBytes = await pdfDoc.save();

//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', 'attachment; filename=merged_report.pdf');
//       res.send(Buffer.from(pdfBytes));
//     } catch (error) {
//       console.error('Error merging PDFs:', error);
//       res.status(500).json({ error: 'Failed to merge PDFs' });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fetch from 'node-fetch';

export async function POST(req: NextRequest) {
  try {
    const { reportPdfUrl, attachmentUrls } = await req.json();

    if (!reportPdfUrl || typeof reportPdfUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid reportPdfUrl' }, { status: 400 });
    }

    if (!Array.isArray(attachmentUrls) || attachmentUrls.some(url => typeof url !== 'string')) {
      return NextResponse.json({ error: 'Invalid attachmentUrls' }, { status: 400 });
    }

    // Fetch the report PDF
    const reportPdfBytes = await fetch(reportPdfUrl).then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch report PDF: ${res.status} ${res.statusText}`);
      }
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(reportPdfBytes);

    // Fetch and merge each attachment PDF
    for (const url of attachmentUrls) {
      const attachmentBytes = await fetch(url).then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch attachment: ${res.status} ${res.statusText}`);
        }
        return res.arrayBuffer();
      });
      const attachmentDoc = await PDFDocument.load(attachmentBytes);
      const copiedPages = await pdfDoc.copyPages(attachmentDoc, attachmentDoc.getPageIndices());
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    // Save the merged PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=merged_report.pdf',
      },
    });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    return NextResponse.json({ error: 'Failed to merge PDFs' }, { status: 500 });
  }
}
