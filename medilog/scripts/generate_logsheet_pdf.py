from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from datetime import datetime
import os


def build_pdf(output_path: str, author: str = "MediLog"):
	styles = getSampleStyleSheet()
	body = ParagraphStyle(
		name='BodySmall', parent=styles['BodyText'], fontSize=9, leading=12
	)
	head = ParagraphStyle(
		name='HeadSmall', parent=styles['BodyText'], fontSize=9, leading=12, textColor=colors.black
	)

	# Optional logo
	logo = None
	for candidate in [
		'/workspace/medilog/public/logo.png',
		'/workspace/medilog/public/favicon.png',
		'/workspace/medilog/favicon.png',
		'/workspace/medilog/favicon.ico',
	]:
		if os.path.exists(candidate):
			logo = candidate
			break

	doc = SimpleDocTemplate(
		output_path,
		pagesize=A4,
		leftMargin=0.6*inch,
		rightMargin=0.6*inch,
		topMargin=0.6*inch,
		bottomMargin=0.8*inch,
	)

	story = []
	if logo:
		try:
			story.append(Image(logo, width=0.9*inch, height=0.9*inch))
			story.append(Spacer(1, 0.15*inch))
		except Exception:
			pass

	story.append(Paragraph('<b>MediLog Logsheet (Continuation)</b>', styles['Title']))
	story.append(Paragraph('Project: MediLog', styles['Normal']))
	story.append(Paragraph('Note: Times and statuses reflect corrected entries as discussed.', styles['Normal']))
	story.append(Spacer(1, 0.15*inch))

	data = [
		[
			Paragraph('<b>Week</b>', head),
			Paragraph('<b>Activity Planned</b>', head),
			Paragraph('<b>Activity Done</b>', head),
			Paragraph('<b>Time Spent (hrs)</b>', head),
		],
		[
			Paragraph('Week 11 (13–19 July)', body),
			Paragraph('Implement dual calendar (AD/BS) and reminder scheduling', body),
			Paragraph(
				'Implemented reminders (CRUD, API, UI) with MongoDB; added BS conversion utilities in lib/calendar.ts. '
				'Set up client-side periodic checks for upcoming reminders and Browser Notification API. '
				'node-cron dependency added for future use, but not used in current codebase.',
				body,
			),
			Paragraph('10', body),
		],
		[
			Paragraph('Week 12–13 (20 July – 2 Aug)', body),
			Paragraph('File upload enhancements & AI integration', body),
			Paragraph(
				'Integrated react-dropzone for drag-and-drop (single-file upload). Implemented server-side text extraction for PDF (pdf-parse), '
				'DOCX (mammoth), TXT, and image OCR (tesseract.js). Attempted Python AI integration (blocked by env/deps); '
				"pivoted to Google Gemini and successfully integrated it to extract lab values, generate summaries, and suggest tags for 'Lab Reports' in the upload flow.",
				body,
			),
			Paragraph('20', body),
		],
		[
			Paragraph('Week 14 (3–9 Aug)', body),
			Paragraph('Document categorization + health insights', body),
			Paragraph(
				'Category selection (Lab Reports, Prescriptions, Imaging, Other). Advanced filtering/search (category, tags, date range, lab-only) wired to /api/documents. '
				'Implemented SVG trend charts and abnormal value alerts in components/HealthInsights.tsx.',
				body,
			),
			Paragraph('13', body),
		],
		[
			Paragraph('Week 15 (10–16 Aug)', body),
			Paragraph('User profile & language support', body),
			Paragraph(
				'Added user profile fields in schema (blood type, allergies, emergency contacts); UI integration partial. '
				'QR health summary planned but not fully implemented. English/Nepali labels added to key components and BS date display via lib/calendar.ts — implemented but pending full testing.',
				body,
			),
			Paragraph('12', body),
		],
		[
			Paragraph('Week 16 (17 Aug)', body),
			Paragraph('Final polish & testing', body),
			Paragraph(
				'Responsive UI refinements; improved error handling/logging; partial end-to-end testing; fixed critical bugs; prepared final report. '
				'Note: persistent audit logs are not implemented (console logs only).',
				body,
			),
			Paragraph('14', body),
		],
	]

	# Column widths (must fit within margins)
	col_widths = [1.7*inch, 2.0*inch, 3.5*inch, 0.8*inch]
	table = Table(data, colWidths=col_widths, repeatRows=1)
	table.setStyle(TableStyle([
		('BACKGROUND', (0,0), (-1,0), colors.HexColor('#D9EAF7')),
		('TEXTCOLOR', (0,0), (-1,0), colors.black),
		('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
		('ALIGN', (-1,1), (-1,-1), 'CENTER'),
		('VALIGN', (0,0), (-1,-1), 'TOP'),
		('GRID', (0,0), (-1,-1), 0.5, colors.grey),
		('LEFTPADDING', (0,0), (-1,-1), 6),
		('RIGHTPADDING', (0,0), (-1,-1), 6),
		('TOPPADDING', (0,0), (-1,-1), 4),
		('BOTTOMPADDING', (0,0), (-1,-1), 4),
	]))

	story.append(table)

	# Footer callback
	def footer_callback(canvas: canvas.Canvas, doc):
		canvas.setFont('Helvetica', 8)
		text = f"{author} • Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}"
		w = canvas.stringWidth(text, 'Helvetica', 8)
		canvas.drawString((A4[0] - w) - doc.rightMargin, doc.bottomMargin - 12, text)

	doc.build(story, onFirstPage=footer_callback, onLaterPages=footer_callback)


if __name__ == '__main__':
	output_pdf = '/workspace/medilog/MediLog_Logsheet_Continuation.pdf'
	author = os.environ.get('MEDILOG_AUTHOR', 'MediLog')
	build_pdf(output_pdf, author)
	print(f'PDF generated at: {output_pdf}')