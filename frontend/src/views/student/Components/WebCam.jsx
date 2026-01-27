import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import Webcam from 'react-webcam';
import swal from 'sweetalert';
import { drawRect } from './utilities';
import { Box } from '@mui/material';

export default function WebCamComponent({ cheatingLog, updateCheatingLog, onEvent }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [model, setModel] = useState(null);
  const [detectionStats, setDetectionStats] = useState({ runs: 0, detections: 0 });

  // Load COCO-SSD model with optimal settings
  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        console.log('[WebCam] Starting TensorFlow.js initialization...');

        // Set backend to WebGL for better performance, with CPU fallback
        await tf.ready();
        console.log('[WebCam] TensorFlow backend:', tf.getBackend());

        // Load COCO-SSD with base model optimized for detection accuracy
        console.log('[WebCam] Loading COCO-SSD model...');
        const net = await cocossd.load({
          base: 'mobilenet_v2' // Better accuracy than lite version
        });

        if (!cancelled) {
          setModel(net);
          console.log('[WebCam] ✓ COCO-SSD model loaded successfully');
        }
      } catch (error) {
        console.error('[WebCam] Model loading error:', error);
        setCameraError('Failed to load detection model: ' + error.message);
      }
    };

    loadModel();
    return () => { cancelled = true; };
  }, []);

  const lastDetectRef = useRef(0);
  const lastAlertRef = useRef({}); // Track alerts per type to avoid spam
  const prevStateRef = useRef(null); // Track previous malpractice states for incident detection
  const baselinePersonSizeRef = useRef(null); // Track normal person size to detect leaning
  const detectionCountRef = useRef(0);

  const runDetection = useCallback(async () => {
    if (!model) {
      return;
    }

    const video = webcamRef.current?.video;
    if (!video) {
      console.warn('[WebCam] Video element not available');
      return;
    }

    if (video.readyState !== 4) {
      return; // Video not ready
    }

    const now = Date.now();
    // Run detection every 1000ms (1 second) for more liberal monitoring
    if (now - lastDetectRef.current < 1000) return;
    lastDetectRef.current = now;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      console.warn('[WebCam] Video dimensions not ready:', videoWidth, 'x', videoHeight);
      return;
    }

    // Update canvas dimensions
    if (canvasRef.current) {
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, videoWidth, videoHeight);
    }

    try {
      detectionCountRef.current++;

      // Run detection with relaxed threshold of 0.4 (40% confidence) for more liberal detection
      const predictions = await model.detect(video, undefined, 0.4);

      // Log detection stats every 10 runs
      if (detectionCountRef.current % 10 === 0) {
        console.log(`[WebCam] Detection #${detectionCountRef.current}:`, predictions.length, 'objects found');
        if (predictions.length > 0) {
          console.log('[WebCam] Detected objects:', predictions.map(p => `${p.class} (${(p.score * 100).toFixed(1)}%)`).join(', '));
        }
      }

      // Draw bounding boxes
      if (canvasRef.current && predictions.length > 0) {
        const ctx = canvasRef.current.getContext('2d');
        drawRect(predictions, ctx);
      }

      // Analyze predictions
      const persons = predictions.filter(p => p.class === 'person');
      const cellPhones = predictions.filter(p => p.class === 'cell phone');
      const books = predictions.filter(p => p.class === 'book');

      const hasPerson = persons.length > 0;
      const hasMultipleFaces = persons.length > 1;
      const hasCellPhone = cellPhones.length > 0;
      const hasBook = books.length > 0;

      // Track person size to detect leaning back
      let isLeaningBack = false;
      if (hasPerson && persons.length === 1) {
        const person = persons[0];
        const [x, y, width, height] = person.bbox;
        const currentSize = width * height;

        if (!baselinePersonSizeRef.current) {
          baselinePersonSizeRef.current = currentSize;
        } else {
          const sizeRatio = currentSize / baselinePersonSizeRef.current;
          if (sizeRatio < 0.7) {
            isLeaningBack = true;
          }
          baselinePersonSizeRef.current = baselinePersonSizeRef.current * 0.95 + currentSize * 0.05;
        }
      }

      // Update detection stats
      setDetectionStats(prev => ({
        runs: prev.runs + 1,
        detections: prev.detections + predictions.length
      }));

      // === INCIDENT-BASED MALPRACTICE DETECTION (State Change Only) ===

      // Track previous states to detect NEW incidents only
      if (!prevStateRef.current) {
        prevStateRef.current = { noFace: false, multipleFace: false, cellPhone: false, book: false, leaning: false };
      }

      const prev = prevStateRef.current;

      // Helper to capture and update log
      const captureIncident = (type, newCountField, countValue, evt) => {
        const screenshot = webcamRef.current?.getScreenshot();
        updateCheatingLog(prevLog => {
          const newLog = { ...prevLog, [newCountField]: countValue };
          if (screenshot) {
            newLog.screenshots = [...(prevLog.screenshots || []), { image: screenshot, type }];
          }
          return newLog;
        });

        if (!lastAlertRef.current[type] || (now - lastAlertRef.current[type] > 10000)) {
          lastAlertRef.current[type] = now;
          onEvent && onEvent(evt);
        }
      };

      // 1. NO FACE
      if (!hasPerson && !prev.noFace) {
        const newCount = (cheatingLog.noFaceCount || 0) + 1;
        console.log('[WebCam] 🚨 NEW INCIDENT: No face detected!');
        captureIncident('noFace', 'noFaceCount', newCount, { type: 'noFace', message: 'Face Not Visible!', severity: 'error' });
      }

      // 2. MULTIPLE FACES
      if (hasMultipleFaces && !prev.multipleFace) {
        const newCount = (cheatingLog.multipleFaceCount || 0) + 1;
        console.log('[WebCam] 🚨 NEW INCIDENT: Multiple faces detected!');
        captureIncident('multipleFace', 'multipleFaceCount', newCount, { type: 'multipleFace', message: `${persons.length} Faces Detected!`, severity: 'error' });
      }

      // 3. CELL PHONE
      if (hasCellPhone && !prev.cellPhone) {
        const newCount = (cheatingLog.cellPhoneCount || 0) + 1;
        console.log('[WebCam] 🚨 NEW INCIDENT: Cell phone detected!');
        captureIncident('cellPhone', 'cellPhoneCount', newCount, { type: 'cellPhone', message: 'Cell Phone Detected!', severity: 'error' });
      }

      // 4. PROHIBITED OBJECT (BOOK)
      if (hasBook && !prev.book) {
        const newCount = (cheatingLog.prohibitedObjectCount || 0) + 1;
        console.log('[WebCam] 🚨 NEW INCIDENT: Prohibited object detected!');
        captureIncident('prohibitedObject', 'prohibitedObjectCount', newCount, { type: 'prohibitedObject', message: 'Prohibited Object Detected!', severity: 'warning' });
      }

      // 5. LEANING BACK
      if (isLeaningBack && !prev.leaning) {
        const newCount = (cheatingLog.prohibitedObjectCount || 0) + 1;
        console.log('[WebCam] 🚨 NEW INCIDENT: Leaning back detected!');
        captureIncident('leaning', 'prohibitedObjectCount', newCount, { type: 'suspicious', message: 'Leaning Back - Suspicious!', severity: 'warning' });
      }

      // Update state for next frame
      prevStateRef.current = {
        noFace: !hasPerson,
        multipleFace: hasMultipleFaces,
        cellPhone: hasCellPhone,
        book: hasBook,
        leaning: isLeaningBack
      };

    } catch (error) {
      console.error('[WebCam] Detection error:', error);
    }
  }, [model, updateCheatingLog, onEvent]);

  // Animation loop for continuous detection
  useEffect(() => {
    if (!isCameraReady || !model) return;

    console.log('[WebCam] Starting detection loop...');
    let animationId;

    const loop = () => {
      runDetection();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        console.log('[WebCam] Detection loop stopped');
      }
    };
  }, [isCameraReady, model, runDetection]);

  const handleUserMedia = () => {
    console.log('[WebCam] ✓ Camera stream started successfully');
    console.log('[WebCam] Video element:', webcamRef.current?.video);
    setIsCameraReady(true);
  };

  const handleUserMediaError = (error) => {
    console.error('[WebCam] Camera access error:', error);
    setCameraError('Camera access denied. Please allow camera permissions.');
  };

  // Optimized video constraints for universal compatibility
  const videoConstraints = {
    width: { ideal: 640, min: 320 },
    height: { ideal: 480, min: 240 },
    facingMode: 'user',
    frameRate: { ideal: 15, max: 30 } // Lower framerate for better performance
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 0,
        paddingBottom: '75%', // 4:3 aspect ratio
        bgcolor: '#000',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: isCameraReady ? '0 0 0 3px #4caf50' : '0 0 0 1px rgba(255,255,255,0.1)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {cameraError ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            color: '#f44336',
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.9)',
            fontSize: '0.9rem',
          }}
        >
          {cameraError}
        </Box>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            muted
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scale(1.3)', // Zoom in 30% to focus on person
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Loading overlay */}
      {!isCameraReady && !cameraError && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            p: 2,
            borderRadius: 2,
            zIndex: 15,
          }}
        >
          <Box sx={{ fontSize: '1rem', mb: 0.5 }}>Loading Camera...</Box>
          <Box sx={{ fontSize: '0.8rem', opacity: 0.8 }}>(Please Allow Permission)</Box>
          {model && <Box sx={{ fontSize: '0.75rem', mt: 1, color: '#4caf50' }}>✓ AI Model Ready</Box>}
        </Box>
      )}

      {/* LIVE badge */}
      {isCameraReady && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: '#4caf50',
            color: 'white',
            px: 2,
            py: 0.75,
            borderRadius: 1.5,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            zIndex: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'white',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
          LIVE
        </Box>
      )}


    </Box>
  );
}
