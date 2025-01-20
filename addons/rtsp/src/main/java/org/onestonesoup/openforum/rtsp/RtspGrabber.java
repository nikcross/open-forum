package org.onestonesoup.openforum.rtsp;

import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.FrameGrabber;
import org.bytedeco.javacv.Java2DFrameConverter;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class RtspGrabber {

    private FFmpegFrameGrabber grabber;
    private String rtsp;
    private String user = null;
    private String password = null;
    private String ipAddress = null;

    public static void main(String[] args) throws Exception {
        new RtspGrabber().createGrabber("admin007", "01264738020", "192.168.1.15")
                .getImage(
                        "/home/nik/os-git/open-forum/addons/rtsp/output/",
                "test-frame"
                );
    }

    public static RtspGrabber createGrabber(String user, String password, String ipAddress) {
        return new RtspGrabber(user, password, ipAddress);
    }

    public RtspGrabber() {};

    private RtspGrabber(String user, String password, String ipAddress) {
        this.user = user;
        this.password = password;
        this.ipAddress = ipAddress;
    }
    public void getImage(String pathName, String fileName) throws Exception {
        rtsp = "rtsp:" + user + ":" + password + "@" +ipAddress+ "/stream2";


        System.out.println("Creating FFmpegFrameGrabber for " + rtsp);

        grabber = FFmpegFrameGrabber.createDefault(rtsp);
        grabber.setOption("rtsp_transport", "tcp"); //tcp Way to connect
        grabber.setFrameRate(10); // Set frame rate
        grabber.setImageWidth(740); // Set the width of the acquired video
        grabber.setImageHeight(480); // Set the acquired video to be highly toxic
        grabber.setVideoBitrate(2000000); // Set video bit rate
        Java2DFrameConverter java2DFrameConverter = new Java2DFrameConverter();

            try {

                if (grabber != null) {

                    //System.out.println(" Grabber starting ");
                    grabber.start();
                    //System.out.println(" Grabber started ");
                }
                if (grabber != null) {

                    Frame frame = grabber.grabImage();
                    if (null == frame) {
                        throw new IOException( "FFmpegFrameGrabber null frame" );
                    }

                    //System.out.println("frame streaming");
                    BufferedImage bufferedImage = java2DFrameConverter.getBufferedImage(frame);

                    //System.out.println("frame streaming finished");
                    File file = new File( pathName + fileName + "." + "jpg");
                    ImageIO.write(bufferedImage, "jpg", file);
                    bufferedImage.flush();


                    System.out.println("frame saved");
                } else {
                    System.out.println("null grabber");
                }
            } catch (FrameGrabber.Exception | RuntimeException e) {

                e.printStackTrace();
            } catch (IOException e) {

                e.printStackTrace();
            }
    }
}