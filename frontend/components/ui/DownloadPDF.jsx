import jsPDF from "jspdf";

export default function DownloadPDF({ result }) {

  const download = () => {
    const doc = new jsPDF();

    doc.text("Interview Report", 20, 20);
    doc.text(`Score: ${result.score}/10`, 20, 40);
    doc.text(`Strengths: ${result.strengths}`, 20, 60);
    doc.text(`Weaknesses: ${result.weaknesses}`, 20, 80);
    doc.text(`Suggestions: ${result.suggestions}`, 20, 100);

    doc.save("Interview_Report.pdf");
  };

  return (
    <button
      onClick={download}
      className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
    >
      Download PDF
    </button>
  );
}