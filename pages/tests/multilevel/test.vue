<template>
    <div class="app">
      <h1>WavRecorder class Usage</h1>
  
      <button @click="startRecording">Start</button>
      <br />
      <br />
      <button @click="stopRecording">Stop</button>
      <br />
      <br />
      <button @click="download16Bit">Download 16 bit</button>
      <br />
      <br />
      <button @click="download32Bit">Download 32 bit</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { WavRecorder } from "webm-to-wav-converter";
  
  const recorder = ref(null); // To hold the WavRecorder instance
  
  // Initialize WavRecorder
  onMounted(() => {
    recorder.value = new WavRecorder();
  });
  
  // Start recording
  const startRecording = () => {
    recorder.value.start();
  };
  
  // Stop recording
  const stopRecording = () => {
    recorder.value.stop();
    console.log(recorder.value);
    
  };
  
  // Download 16-bit WAV file
  const download16Bit = () => {
    recorder.value.download(); // Default is 16-bit
  };
  
  // Download 32-bit WAV file
  const download32Bit = () => {
    recorder.value.download("MyWAVFile", true); // 32-bit WAV with a custom filename
  };
  </script>
  
  <style scoped>
  button {
    cursor: pointer;
    padding: 10px;
    margin: 10px;
    font-size: 16px;
  }
  
  button:hover {
    background-color: #3b82f6;
  }
  </style>
  