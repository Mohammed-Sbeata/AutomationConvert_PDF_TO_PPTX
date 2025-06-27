const express = require('express');
const fs = require('fs');
const pdf = require('pdf-parse');
const pptxgen = require('pptxgenjs');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/process-pdf', async (req, res) => {
  const { pdfFilePath, pptxFilePath } = req.body;

  try {
    const questions = await extractQuestionsFromPDF(pdfFilePath);
    createPPTX(questions, pptxFilePath);
    res.status(200).json({ message: 'PowerPoint file created successfully.' });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred while processing the PDF.' });
  }
});

async function extractQuestionsFromPDF(pdfFilePath) {
  const pdfData = await fs.promises.readFile(pdfFilePath);
  const pdfResult = await pdf(pdfData);

  console.log(pdfResult.text);

  const questions = pdfResult.text.split(/\d+\./).filter(question => question.trim() !== '');
  return questions.map(question => question.trim());
}


function createPPTX(questions, outputPath) {
  const pptx = new pptxgen();

  questions.forEach((question, index) => {
    console.log(`Adding question ${index + 1}:\n${question}`);

    const slide = pptx.addSlide();
    slide.addText(`Question ${index + 1}`, { x: 1, y: 0.5, fontFace: 'Arial', fontSize: 20 });
    slide.addText(question, { x: 1, y: 1, fontFace: 'Arial', fontSize: 14, color: '000000' });
  });

  pptx.writeFile(outputPath);
}


app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
