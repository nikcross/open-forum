package org.onestonesoup.openforum.pi;

import com.pi4j.io.gpio.*;
import com.pi4j.io.i2c.I2CBus;
import com.pi4j.io.i2c.I2CFactory;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class Pi4Js {
    private GpioController controller;
    private Map<String, Object> devices;
    private static final String DEVICE_ADS1115 = "ADS1115";

    public Pi4Js() {
        controller = GpioFactory.getInstance();
        devices = new HashMap<>();
    }

    public static void main(String[] args) {
        System.out.println( "Pi4Js v" + new Pi4Js().getVersion() );
    }

    public String getVersion() {
        return "4.1.6";
    }

    public Pin getPinByName(String name) {
        return RaspiPin.getPinByName(name);
    }

    public Pin getPinByAddress(int address) {
        return RaspiPin.getPinByAddress(address);
    }

    public Collection<GpioPin> getProvisionedPins() {
        return controller.getProvisionedPins();
    }

    public GpioPin getProvisionedPin(String label){
        return controller.getProvisionedPin( label );
    }

    public GpioPinDigitalInput provisionPinAsInput(Pin pin) {
        return controller.provisionDigitalInputPin(pin, PinPullResistance.PULL_DOWN);
    }

    public GpioPinDigitalInput provisionPinAsPullUpInput(Pin pin) {
        return controller.provisionDigitalInputPin(pin, PinPullResistance.PULL_UP);
    }

    public GpioPinDigitalInput provisionPinAsPullDownInput(Pin pin) {
        return controller.provisionDigitalInputPin(pin, PinPullResistance.PULL_DOWN);
    }

    public boolean getState(GpioPinDigitalInput pin) {
        PinState state = controller.getState(pin);
        return state.isHigh();
    }

    public GpioPinDigitalOutput provisionPinAsOutput(Pin pin) {
        return controller.provisionDigitalOutputPin(pin, PinState.LOW);
    }

    public void setState(GpioPinDigitalOutput pin, boolean state) {
        pin.setState(state);
    }

    public void unprovisionPin(GpioPinDigital pin) {
        controller.unprovisionPin(pin);
    }

    public int[] getI2CBusIds() throws IOException {
        return I2CFactory.getBusIds();
    }

    public I2CBus getI2CBus(int busNumber ) throws IOException, I2CFactory.UnsupportedBusNumberException {
        return I2CFactory.getInstance( busNumber );
    }

    public I2CBus getI2CBus(int busNumber, long lockAquireTimeout) throws IOException, I2CFactory.UnsupportedBusNumberException {

        return I2CFactory.getInstance( busNumber, lockAquireTimeout, TimeUnit.MILLISECONDS);
    }

    public ADS1115 getADS1115() throws IOException, I2CFactory.UnsupportedBusNumberException {
        return new ADS1115(controller,1, "6.144V");
    }

    public ADS1115 getADS1115(String scale) throws IOException, I2CFactory.UnsupportedBusNumberException {

        ADS1115 ads = (ADS1115)devices.get(DEVICE_ADS1115);
        if(ads==null) {
            ads = new ADS1115(controller,1, scale);
            devices.put(DEVICE_ADS1115,ads);
        }
        return ads;
    }
}
