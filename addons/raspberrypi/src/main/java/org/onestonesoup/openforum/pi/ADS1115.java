package org.onestonesoup.openforum.pi;

import com.pi4j.gpio.extension.ads.ADS1115GpioProvider;
import com.pi4j.gpio.extension.ads.ADS1115Pin;
import com.pi4j.gpio.extension.ads.ADS1x15GpioProvider;
import com.pi4j.io.gpio.GpioController;
import com.pi4j.io.gpio.event.PinAnalogValueChangeEvent;
import com.pi4j.io.gpio.event.PinEvent;
import com.pi4j.io.gpio.event.PinListener;
import com.pi4j.io.i2c.I2CFactory;

import java.io.IOException;

public class ADS1115 implements Runnable{

    private static final double THRESHOLD = 0;
    private final Thread sampler;

private long sampleTime = 0;
private double[] value = new double[4];
private double[] min = new double[4];
private double[] max = new double[4];
private double[] mean = new double[4];
private double[] samples = new double[4];
private double scaleFactor = 1;

@Override
public void run() {
    while(true) {
        try {
            Thread.sleep(1000);
            sampleTime = System.currentTimeMillis();
            for (PinListenerImpl pinListener : pinListeners) {
                pinListener.capture();
            }
        } catch (Throwable e) {
        }
    }
}

private class PinListenerImpl implements PinListener {
    private final int pinIndex;
    private int count = 0;

    private double[] lSampleData = new double[20];
    private double[] sampleData = new double[20];
    private double acc = 0;
    private double lmin = -1;
    private double lmax = -1;

    PinListenerImpl(int pinIndex ) {
        this.pinIndex = pinIndex;
    }
    @Override
    public void handlePinEvent(PinEvent pinEvent) {
        double voltage = scaleFactor * ((PinAnalogValueChangeEvent)pinEvent).getValue();

        if( lmin == -1 || lmin > voltage ) lmin = voltage;
        if( lmax < voltage ) lmax = voltage;

        count++;
        acc += voltage;
        value[pinIndex] = voltage;
        lSampleData[count%20] = voltage;
    }

    public void capture() {
        mean[pinIndex] = acc/count;
        min[pinIndex] = lmin;
        max[pinIndex] = lmax;
        samples[pinIndex] = count;
        sampleData = new double[20];
        for(int d=0;d<count;d++) sampleData[d] = lSampleData[d];

        lSampleData = new double[20];
        lmin = -1;
        lmax = -1;
        count = 0;
        acc = 0;
    }

    public double[] getSampleData() {
        return sampleData;
    }
}
private PinListenerImpl pin0Listener = new PinListenerImpl(0);
private PinListenerImpl pin1Listener = new PinListenerImpl(1);
private PinListenerImpl pin2Listener = new PinListenerImpl(2);
private PinListenerImpl pin3Listener = new PinListenerImpl(3);

private PinListenerImpl[] pinListeners = new PinListenerImpl[]{
        pin0Listener,
        pin1Listener,
        pin2Listener,
        pin3Listener
};

public ADS1115( GpioController controller, int busNumber, String scale ) throws IOException, I2CFactory.UnsupportedBusNumberException {
    ADS1x15GpioProvider.ProgrammableGainAmplifierValue scaleValue = ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_6_144V;

    switch( scale ) {
        case "6.144V":
            scaleValue = ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_6_144V;
            scaleFactor = 6.144/32767;
            break;
        case "4.096V":
            scaleValue = ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_4_096V;
            scaleFactor = 4.096/32767;
            break;
        case "2.048V":
            scaleValue = ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_2_048V;
            scaleFactor = 2.048/32767;
            break;
        case "1.024V":
            scaleValue = ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_1_024V;
            scaleFactor = 1.024/32767;
            break;
        case "0.512V":
            scaleValue = ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_0_512V;
            scaleFactor = 0.512/32767;
            break;
        case "0.256V":
            scaleValue = ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_0_256V;
            scaleFactor = 0.256/32767;
            break;
    }

    ADS1115GpioProvider provider = new ADS1115GpioProvider( busNumber, ADS1115GpioProvider.ADS1115_ADDRESS_0x48 );
    provider.setProgrammableGainAmplifier( scaleValue, ADS1115Pin.ALL );

    provider.setEventThreshold(THRESHOLD,ADS1115Pin.INPUT_A0);
    provider.setEventThreshold(THRESHOLD,ADS1115Pin.INPUT_A1);
    provider.setEventThreshold(THRESHOLD,ADS1115Pin.INPUT_A2);
    provider.setEventThreshold(THRESHOLD,ADS1115Pin.INPUT_A3);
    provider.setMonitorInterval(ADS1115GpioProvider.MIN_MONITOR_INTERVAL);

    controller.provisionAnalogInputPin(provider, ADS1115Pin.INPUT_A0);
    provider.addListener(ADS1115Pin.INPUT_A0,pin0Listener);
    controller.provisionAnalogInputPin(provider, ADS1115Pin.INPUT_A1);
    provider.addListener(ADS1115Pin.INPUT_A1,pin1Listener);
    controller.provisionAnalogInputPin(provider, ADS1115Pin.INPUT_A2);
    provider.addListener(ADS1115Pin.INPUT_A2,pin2Listener);
    controller.provisionAnalogInputPin(provider, ADS1115Pin.INPUT_A3);
    provider.addListener(ADS1115Pin.INPUT_A3,pin3Listener);

    sampler = new Thread(this);
    sampler.start();
}

public long getSampleTime() {
    return sampleTime;
}

public double getSamples( int pinIndex ) {
    return samples[pinIndex];
}

public double[] getSampleData( int pinIndex ) {
    return pinListeners[pinIndex].getSampleData();
}

public double getVoltage( int pinIndex ) {
    return value[pinIndex];
}

public double getMin( int pinIndex ) {
    return min[pinIndex];
}

public double getMax( int pinIndex ) {
    return max[pinIndex];
}

public double getMean( int pinIndex ) {
    return mean[pinIndex];
}

}
