import React from "react";
import ReactDOMServer from "react-dom/server";
import { pdf } from "@react-pdf/renderer";
import { PDFRenderer } from "@/components/resume/ResumePDF";
import ResumeTemplateRenderer from "@/components/resume/ResumeTemplateRenderer";

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string;
  }>;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  achievements: string[];
  languages: Array<{
    id: string;
    language: string;
    proficiency: string;
  }>;
}

/**
 * Generate PDF using @react-pdf/renderer with proper error handling
 */
export const generatePDF = async (data: ResumeData, template: string) => {
  try {
    console.log("Generating PDF for template:", template);
    
    // Create the PDF document instance
    const pdfInstance = pdf(React.createElement(PDFRenderer, { template, data }));
    
    // Generate the PDF blob with error handling
    let blob;
    try {
      blob = await pdfInstance.toBlob();
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      // Retry once if it fails
      console.log("Retrying PDF generation...");
      const retryInstance = pdf(React.createElement(PDFRenderer, { template, data }));
      blob = await retryInstance.toBlob();
    }
    
    if (!blob || blob.size === 0) {
      throw new Error("Generated PDF is empty");
    }
    
    console.log("PDF generated successfully, size:", blob.size);
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.personal.fullName || 'resume'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 1000);
    
  } catch (error) {
    console.error("PDF generation error:", error);
    // Show user-friendly error
    throw new Error("Failed to generate PDF. Please try again.");
  }
};

/**
 * Generate DOCX by rendering React component to HTML
 * This approach works in the browser without Node.js dependencies
 */
export const generateDOCX = async (data: ResumeData, template: string) => {
  try {
    console.log("Generating DOCX for template:", template);
    
    // Render the React component to HTML string
    const htmlString = ReactDOMServer.renderToString(
      React.createElement(ResumeTemplateRenderer, { template, data })
    );

    // Get the template-specific styles
    const getTemplateStyles = () => {
      if (template === 'modern') {
        return `
          .resume-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 794px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .header {
            background: #4f46e5;
            padding: 20px;
            margin: -40px -40px 20px -40px;
          }
          .name {
            font-size: 26px;
            font-weight: bold;
            color: white;
            margin-bottom: 4px;
          }
          .contact {
            font-size: 10px;
            color: #e0e0e0;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #4f46e5;
            margin-top: 12px;
            margin-bottom: 6px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 4px;
          }
          .text {
            font-size: 10px;
            margin-bottom: 4px;
            line-height: 1.4;
            color: #333;
          }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
          .small { font-size: 9px; color: #666; }
          .section { margin-bottom: 8px; }
          .skill-badge {
            font-size: 9px;
            background: #eef2ff;
            color: #4f46e5;
            padding: 4px 10px;
            margin-right: 4px;
            margin-bottom: 4px;
            border-radius: 4px;
            display: inline-block;
          }
        `;
      } else if (template === 'creative') {
        return `
          .resume-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 794px;
            margin: 0 auto;
            background: white;
          }
          .header {
            background: #ec4899;
            padding: 30px;
          }
          .name {
            font-size: 28px;
            font-weight: bold;
            color: white;
            margin-bottom: 4px;
          }
          .contact {
            font-size: 10px;
            color: #fce7f3;
          }
          .content { padding: 30px; }
          .row { display: flex; gap: 20px; }
          .left-column { flex: 1; }
          .right-column { flex: 2; }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #ec4899;
            margin-bottom: 6px;
            border-bottom: 2px solid #fbcfe8;
            padding-bottom: 4px;
          }
          .text {
            font-size: 10px;
            margin-bottom: 4px;
            line-height: 1.4;
            color: #333;
          }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
          .small { font-size: 9px; color: #666; }
          .section { margin-bottom: 8px; }
          .skill-badge {
            font-size: 9px;
            background: #fce7f3;
            color: #be185d;
            padding: 4px 10px;
            margin-right: 4px;
            margin-bottom: 4px;
            border-radius: 20px;
            display: inline-block;
          }
        `;
      } else {
        // ATS - default
        return `
          .resume-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 794px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .contact {
            font-size: 10px;
            color: #444;
            margin-bottom: 12px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 12px;
            margin-bottom: 6px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
          }
          .text {
            font-size: 10px;
            margin-bottom: 4px;
            line-height: 1.4;
          }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
          .small { font-size: 9px; color: #555; }
          .section { margin-bottom: 8px; }
          .skill-badge {
            font-size: 9px;
            background: #f0f0f0;
            padding: 4px 8px;
            margin-right: 4px;
            margin-bottom: 4px;
            display: inline-block;
          }
        `;
      }
    };

    // Create a complete HTML document with Word-compatible headers
    const docxHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            /* Page setup */
            @page {
              size: 8.5in 11in;
              margin: 0.5in;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              margin: 0;
              padding: 0;
            }
            
            /* Reset styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            /* Template-specific styles */
            ${getTemplateStyles()}
            
            /* Additional styles to match PDF rendering */
            .flex { display: flex; }
            .flex-wrap { flex-wrap: wrap; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .gap-2 { gap: 8px; }
            .gap-4 { gap: 16px; }
            .gap-8 { gap: 32px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .p-4 { padding: 16px; }
            .p-6 { padding: 24px; }
            .border { border: 1px solid #e5e7eb; }
            .rounded { border-radius: 4px; }
            .rounded-lg { border-radius: 8px; }
            
            /* Grid styles */
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
            .col-span-2 { grid-column: span 2; }
            
            /* Text utilities */
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-white { color: white; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-900 { color: #111827; }
            .text-indigo-600 { color: #4f46e5; }
            .text-pink-600 { color: #ec4899; }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${htmlString}
          </div>
        </body>
      </html>
    `;

    // Create a blob with Word MIME type
    const blob = new Blob([docxHtml], {
      type: 'application/msword'
    });

    // Download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.personal.fullName || 'resume'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 1000);
    
    console.log("DOCX generated successfully");
    
  } catch (error) {
    console.error("DOCX generation error:", error);
    throw new Error("Failed to generate DOCX. Please try again.");
  }
};