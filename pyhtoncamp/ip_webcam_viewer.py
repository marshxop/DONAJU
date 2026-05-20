"""
📱 IP Webcam Viewer
====================
Accesses your phone's camera via the "IP Webcam" Android app.

SETUP:
  1. Install "IP Webcam" on your Android phone (by Pavel Khlebovich)
  2. Open the app → scroll down → tap "Start server"
  3. Note the IP shown on screen  e.g.  http://192.168.1.5:8080
  4. Set PHONE_IP below to match, then run this script.

INSTALL DEPENDENCIES:
  pip install opencv-python requests
"""

import cv2
import requests
import numpy as np

# ─────────────────────────────────────────────
#  ✏️  SET YOUR PHONE'S IP ADDRESS HERE
PHONE_IP   = "10.191.237.180:8080"   # shown in the IP Webcam app
PORT       = 8080             # default port (change if you set a custom one)
# Optional: set these if you enabled login in the app, else leave as None
USERNAME   = None
PASSWORD   = None
# ─────────────────────────────────────────────

BASE_URL   = f"http://10.191.237.180:8080/"
STREAM_URL = f"{BASE_URL}/video"   # MJPEG stream endpoint
PHOTO_URL  = f"{BASE_URL}/photo.jpg"


def get_auth():
    return (USERNAME, PASSWORD) if USERNAME else None


# ── Option 1: OpenCV MJPEG stream (recommended) ───────────────────────────────

def stream_opencv():
    """Display live video in an OpenCV window. Press Q to quit."""
    print(f"\n📡 Connecting to {STREAM_URL} ...")

    # Pass credentials in URL if needed
    if USERNAME:
        url = f"http://{USERNAME}:{PASSWORD}@{PHONE_IP}:{PORT}/video"
    else:
        url = STREAM_URL

    cap = cv2.VideoCapture(url)

    if not cap.isOpened():
        print("❌  Could not open stream. Check the IP and that the app is running.")
        return

    print("✅  Stream opened! Press Q to quit.\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️  Lost connection. Retrying...")
            cap.open(url)
            continue

        # Optional: overlay FPS
        fps = cap.get(cv2.CAP_PROP_FPS)
        h, w = frame.shape[:2]
        cv2.putText(frame, f"{w}x{h}  {fps:.0f}fps", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        cv2.imshow("📱 IP Webcam", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Stream closed.")


# ── Option 2: Requests-based MJPEG (fallback if OpenCV URL doesn't work) ─────

def stream_requests():
    """Manually parse MJPEG stream using requests. Press Ctrl+C to quit."""
    import time
    print(f"\n📡 Connecting via requests to {STREAM_URL} ...")

    auth = get_auth()
    try:
        r = requests.get(STREAM_URL, stream=True, auth=auth, timeout=10)
    except requests.ConnectionError:
        print("❌  Cannot reach the phone. Check IP and Wi-Fi.")
        return

    print("✅  Connected! Press Ctrl+C to quit.\n")

    buffer = b""
    frame_count = 0
    start = time.time()

    try:
        for chunk in r.iter_content(chunk_size=4096):
            buffer += chunk
            # JPEG frames start with FF D8 and end with FF D9
            start_idx = buffer.find(b"\xff\xd8")
            end_idx   = buffer.find(b"\xff\xd9")

            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                jpg = buffer[start_idx:end_idx + 2]
                buffer = buffer[end_idx + 2:]

                arr   = np.frombuffer(jpg, dtype=np.uint8)
                frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

                if frame is not None:
                    frame_count += 1
                    elapsed = time.time() - start
                    fps = frame_count / elapsed if elapsed > 0 else 0

                    h, w = frame.shape[:2]
                    cv2.putText(frame, f"{w}x{h}  {fps:.1f}fps", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                    cv2.imshow("📱 IP Webcam (requests)", frame)

                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
    except KeyboardInterrupt:
        pass

    cv2.destroyAllWindows()
    print(f"\nStream closed. {frame_count} frames received.")


# ── Option 3: Capture a single snapshot ──────────────────────────────────────

def capture_snapshot(save_path="snapshot.jpg"):
    """Download one JPEG frame and save it."""
    print(f"\n📸 Capturing snapshot from {PHOTO_URL} ...")
    auth = get_auth()
    try:
        r = requests.get(PHOTO_URL, auth=auth, timeout=10)
        with open(save_path, "wb") as f:
            f.write(r.content)
        print(f"✅  Saved to {save_path}")
        img = cv2.imread(save_path)
        cv2.imshow("Snapshot", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    except Exception as e:
        print(f"❌  Error: {e}")


# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 50)
    print("  📱  IP Webcam → Python Viewer")
    print("=" * 50)
    print(f"  Phone URL : {BASE_URL}")
    print(f"  Stream    : {STREAM_URL}")
    print("=" * 50)
    print("\nChoose mode:")
    print("  1 - Live stream (OpenCV)   ← recommended")
    print("  2 - Live stream (requests) ← fallback")
    print("  3 - Single snapshot")

    choice = input("\nEnter 1 / 2 / 3  [default: 1]: ").strip() or "1"

    if choice == "2":
        stream_requests()
    elif choice == "3":
        capture_snapshot()
    else:
        stream_opencv()
