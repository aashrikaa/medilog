from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH


def add_heading(document: Document, text: str):
	heading = document.add_heading(text, level=1)
	heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
	return heading


def add_subtitle(document: Document, text: str):
	p = document.add_paragraph()
	r = p.add_run(text)
	r.font.size = Pt(11)
	return p


def set_header_row_style(row):
	for cell in row.cells:
		for paragraph in cell.paragraphs:
			if paragraph.runs:
				for run in paragraph.runs:
					run.font.bold = True
			else:
				r = paragraph.add_run()
				r.font.bold = True


def set_column_widths(table):
	# Use fixed widths to enforce tabular layout (approx 6.5" total page width)
	try:
		table.autofit = False
	except Exception:
		pass
	col_widths = [Inches(1.5), Inches(1.8), Inches(2.7), Inches(0.5)]
	for idx, width in enumerate(col_widths):
		for cell in table.columns[idx].cells:
			cell.width = width


def build_table(document: Document):
	# Create table with header
	table = document.add_table(rows=1, cols=4)
	table.style = 'Table Grid'
	hdr_cells = table.rows[0].cells
	hdr_cells[0].text = 'Week'
	hdr_cells[1].text = 'Activity Planned'
	hdr_cells[2].text = 'Activity Done'
	hdr_cells[3].text = 'Time Spent (hrs)'
	set_header_row_style(table.rows[0])

	rows = [
		(
			"Week 11 (13–19 July)",
			"Implement dual calendar (AD/BS) and reminder scheduling",
			"Implemented reminders (CRUD, API, UI) with MongoDB; added BS conversion utilities in lib/calendar.ts. "
			"Set up client-side periodic checks for upcoming reminders and Browser Notification API. "
			"node-cron dependency added for future use, but not used in current codebase.",
			"10",
		),
		(
			"Week 12–13 (20 July – 2 Aug)",
			"File upload enhancements & AI integration",
			"Integrated react-dropzone for drag-and-drop (single-file upload). Implemented server-side text extraction for PDF (pdf-parse), "
			"DOCX (mammoth), TXT, and image OCR (tesseract.js). Attempted Python AI integration (blocked by env/deps); "
			"pivoted to Google Gemini and successfully integrated it to extract lab values, generate summaries, and suggest tags for 'Lab Reports' in the upload flow.",
			"20",
		),
		(
			"Week 14 (3–9 Aug)",
			"Document categorization + health insights",
			"Category selection (Lab Reports, Prescriptions, Imaging, Other). Advanced filtering/search (category, tags, date range, lab-only) wired to /api/documents. "
			"Implemented SVG trend charts and abnormal value alerts in components/HealthInsights.tsx.",
			"13",
		),
		(
			"Week 15 (10–16 Aug)",
			"User profile & language support",
			"Added user profile fields in schema (blood type, allergies, emergency contacts); UI integration partial. "
			"QR health summary planned but not fully implemented. English/Nepali labels added to key components and BS date display via lib/calendar.ts — implemented but pending full testing.",
			"12",
		),
		(
			"Week 16 (17 Aug)",
			"Final polish & testing",
			"Responsive UI refinements; improved error handling/logging; partial end-to-end testing; fixed critical bugs; prepared final report. "
			"Note: persistent audit logs are not implemented (console logs only).",
			"14",
		),
	]

	for week, planned, done, hours in rows:
		row_cells = table.add_row().cells
		row_cells[0].text = week
		row_cells[1].text = planned
		row_cells[2].text = done
		row_cells[3].text = hours
		# Align hours center for readability
		for p in row_cells[3].paragraphs:
			p.alignment = WD_ALIGN_PARAGRAPH.CENTER

	set_column_widths(table)
	return table


def main():
	document = Document()
	add_heading(document, 'MediLog Logsheet (Continuation)')
	add_subtitle(document, 'Project: MediLog')
	add_subtitle(document, 'Note: Times and statuses reflect corrected entries as discussed.')
	document.add_paragraph()
	build_table(document)

	output_path = '/workspace/medilog/MediLog_Logsheet_Continuation.docx'
	document.save(output_path)
	print(f'DOCX generated at: {output_path}')


if __name__ == '__main__':
	main()