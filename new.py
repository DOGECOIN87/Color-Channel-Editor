import cv2
import tkinter as tk
from tkinter import filedialog, messagebox
from tkinter import ttk
from PIL import Image, ImageTk
import threading
import numpy as np
import queue
import time
import os

class MediaApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Media Processing App")
        self.root.configure(bg='#2b2b2b')

        self.cap = None
        self.image = None
        self.original_frame = None
        self.processed_frame = None
        self.processing = False
        self.frame_queue = queue.Queue(maxsize=1)
        self.video_writer = None
        self.is_video = False
        self.current_file_path = None
        self.video_paused = False

        self.setup_ui()

        self.video_thread = threading.Thread(target=self.video_processing, daemon=True)
        self.video_thread.start()

        self.update_gui()

    def setup_ui(self):
        self.root.grid_columnconfigure(0, weight=3)
        self.root.grid_columnconfigure(1, weight=1)

        self.media_canvas = tk.Canvas(self.root, bg='black', width=800, height=600)
        self.media_canvas.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

        right_panel = ttk.Frame(self.root, style='Dark.TFrame')
        right_panel.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")

        self.upload_video_btn = ttk.Button(right_panel, text="Load Video", command=self.load_video, style='Dark.TButton')
        self.upload_video_btn.pack(pady=5)

        self.upload_photo_btn = ttk.Button(right_panel, text="Load Image", command=self.load_image, style='Dark.TButton')
        self.upload_photo_btn.pack(pady=5)

        self.replay_btn = ttk.Button(right_panel, text="Replay Video", command=self.replay_video, style='Dark.TButton')
        self.replay_btn.pack(pady=5)

        color_spaces = [
            "Original", "RGB R", "RGB G", "RGB B", "YCbCr Y", "YCbCr Cb", "YCbCr Cr",
            "YUV Y", "YUV U", "YUV V", "HSV H", "HSV S", "HSV V",
            "HLS H", "HLS L", "HLS S", "XYZ X", "XYZ Y", "XYZ Z",
            "Lab L", "Lab a", "Lab b", "Luv L", "Luv u", "Luv v",
            "CMYK C", "CMYK M", "CMYK Y", "CMYK K"
        ]
        self.selected_channel = tk.StringVar(value="Original")
        ttk.Label(right_panel, text="Select Color Channel:", style='Dark.TLabel').pack(pady=5)
        self.channel_menu = ttk.Combobox(right_panel, textvariable=self.selected_channel, values=color_spaces, style='Dark.TCombobox')
        self.channel_menu.pack(pady=5)
        self.channel_menu.bind("<<ComboboxSelected>>", lambda e: self.update_media())

        self.channel_strength = tk.DoubleVar(value=1.0)
        ttk.Label(right_panel, text="Channel Strength:", style='Dark.TLabel').pack(pady=5)
        self.strength_slider = ttk.Scale(right_panel, from_=0, to=2, orient='horizontal', style='Dark.Horizontal.TScale', variable=self.channel_strength)
        self.strength_slider.pack(pady=5, fill='x', expand=True)
        self.strength_slider.bind("<Motion>", lambda e: self.update_media())

        self.save_btn = ttk.Button(right_panel, text="Save", command=self.save_processed, style='Dark.TButton')
        self.save_btn.pack(pady=5)

    def load_video(self):
        file_path = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.avi *.mov")])
        if file_path:
            self.cap = cv2.VideoCapture(file_path)
            self.image = None
            self.original_frame = None
            self.processing = True
            self.is_video = True
            self.current_file_path = file_path
            self.video_paused = False

    def load_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg *.jpeg *.png *.bmp")])
        if file_path:
            self.image = cv2.imread(file_path)
            self.cap = None
            self.original_frame = self.image.copy()
            self.display_frame(self.original_frame)
            self.is_video = False
            self.current_file_path = file_path

    def video_processing(self):
        while True:
            if self.cap and self.cap.isOpened() and self.processing and not self.video_paused:
                ret, frame = self.cap.read()
                if ret:
                    self.original_frame = frame.copy()
                    processed_frame = self.process_frame(frame)
                    if not self.frame_queue.full():
                        self.frame_queue.put(processed_frame)
                else:
                    self.video_paused = True
            else:
                time.sleep(0.1)

    def update_gui(self):
        try:
            frame = self.frame_queue.get_nowait()
            self.processed_frame = frame
            self.display_frame(frame)
        except queue.Empty:
            pass
        
        if self.image is not None and self.original_frame is not None:
            processed_frame = self.process_frame(self.original_frame)
            self.processed_frame = processed_frame
            self.display_frame(processed_frame)

        self.root.after(30, self.update_gui)

    def update_media(self):
        if self.original_frame is not None:
            processed_frame = self.process_frame(self.original_frame)
            self.processed_frame = processed_frame
            self.display_frame(processed_frame)

    def process_frame(self, frame):
        if self.original_frame is None:
            return frame

        if self.selected_channel.get() == "Original":
            return frame

        frame = cv2.convertScaleAbs(frame)
        
        channel = self.selected_channel.get().split()
        color_space = channel[0]
        channel_name = channel[1] if len(channel) > 1 else None
        strength = self.channel_strength.get()

        frame = self.apply_channel(frame, color_space, channel_name, strength)
        return frame

    def apply_channel(self, frame, color_space, channel_name, strength):
        if color_space == "RGB":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        elif color_space == "YCbCr":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
        elif color_space == "YUV":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)
        elif color_space == "HSV":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        elif color_space == "HLS":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HLS)
        elif color_space == "XYZ":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2XYZ)
        elif color_space == "Lab":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2Lab)
        elif color_space == "Luv":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2Luv)
        elif color_space == "CMYK":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2YCrCb)

        channels = list(cv2.split(frame))

        if channel_name == "R" or channel_name == "Y":
            channel_idx = 0
        elif channel_name == "G" or channel_name == "Cb" or channel_name == "U":
            channel_idx = 1
        elif channel_name == "B" or channel_name == "Cr" or channel_name == "V":
            channel_idx = 2
        else:
            channel_idx = 0

        channels[channel_idx] = cv2.convertScaleAbs(channels[channel_idx], alpha=strength)
        frame = cv2.merge(channels)
        return frame

    def display_frame(self, frame):
        frame_height, frame_width = frame.shape[:2]
        canvas_width = self.media_canvas.winfo_width()
        canvas_height = self.media_canvas.winfo_height()

        scale = min(canvas_width / frame_width, canvas_height / frame_height)
        new_width = int(frame_width * scale)
        new_height = int(frame_height * scale)
        frame = cv2.resize(frame, (new_width, new_height))

        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame)
        imgtk = ImageTk.PhotoImage(image=img)
        self.media_canvas.create_image(0, 0, anchor=tk.NW, image=imgtk)
        self.media_canvas.image = imgtk

    def save_processed(self):
        if self.processed_frame is None:
            tk.messagebox.showwarning("Warning", "No processed media to save.")
            return

        if self.is_video:
            self.save_processed_video()
        else:
            self.save_processed_image()

    def save_processed_image(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".png",
                                                 filetypes=[("PNG files", "*.png"),
                                                            ("JPEG files", "*.jpg"),
                                                            ("All files", "*.*")])
        if file_path:
            cv2.imwrite(file_path, cv2.cvtColor(self.processed_frame, cv2.COLOR_RGB2BGR))
            tk.messagebox.showinfo("Success", f"Image saved as {os.path.basename(file_path)}")

    def save_processed_video(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".mp4",
                                                 filetypes=[("MP4 files", "*.mp4"),
                                                            ("AVI files", "*.avi"),
                                                            ("All files", "*.*")])
        if file_path:
            # Get original video properties
            original_fps = self.cap.get(cv2.CAP_PROP_FPS)
            frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Create VideoWriter object
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(file_path, fourcc, original_fps, (frame_width, frame_height))

            # Reset video to start
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

            # Process and write each frame
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    break
                processed_frame = self.process_frame(frame)
                out.write(cv2.cvtColor(processed_frame, cv2.COLOR_RGB2BGR))

            # Release resources
            out.release()
            
            # Reset video to start
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

            tk.messagebox.showinfo("Success", f"Video saved as {os.path.basename(file_path)}")

    def replay_video(self):
        if self.is_video and self.cap:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            self.video_paused = False
            self.processing = True

if __name__ == "__main__":
    root = tk.Tk()
    style = ttk.Style()
    style.theme_use('clam')
    style.configure('Dark.TFrame', background='#2b2b2b')
    style.configure('Dark.TButton', background='#3c3c3c', foreground='white')
    style.configure('Dark.TLabel', background='#2b2b2b', foreground='white')
    style.configure('Dark.TCombobox', background='#3c3c3c', foreground='white')
    style.configure('Dark.TCheckbutton', background='#2b2b2b', foreground='white')
    style.configure('Dark.Horizontal.TScale', background='#2b2b2b', troughcolor='#3c3c3c')

    app = MediaApp(root)
    root.mainloop()