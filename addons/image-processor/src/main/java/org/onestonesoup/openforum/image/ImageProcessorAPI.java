package org.onestonesoup.openforum.image;

import org.onestonesoup.core.ImageHelper;
import org.onestonesoup.openforum.plugin.SystemAPI;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.ByteBuffer;

public class ImageProcessorAPI extends SystemAPI {

    public BufferedImage getImage(String pageName, String fileName) throws Exception {
        InputStream iStream = getController()
                .getFileManager()
                .getAttachmentInputStream(
                        pageName,
                        fileName,
                        getController().getSystemLogin()
                );

        BufferedImage image = ImageIO.read(iStream);
        return image;
    }

    public Image clipImage(BufferedImage image,int x, int y, int w, int h) {
        return ImageHelper.clipImage(image,x,y,w,h);
    }

    public void savePNGImage(String pageName, String fileName, BufferedImage image) throws Exception {
        ImageIO.write(image, "PNG", getOutputStream(pageName,fileName));
    }

    public void saveBMPImage(String pageName, String fileName, BufferedImage image) throws Exception {
        ImageIO.write(image, "BMP", getOutputStream(pageName,fileName));
    }

    public void saveICOImage(String pageName, String fileName, BufferedImage image) throws Exception {
        ByteArrayOutputStream img = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", img);
        ByteArrayOutputStream head = new ByteArrayOutputStream();
        head.write(new byte[]{0, 0, 1, 0, 1, 0});
        head.write(new byte[]{(byte)image.getWidth(), (byte)image.getHeight(), 0, 0, 0, 0, 0, 0});
        head.write(ByteBuffer.allocate(4).putInt(img.size()).array());
        head.write(ByteBuffer.allocate(4).putInt(head.size() + 4).array());
        OutputStream out = getOutputStream(pageName,fileName);
        out.write(head.toByteArray());
        out.write(img.toByteArray());
        out.flush();
        out.close();
    }

    public void saveJPEGImage(String pageName, String fileName, BufferedImage image) throws Exception {
        ImageIO.write(image, "JPG", getOutputStream(pageName,fileName));
    }

    private OutputStream getOutputStream(String pageName, String fileName) throws Exception {
        return getController().getFileManager().getAttachmentOutputStream(
                pageName,fileName,
                getController().getSystemLogin());
    }

    public Image makeColorTransparent(Image image, Color color) {
        return ImageHelper.makeColorTransparent(image, color);
    }

    public Color getColorAt(Image image, int x, int y) {
        return ImageHelper.getColorAt(image, x, y);
    }

    public Image resizeImage(BufferedImage source, int width, int height, boolean maintainAspectRatio) throws IOException {
        return ImageHelper.resizeImage(source, width, height, maintainAspectRatio);
    }

    public Dimension getImageBoundedSizeMaintainingAspectRatio(Image image, int maxWidth, int maxHeight) {
        return ImageHelper.getImageBoundedSizeMaintainingAspectRatio(image, maxWidth, maxHeight);
    }

    public BufferedImage convertToBufferedImage(Image image) {
        return ImageHelper.convertToBufferedImage(image);
    }
}
