import win32gui
import win32ui
import win32con
import win32api
from PIL import Image

def capture_window_screenshot(window_title):
    """
    Captures a screenshot of a specific window, even if it's hidden.

    Args:
        window_title: The exact title of the window to capture.

    Returns:
        A PIL Image object containing the screenshot, or None if the window
        is not found or an error occurs.
    """
    try:
        # Find the window by its title
        hwnd = win32gui.FindWindow(None, window_title)
        if hwnd == 0:
            print(f"Window '{window_title}' not found.")
            return None

        # Get the window's device context (DC)
        wDC = win32gui.GetWindowDC(hwnd)
        dcObj = win32ui.CreateDCFromHandle(wDC)
        cDC = dcObj.CreateCompatibleDC()

        # Get window size information
        left, top, right, bottom = win32gui.GetWindowRect(hwnd)
        width = right - left
        height = bottom - top

        # Create a bitmap to store the screenshot
        dataBitMap = win32ui.CreateBitmap()
        dataBitMap.CreateCompatibleBitmap(dcObj, width, height)

        # Select the bitmap into the compatible DC
        cDC.SelectObject(dataBitMap)

        # Copy the window content to the bitmap using BitBlt
        # win32con.SRCCOPY is the flag that specifies a direct copy
        cDC.BitBlt((0, 0), (width, height), dcObj, (0, 0), win32con.SRCCOPY)

        # Get the bitmap data as a string of bytes
        signedIntsArray = dataBitMap.GetBitmapBits(True)

        # Create a PIL Image from the bitmap data
        img = Image.frombuffer(
            'RGB',
            (width, height),
            signedIntsArray, 'raw', 'BGRX', 0, 1)

        # Free up resources (important to avoid memory leaks)
        dcObj.DeleteDC()
        cDC.DeleteDC()
        win32gui.ReleaseDC(hwnd, wDC)
        win32gui.DeleteObject(dataBitMap.GetHandle())

        return img

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# Example Usage:
window_title_to_capture = "Taunahi v3.0.73-stable | Garden | pvty"  # Replace with the actual title of your target window

screenshot = capture_window_screenshot(window_title_to_capture)

if screenshot:
    screenshot.save("captured_window.png")
    print(f"Screenshot of '{window_title_to_capture}' saved to captured_window.png")