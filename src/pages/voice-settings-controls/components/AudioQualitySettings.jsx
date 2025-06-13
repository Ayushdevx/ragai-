import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const AudioQualitySettings = ({ settings, onSettingChange }) => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [frequencyData, setFrequencyData] = useState(new Array(32).fill(0));

  useEffect(() => {
    // Get available audio devices
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAvailableDevices(audioInputs);
    });

    // Cleanup audio context on unmount
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  const audioFormats = [
    { value: 'webm', label: 'WebM (Recommended)', description: 'Best compression and quality' },
    { value: 'mp4', label: 'MP4', description: 'Wide compatibility' },
    { value: 'wav', label: 'WAV', description: 'Uncompressed, highest quality' },
    { value: 'ogg', label: 'OGG', description: 'Open source format' }
  ];

  const sampleRates = [
    { value: '8000', label: '8 kHz', description: 'Phone quality' },
    { value: '16000', label: '16 kHz', description: 'Voice recognition' },
    { value: '22050', label: '22.05 kHz', description: 'Radio quality' },
    { value: '44100', label: '44.1 kHz', description: 'CD quality' },
    { value: '48000', label: '48 kHz', description: 'Professional' }
  ];

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 64;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateFrequencyData = () => {
        analyser.getByteFrequencyData(dataArray);
        setFrequencyData([...dataArray]);
        requestAnimationFrame(updateFrequencyData);
      };
      
      updateFrequencyData();
      setAudioContext(context);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setFrequencyData(new Array(32).fill(0));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Audio Quality Settings</h2>
        <p className="text-text-secondary">Configure microphone input, audio processing, and recording quality settings.</p>
      </div>

      <div className="space-y-8">
        {/* Microphone Source */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Mic" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Microphone Source</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Input Device
            </label>
            <select
              value={settings.microphoneSource}
              onChange={(e) => onSettingChange('microphoneSource', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="default">Default Microphone</option>
              {availableDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Visualization */}
          <div className="p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-text-primary">Audio Input Visualization</h4>
                <p className="text-sm text-text-secondary">Real-time frequency analysis</p>
              </div>
              <button
                onClick={audioContext ? stopAudioVisualization : startAudioVisualization}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  audioContext
                    ? 'bg-error text-white hover:bg-error-700' :'bg-primary text-white hover:bg-primary-700'
                }`}
              >
                {audioContext ? 'Stop' : 'Start'} Visualization
              </button>
            </div>
            
            <div className="h-24 bg-surface border border-border rounded-lg p-4 flex items-end justify-center space-x-1">
              {frequencyData.map((value, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-primary to-accent rounded-t-sm transition-all duration-100"
                  style={{
                    height: `${Math.max(2, (value / 255) * 100)}%`,
                    width: '6px'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Processing */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Waves" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Audio Processing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary">Noise Cancellation</h4>
                  <p className="text-sm text-text-secondary">Reduce background noise</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.noiseCancellation}
                    onChange={(e) => onSettingChange('noiseCancellation', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary">Echo Cancellation</h4>
                  <p className="text-sm text-text-secondary">Prevent audio feedback</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.echoCancellation}
                    onChange={(e) => onSettingChange('echoCancellation', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary">Auto Gain Control</h4>
                  <p className="text-sm text-text-secondary">Automatic volume adjustment</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Processing Effects</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Low-pass Filter</span>
                  <select className="px-3 py-1 text-sm bg-secondary-50 border border-border rounded">
                    <option value="off">Off</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">High-pass Filter</span>
                  <select className="px-3 py-1 text-sm bg-secondary-50 border border-border rounded">
                    <option value="off">Off</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Compressor</span>
                  <select className="px-3 py-1 text-sm bg-secondary-50 border border-border rounded">
                    <option value="off">Off</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Quality */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="HardDrive" size={20} className="text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Recording Quality</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Audio Format
              </label>
              <div className="space-y-2">
                {audioFormats.map((format) => (
                  <label
                    key={format.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      settings.audioFormat === format.value
                        ? 'border-primary bg-primary-50' :'border-border hover:border-secondary-300 hover:bg-secondary-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="audioFormat"
                      value={format.value}
                      checked={settings.audioFormat === format.value}
                      onChange={(e) => onSettingChange('audioFormat', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-text-primary">{format.label}</span>
                        {settings.audioFormat === format.value && (
                          <Icon name="Check" size={16} className="text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{format.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Sample Rate
              </label>
              <div className="space-y-2">
                {sampleRates.map((rate) => (
                  <label
                    key={rate.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      settings.sampleRate === rate.value
                        ? 'border-primary bg-primary-50' :'border-border hover:border-secondary-300 hover:bg-secondary-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sampleRate"
                      value={rate.value}
                      checked={settings.sampleRate === rate.value}
                      onChange={(e) => onSettingChange('sampleRate', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-text-primary">{rate.label}</span>
                        {settings.sampleRate === rate.value && (
                          <Icon name="Check" size={16} className="text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{rate.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Impact */}
        <div className="p-4 bg-warning-50 border border-warning-100 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-warning-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-warning-800">Performance Impact</h4>
              <p className="text-sm text-warning-700 mt-1">
                Higher quality settings may increase processing time and bandwidth usage. 
                For real-time conversations, consider using medium quality settings for optimal performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioQualitySettings;