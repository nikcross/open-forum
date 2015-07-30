package org.onestonesoup.javascript.helper;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Clip;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.UnsupportedAudioFileException;

public class SoundHelper {

	public static Map<String,AudioInputStream> sounds = new HashMap<String,AudioInputStream>();
	
	public static void addSound(String alias,String fileName) throws LineUnavailableException, UnsupportedAudioFileException, IOException {
            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream( new File(fileName) );
            sounds.put(alias,audioInputStream);
	}
	
	public static void playSound(String alias) throws LineUnavailableException, IOException {
		AudioInputStream audioInputStream = sounds.get(alias);
		Clip clip = AudioSystem.getClip();
		clip.open(audioInputStream);
		
	}
}
