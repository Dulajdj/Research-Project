"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Download, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Loader2, ArrowLeft } from "lucide-react";
import { getCoverLetter, saveCoverLetter } from "../../../../../actions/cover-letter";
import { toast } from "sonner";

export default function EditCoverLetterPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [letterData, setLetterData] = useState(null);
  const [contentHtml, setContentHtml] = useState("");
  
  const editorRef = useRef(null);

  // 1. Data Load
  useEffect(() => {
    async function fetchLetter() {
      const resolvedParams = await params; 
      const id = resolvedParams?.id;

      if (!id) return;

      try {
        const data = await getCoverLetter(id);
        if (data) {
          setLetterData(data);
          
          

          setContentHtml(data.content);
          
          if (editorRef.current) {
            editorRef.current.innerHTML = data.content;
          }
        } else {
          alert("Cover letter not found!");
          router.push("/resume-builder/cover-letter");
        }
      } catch (err) {
        console.error("Failed to load letter", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLetter();
  }, [params, router]);

  // 2. Formatting Function
  const formatDoc = (cmd) => {
    document.execCommand(cmd, false, null);
    if (editorRef.current) {
        editorRef.current.focus();
    }
  };

  // 3. Save Function
  const handleSave = async () => {
    if (!letterData || !editorRef.current) return;
    
    const currentContent = editorRef.current.innerHTML;
    setSaving(true);

    try {
      const result = await saveCoverLetter(letterData.id, currentContent);
      
      if (result.success) {
        alert("Saved Successfully!");
        router.push("/resume-builder/cover-letter"); 
      } else {
        alert("Save failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // 4. ✅ FIXED DOWNLOAD FUNCTION (Solves "oklch" error)
  const downloadPDF = async () => {
  setIsGenerating(true);

  try {
    const element = document.getElementById('resume-pdf-content');
    if (!element) {
      toast.error('Preview not ready!');
      return;
    }

    // Dynamic imports
    const html2canvas = (await import('html2canvas-pro')).default;
    const { jsPDF } = await import('jspdf');

    // Capture settings
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: '#ffffff', // Force white background
      logging: false,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
      
      // *** THE FIX: Modify the cloned element specifically for the PDF ***
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('resume-pdf-content');
        if (clonedElement) {
            // Apply the safe-color class specifically for generation
            clonedElement.classList.add('html2canvas-container');
            
            // Optional: Ensure all text is visible (force colors if needed)
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                // If opacity is causing issues, reset it
                if (style.opacity === '0') {
                    el.style.opacity = '1'; 
                }
            });
        }
      }
    });

    // PDF Generation (Perfect A4 Logic)
    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate ratio to fit width exactly
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    let positionY = 0;
    let heightLeft = scaledHeight;

    // First Page
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;

    // Additional Pages (if content is longer than one A4)
    while (heightLeft > 0) {
      positionY -= pdfHeight; // Move the image up for the next page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, positionY, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }

    const fileName = formData?.personalInfo?.fullName 
      ? `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf` 
      : 'My_Resume_A4.pdf';

    pdf.save(fileName);
    toast.success('PDF downloaded — Perfect A4 size!');

  } catch (err) {
    console.error('PDF Generation Error:', err);
    toast.error('Failed to generate PDF. Please try again.');
  } finally {
    setIsGenerating(false);
  }
};

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#2e0249]"><Loader2 className="animate-spin text-white"/></div>;
  if (!letterData) return null;

  const handleDownloadPDF = async () => {
    // 1. Loading state 
    // setIsGenerating(true); 

    try {
      
      const element = document.getElementById('cover-letter-content'); 
      
      if (!element) {
        toast.error('Preview not ready!');
        return;
      }

      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        
        
        onclone: (clonedDoc) => {
          
          const clonedElement = clonedDoc.getElementById('cover-letter-content');
          if (clonedElement) {
              clonedElement.classList.add('html2canvas-container');
              
              const allElements = clonedElement.querySelectorAll('*');
              allElements.forEach(el => {
                  const style = window.getComputedStyle(el);
                  if (style.opacity === '0') {
                      el.style.opacity = '1'; 
                  }
              });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let positionY = 0;
      let heightLeft = scaledHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        positionY -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, positionY, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }

      
      pdf.save('Cover_Letter.pdf');
      // toast.success('Cover letter downloaded!');

    } catch (err) {
      console.error(err);
      // toast.error('Download failed');
    } finally {
      // setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      
      {/* --- Title Area --- */}
      <div className="max-w-5xl mx-auto mb-6 text-center relative">
        <button 
            onClick={() => router.back()}
            className="absolute left-0 top-1 text-white/70 hover:text-white flex items-center gap-2"
        >
            <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-bold text-white">
          {letterData.jobTitle} at {letterData.companyName}
        </h1>
      </div>

      {/* --- Editor Container --- */}
      <div className="max-w-4xl mx-auto bg-white rounded-t-xl rounded-b-xl shadow-2xl overflow-hidden">
        
        {/* --- Toolbar Area --- */}
        <div className="bg-[#d946ef] p-3 flex flex-col md:flex-row justify-between items-center gap-3">
            
            {/* Formatting Buttons */}
            <div className="flex gap-2 bg-white/20 p-1 rounded-lg backdrop-blur-sm">
                <button onClick={() => formatDoc('bold')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Bold"><Bold size={18} /></button>
                <button onClick={() => formatDoc('italic')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Italic"><Italic size={18} /></button>
                <button onClick={() => formatDoc('underline')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Underline"><Underline size={18} /></button>
                <div className="w-[1px] bg-white/30 mx-1"></div>
                <button onClick={() => formatDoc('justifyLeft')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Align Left"><AlignLeft size={18} /></button>
                <button onClick={() => formatDoc('justifyCenter')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Align Center"><AlignCenter size={18} /></button>
                <button onClick={() => formatDoc('justifyRight')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Align Right"><AlignRight size={18} /></button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-bold shadow-md transition border border-white/20"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Download PDF</span>
                </button>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-purple-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-70"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>

        {/* --- Editable Paper Area --- */}
        {/* ✅ I added the class 'pdf-content-area' here so our script can find it */}
        <div 
            id="cover-letter-content"
            className="p-12 min-h-[800px] cursor-text pdf-content-area" 
            style={{ backgroundColor: '#ffffff' }}
        >
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning={true}
                className="outline-none text-[16px] leading-relaxed font-serif whitespace-pre-wrap"
                style={{ minHeight: '600px', color: '#000000' }}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
        </div>

      </div>
    </div>
  );
}