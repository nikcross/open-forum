package org.onestonesoup.openforum.poi;

import java.io.OutputStream;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.onestonesoup.core.NameHelper;
import org.onestonesoup.openforum.plugin.SystemAPI;
import org.onestonesoup.openforum.transaction.Transaction;

public class POI extends SystemAPI {

	public class TestOutputStream extends java.io.OutputStream {

		int size=0;

		public TestOutputStream() {
			super();
		}

		public void write(int b) throws java.io.IOException { size++; }
	}

	public HSSFWorkbook getSpreadsheet() {
		return new HSSFWorkbook();
	}

	public void sendSpreadsheet(Transaction transaction,HSSFWorkbook spreadsheet) throws Exception {
		TestOutputStream testStream = new TestOutputStream();
		spreadsheet.write(testStream);
		transaction.sendFileResponseHeader("test6.xls",testStream.size);
		OutputStream oStream = transaction.getConnection().getOutputStream();
		spreadsheet.write(oStream);
		oStream.flush();
	}

	public void saveSpreadsheet(String pageName,String fileName,HSSFWorkbook spreadsheet) throws Exception {
		OutputStream oStream = getController().getFileManager().getAttachmentOutputStream(pageName, fileName, getController().getSystemLogin());
		spreadsheet.write(oStream);
		oStream.flush();
	}

	public HSSFWorkbook loadSpreadsheet(String pageName,String fileName) throws Exception {
		POIFSFileSystem fs = new POIFSFileSystem(
				getController().getFileManager().getAttachmentInputStream(pageName, fileName, getController().getSystemLogin())
		);
		HSSFWorkbook workbook = new HSSFWorkbook(fs);

		return workbook;
	}

	public HSSFFont getFont(HSSFWorkbook spreadsheet,String fontFace,boolean bold,boolean italic,boolean underline,short height) {
		HSSFFont font = spreadsheet.createFont();
		if(bold==true) {
			font.setBold(true);
		} else {
			font.setBold(false);
		}
		if(underline==true) {
			font.setUnderline(HSSFFont.U_SINGLE);
		} else {
			font.setUnderline(HSSFFont.U_NONE);
		}
		font.setFontName(fontFace);
		font.setItalic(italic);
		font.setFontHeightInPoints(height);
		return font;
	}

	public HSSFCellStyle getStyle(HSSFWorkbook spreadsheet,HSSFFont font,String align,String color) throws Exception {
		HSSFCellStyle style = spreadsheet.createCellStyle();
		style.setFont(font);
		align = align.toLowerCase();
		if(align.equals("center"))
		{
			style.setAlignment(HorizontalAlignment.CENTER);
		} else if( align.equals("left"))
		{
			style.setAlignment(HorizontalAlignment.LEFT);
		} else if( align.equals("right"))
		{
			style.setAlignment(HorizontalAlignment.RIGHT);
		}
		style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

		Class<?> colorClass = Class.forName("org.apache.poi.hssf.util.HSSFColor$"+NameHelper.dataToStaticName(color));
		style.setFillForegroundColor(((HSSFColor)colorClass.getDeclaredConstructor().newInstance()).getIndex());

		return style;
	}

	public void setCellFormula(HSSFCell cell,String formula) {
		cell.setCellType(CellType.FORMULA);
		cell.setCellFormula(formula);
	}
}
